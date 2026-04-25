import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import Groq from "groq-sdk";
import { query } from '@/lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "🔴 Chiqim" }, { text: "🟢 Kirim" }],
      [{ text: "📊 Statistika" }, { text: "🌐 Saytga o'tish" }]
    ],
    resize_keyboard: true,
    persistent: true
  }
};

async function parseTransaction(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Siz professional moliya tahlilchisiz. 
        MUHIM QOIDALAR:
        1. FAQAT O'ZBEK LOTIN tilida ishlang.
        2. Agar xabarda SUMMA (son) bo'lmasa, "amount": null qaytaring.
        3. Yo'nalish: Agar aniq aytilmasa, "expense" (Chiqim) deb oling.
        4. Kategoriya: Agar aniq bo'lmasa "Boshqa" deb oling.
        5. Javob formati faqat JSON: {"amount": number|null, "type": "income"|"expense", "category": string, "note": string}`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const update = body;

    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const userId = update.message?.from?.id || update.callback_query?.from?.id;
    
    if (!chatId || !userId) return NextResponse.json({ ok: true });

    let { rows } = await query('SELECT * FROM profiles WHERE telegram_id = $1', [userId]);
    let profile = rows[0];

    if (!profile) {
      const { rows: newProfileRows } = await query(
        'INSERT INTO profiles (telegram_id, business_name) VALUES ($1, $2) RETURNING *',
        [userId, update.message?.from?.first_name || 'Mening Biznesim']
      );
      profile = newProfileRows[0];
      await bot.telegram.sendMessage(chatId, "<b>Xush kelibsiz!</b> Siz uchun yangi profil yaratildi. 🚀", { parse_mode: 'HTML', ...mainKeyboard });
    }

    if (update.callback_query) {
      const data = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;
      const [action, ...params] = data.split(':');

      if (action === 'type') {
        const type = params[0];
        const categories = type === 'expense' 
          ? [['🍳 Nonushta', '🍱 Tushlik', '🌙 Kechki ovqat'], ['🚕 Taxi', '⛽️ Benzin', '🛒 Bozor'], ['💡 Kommunal', '➕ Boshqa']]
          : [['💰 Savdo', '💵 Ish haqi', '📈 Foyda'], ['🔄 Qarz qaytdi', '➕ Boshqa']];

        await bot.telegram.editMessageText(chatId, messageId, undefined, "Kategoriyani tanlang:", {
          reply_markup: {
            inline_keyboard: [
              ...categories.map(row => row.map(cat => ({ text: cat, callback_data: `cat:${type}:${cat}` }))),
              [{ text: "🏘 Asosiy menyu", callback_data: "menu" }]
            ]
          }
        });
      }

      else if (action === 'cat') {
        const [type, cat] = params;
        const amounts = [30000, 50000, 75000, 150000, 300000, 500000];
        await bot.telegram.editMessageText(chatId, messageId, undefined, `[${cat}] uchun summani tanlang:`, {
          reply_markup: {
            inline_keyboard: [
              ...Array.from({ length: Math.ceil(amounts.length / 2) }, (_, i) => 
                amounts.slice(i * 2, i * 2 + 2).map(amt => ({ text: `${amt.toLocaleString()} UZS`, callback_data: `save:${type}:${cat}:${amt}` }))
              ),
              [{ text: "⌨️ Boshqa summa", callback_data: `manual:${type}:${cat}` }],
              [{ text: "🏘 Asosiy menyu", callback_data: "menu" }]
            ]
          }
        });
      }

      else if (action === 'save') {
        const [type, cat, amt] = params;
        await query(
          'INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)',
          [profile.id, amt, type, cat, `Tugma orqali: ${cat}`]
        );
        const typeEmoji = type === 'income' ? '🟢 <b>Kirim</b>' : '🔴 <b>Chiqim</b>';
        
        // Eski tugmalarni o'chirib yuboramiz
        try {
          await bot.telegram.deleteMessage(chatId, messageId);
        } catch (e) {
          console.error("Delete error:", e);
        }

        await bot.telegram.sendMessage(chatId, `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${Number(amt).toLocaleString()} UZS\n📊 <b>Turi:</b> ${typeEmoji}\n🗂 <b>Kategoriya:</b> ${cat}\n\n<i>Dashboardda yangilandi.</i> 📈`, { parse_mode: 'HTML', ...mainKeyboard });
      }

      else if (action === 'menu') {
        await bot.telegram.sendMessage(chatId, "Tanlang:", mainKeyboard);
      }

      return NextResponse.json({ ok: true });
    }

    if (update.message?.voice) {
      const feedback = await bot.telegram.sendMessage(chatId, "🎤 Ovoz tahlil qilinmoqda...");
      try {
        const fileId = update.message.voice.file_id;
        const fileLink = await bot.telegram.getFileLink(fileId);
        const res = await fetch(fileLink.href);
        const buffer = Buffer.from(await res.arrayBuffer());
        
        const transcription = await groq.audio.transcriptions.create({
          file: await Groq.toFile(buffer, "voice.ogg"),
          model: "whisper-large-v3",
          language: "uz" 
        });

        const parsed = await parseTransaction(transcription.text);
        if (!parsed.amount) {
          await bot.telegram.deleteMessage(chatId, feedback.message_id);
          await bot.telegram.sendMessage(chatId, "⚠️ <b>Summani aniqlab bo'lmadi.</b>\nIltimos, summani aniqroq ayting.", { parse_mode: 'HTML', ...mainKeyboard });
          return NextResponse.json({ ok: true });
        }

        await query(
          'INSERT INTO transactions (user_id, amount, type, category, note, voice_transcription) VALUES ($1, $2, $3, $4, $5, $6)',
          [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || transcription.text, transcription.text]
        );

        const typeEmoji = parsed.type === 'income' ? '🟢 <b>Kirim</b>' : '🔴 <b>Chiqim</b>';
        await bot.telegram.deleteMessage(chatId, feedback.message_id);
        await bot.telegram.sendMessage(chatId, `<b>Ovozli xabar saqlandi!</b> 🎤✅\n\n💰 <b>Summa:</b> ${parsed.amount.toLocaleString()} UZS\n📊 <b>Turi:</b> ${typeEmoji}\n🗂 <b>Kategoriya:</b> ${parsed.category || 'Boshqa'}\n📝 <b>Izoh:</b> ${parsed.note}\n\n<i>Dashboardda yangilandi.</i> 📈`, { parse_mode: 'HTML', ...mainKeyboard });
      } catch (err: any) {
        await bot.telegram.sendMessage(chatId, `❌ Xatolik: ${err.message}`, mainKeyboard);
      }
    }

    if (update.message?.text) {
      const text = update.message.text;
      if (text === '/start' || text === '🏘 Asosiy menyu') {
        await bot.telegram.sendMessage(chatId, "Assalomu alaykum! Tanlang:", mainKeyboard);
      } else if (text === '🔴 Chiqim') {
        await bot.telegram.sendMessage(chatId, "Kategoriyani tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🍳 Nonushta', callback_data: 'cat:expense:Nonushta' }, { text: '🍱 Tushlik', callback_data: 'cat:expense:Tushlik' }],
              [{ text: '🌙 Kechki ovqat', callback_data: 'cat:expense:Kechki ovqat' }, { text: '🚕 Taxi', callback_data: 'cat:expense:Taxi' }],
              [{ text: '➕ Boshqa', callback_data: 'cat:expense:Boshqa' }]
            ]
          }
        });
      } else if (text === '🟢 Kirim') {
        await bot.telegram.sendMessage(chatId, "Kategoriyani tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: '💰 Savdo', callback_data: 'cat:income:Savdo' }, { text: '💵 Ish haqi', callback_data: 'cat:income:Ish haqi' }],
              [{ text: '📈 Foyda', callback_data: 'cat:income:Foyda' }, { text: '🔄 Qarz qaytdi', callback_data: 'cat:income:Qarz qaytdi' }]
            ]
          }
        });
      } else if (text === '📊 Statistika') {
        const stats = await query(`
          SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
          FROM transactions WHERE user_id = $1
        `, [profile.id]);
        const { income, expense } = stats.rows[0];
        await bot.telegram.sendMessage(chatId, `📊 <b>Sizning statistikangiz:</b>\n\n🟢 <b>Jami Kirim:</b> ${Number(income).toLocaleString()} UZS\n🔴 <b>Jami Chiqim:</b> ${Number(expense).toLocaleString()} UZS\n\n💰 <b>Sof foyda:</b> ${(Number(income) - Number(expense)).toLocaleString()} UZS`, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (text === "🌐 Saytga o'tish") {
        await bot.telegram.sendMessage(chatId, "Dashboardga o'tish uchun quyidagi tugmani bosing:", {
          reply_markup: {
            inline_keyboard: [[{ text: "🖥 Dashboardni ochish", url: "https://finance-15gk.onrender.com/dashboard" }]]
          }
        });
      } else {
        const parsed = await parseTransaction(text);
        if (parsed.amount) {
          await query(
            'INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)',
            [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text]
          );
          const typeEmoji = parsed.type === 'income' ? '🟢 <b>Kirim</b>' : '🔴 <b>Chiqim</b>';
          await bot.telegram.sendMessage(chatId, `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${parsed.amount.toLocaleString()} UZS\n📊 <b>Turi:</b> ${typeEmoji}\n🗂 <b>Kategoriya:</b> ${parsed.category || 'Boshqa'}\n📝 <b>Izoh:</b> ${parsed.note}\n\n<i>Dashboardda yangilandi.</i> 📈`, { parse_mode: 'HTML', ...mainKeyboard });
        } else {
          await bot.telegram.sendMessage(chatId, "⚠️ <b>Summa topilmadi.</b>\nIltimos, summani yozib yuboring.", { parse_mode: 'HTML', ...mainKeyboard });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
