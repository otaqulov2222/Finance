import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import Groq from "groq-sdk";
import { query } from '@/lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

async function parseTransaction(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Siz professional moliyaviy tahlilchisiz. 
        MUHIM QOIDALAR:
        1. Agar foydalanuvchi xabarida pul yo'nalishi aniq aytilmagan bo'lsa (masalan: faqat "Qarz 50000"), uni avtomatik ravishda "expense" (Chiqim) deb oling.
        2. "income" (Kirim) deb faqat "tushdi", "foyda", "qaytdi", "berdi" kabi so'zlar bo'lsagina hisoblang.
        3. Izoh (note) qismiga o'zingizdan "qaytdi" yoki "tushdi" kabi fe'llarni qo'shmang. Matnda nima bo'lsa shuni lotin alifbosida tozalab yozing.
        4. "amount": Sonlarni aniq tushuning (ming=000).
        
        Til: FAQAT O'ZBEK LOTIN. Faqat json qaytaring.`
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
      await bot.telegram.sendMessage(chatId, "Xush kelibsiz! Siz uchun yangi profil yaratildi.");
    }

    // Handle Callback Queries (Buttons)
    if (update.callback_query) {
      const data = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const messageId = update.callback_query.message.message_id;

      const [action, ...params] = data.split(':');

      if (action === 'type') {
        const type = params[0]; // income or expense
        const categories = type === 'expense' 
          ? [
              ['🍳 Nonushta', '🍱 Tushlik', '🌙 Kechki ovqat'],
              ['🚕 Taxi', '⛽️ Benzin', '🛒 Bozor'],
              ['💡 Kommunal', '🎁 Sovg\'a', '➕ Boshqa']
            ]
          : [['💰 Savdo', '💵 Ish haqi', '📈 Foyda'], ['🔄 Qarz qaytdi', '➕ Boshqa']];

        await bot.telegram.editMessageText(chatId, messageId, undefined, "Kategoriyani tanlang:", {
          reply_markup: {
            inline_keyboard: [
              ...categories.map(row => row.map(cat => ({
                text: cat,
                callback_data: `cat:${type}:${cat}`
              }))),
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
                amounts.slice(i * 2, i * 2 + 2).map(amt => ({
                  text: `${amt.toLocaleString()} UZS`,
                  callback_data: `save:${type}:${cat}:${amt}`
                }))
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
        await bot.telegram.sendMessage(chatId, 
          `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n` +
          `💰 <b>Summa:</b> ${Number(amt).toLocaleString()} UZS\n` +
          `📊 <b>Turi:</b> ${typeEmoji}\n` +
          `🗂 <b>Kategoriya:</b> ${cat}\n\n` +
          `<i>Dashboardda yangilandi.</i> 📈`,
          { parse_mode: 'HTML' }
        );
        
        // Show main menu again
        await bot.telegram.sendMessage(chatId, "Yana nima kiritamiz?", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔴 Chiqim (Xarajat)", callback_data: "type:expense" }, { text: "🟢 Kirim (Tushum)", callback_data: "type:income" }],
              [{ text: "📊 Statistika", callback_data: "stats" }]
            ]
          }
        });
      }

      else if (action === 'menu') {
        await bot.telegram.editMessageText(chatId, messageId, undefined, "Asosiy menyu. Tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔴 Chiqim (Xarajat)", callback_data: "type:expense" }, { text: "🟢 Kirim (Tushum)", callback_data: "type:income" }],
              [{ text: "📊 Statistika", callback_data: "stats" }]
            ]
          }
        });
      }

      else if (action === 'manual') {
        await bot.telegram.sendMessage(chatId, `Iltimos, [${params[1]}] uchun summani yozib yuboring (Masalan: 125000)`);
      }

      return NextResponse.json({ ok: true });
    }

    if (update.message.voice) {
      const feedback = await bot.telegram.sendMessage(chatId, "🎤 Ovoz tahlil qilinmoqda...");
      try {
        const fileId = update.message.voice.file_id;
        const fileLink = await bot.telegram.getFileLink(fileId);
        const res = await fetch(fileLink.href);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const transcription = await groq.audio.transcriptions.create({
          file: await Groq.toFile(buffer, "voice.ogg"),
          model: "whisper-large-v3",
          language: "uz" 
        });

        const text = transcription.text;
        const parsed = await parseTransaction(text);

        if (!parsed.amount) throw new Error("Miqdorni aniqlab bo'lmadi");

        await query(
          'INSERT INTO transactions (user_id, amount, type, category, note, voice_transcription) VALUES ($1, $2, $3, $4, $5, $6)',
          [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text, text]
        );

        const typeEmoji = parsed.type === 'income' ? '🟢 <b>Kirim</b>' : '🔴 <b>Chiqim</b>';
        await bot.telegram.deleteMessage(chatId, feedback.message_id);
        await bot.telegram.sendMessage(chatId, 
          `<b>Ovozli xabar saqlandi!</b> 🎤✅\n\n` +
          `💰 <b>Summa:</b> ${parsed.amount.toLocaleString()} UZS\n` +
          `📊 <b>Turi:</b> ${typeEmoji}\n` +
          `🗂 <b>Kategoriya:</b> ${parsed.category}\n` +
          `📝 <b>Izoh:</b> ${parsed.note}\n\n` +
          `<i>Tahlillar dashboardda mavjud.</i> 📉`,
          { parse_mode: 'HTML' }
        );
      } catch (err: any) {
        await bot.telegram.sendMessage(chatId, `❌ Xatolik: ${err.message}`);
      }
    }

    if (update.message.text) {
      const text = update.message.text;
      if (text === '/start') {
        await bot.telegram.sendMessage(chatId, "Assalomu alaykum! Moliyaviy yordamchingiz tayyor. Quyidagilardan birini tanlang:", {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🔴 Chiqim (Xarajat)", callback_data: "type:expense" }, { text: "🟢 Kirim (Tushum)", callback_data: "type:income" }],
              [{ text: "📊 Statistika", callback_data: "stats" }]
            ]
          }
        });
      } else {
        try {
          const parsed = await parseTransaction(text);
          if (parsed.amount) {
            await query(
              'INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)',
              [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text]
            );
            const typeEmoji = parsed.type === 'income' ? '🟢 <b>Kirim</b>' : '🔴 <b>Chiqim</b>';
            await bot.telegram.sendMessage(chatId, 
              `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n` +
              `💰 <b>Summa:</b> ${parsed.amount.toLocaleString()} UZS\n` +
              `📊 <b>Turi:</b> ${typeEmoji}\n` +
              `🗂 <b>Kategoriya:</b> ${parsed.category}\n` +
              `📝 <b>Izoh:</b> ${parsed.note}\n\n` +
              `<i>Tahlillar dashboardda yangilandi.</i> 📈`,
              { parse_mode: 'HTML' }
            );
          } else {
            await bot.telegram.sendMessage(chatId, "Tushunmadim, iltimos miqdorni ham ayting.");
          }
        } catch (err) {
          await bot.telegram.sendMessage(chatId, "Xatolik yuz berdi.");
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
