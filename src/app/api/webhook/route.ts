import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import Groq from "groq-sdk";
import { query } from '@/lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const mainKeyboard = {
  reply_markup: {
    keyboard: [[{ text: "🔴 Chiqim" }, { text: "🟢 Kirim" }], [{ text: "📊 Statistika" }, { text: "🌐 Saytga o'tish" }]],
    resize_keyboard: true
  }
};

async function parseTransaction(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Siz professional o'zbek moliya tahlilchisiz. 
        KONTEKST QOIDALARI:
        - "Oldim" so'zi agar non, ovqat, benzin, taxi, bozor kabi narsalar bilan kelsa => FAQAT "expense" (Chiqim).
        - "Oylik oldim", "Foyda oldim", "Pul tushdi", "Qarzimni qaytardi" => "income" (Kirim).
        - "Berdim" (qarz yoki to'lov) => "expense" (Chiqim).
        - Agar summa bo'lmasa "amount": null qaytaring.
        Javob FAQAT JSON: {"amount": number|null, "type": "income"|"expense", "category": string, "note": string}`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const userId = update.message?.from?.id || update.callback_query?.from?.id;
    if (!chatId || !userId) return NextResponse.json({ ok: true });

    let { rows } = await query('SELECT * FROM profiles WHERE telegram_id = $1', [userId]);
    let profile = rows[0];
    if (!profile) {
      const { rows: nr } = await query('INSERT INTO profiles (telegram_id, business_name) VALUES ($1, $2) RETURNING *', [userId, update.message?.from?.first_name || 'Mening Biznesim']);
      profile = nr[0];
    }

    if (update.callback_query) {
      const data = update.callback_query.data;
      const messageId = update.callback_query.message.message_id;
      const [action, ...params] = data.split(':');

      if (action === 'type') {
        const type = params[0];
        const categories = type === 'expense' 
          ? [['🍳 Nonushta', '🍱 Tushlik', '🌙 Kechki ovqat'], ['🚕 Taxi', '⛽️ Benzin', '🛒 Bozor'], ['💡 Kommunal', '➕ Boshqa']]
          : [['💰 Savdo', '💵 Ish haqi', '📈 Foyda'], ['🔄 Qarz qaytdi', '➕ Boshqa']];
        await bot.telegram.editMessageText(chatId, messageId, undefined, "📂 Kategoriyani tanlang:", {
          reply_markup: { inline_keyboard: [...categories.map(row => row.map(cat => ({ text: cat, callback_data: `cat:${type}:${cat}` }))), [{ text: "🏘 Asosiy menyu", callback_data: "menu" }]] }
        });
      } else if (action === 'cat') {
        const [type, cat] = params;
        const amounts = [30000, 50000, 75000, 150000, 300000, 500000];
        await bot.telegram.editMessageText(chatId, messageId, undefined, `💰 [${cat}] uchun summani tanlang:`, {
          reply_markup: { inline_keyboard: [...Array.from({ length: 3 }, (_, i) => amounts.slice(i * 2, i * 2 + 2).map(amt => ({ text: `${amt.toLocaleString()} UZS`, callback_data: `save:${type}:${cat}:${amt}` }))), [{ text: "⌨️ Boshqa summa", callback_data: `manual:${type}:${cat}` }], [{ text: "🏘 Asosiy menyu", callback_data: "menu" }]] }
        });
      } else if (action === 'save') {
        const [type, cat, amt] = params;
        await query('INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)', [profile.id, amt, type, cat, `Tugma orqali: ${cat}`]);
        try { await bot.telegram.deleteMessage(chatId, messageId); } catch (e) {}
        const emoji = type === 'income' ? '🟢' : '🔴';
        await bot.telegram.sendMessage(chatId, `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${Number(amt).toLocaleString()} UZS\n📊 <b>Turi:</b> ${emoji} <b>${type === 'income' ? 'Kirim' : 'Chiqim'}</b>\n🗂 <b>Kategoriya:</b> ${cat}`, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (action === 'menu') {
        try { await bot.telegram.deleteMessage(chatId, messageId); } catch (e) {}
        await bot.telegram.sendMessage(chatId, "Asosiy menyu:", mainKeyboard);
      }
      return NextResponse.json({ ok: true });
    }

    if (update.message) {
      const text = update.message.text;
      const mid = update.message.message_id;
      if (text === '/start' || text === '🏘 Asosiy menyu') {
        await bot.telegram.sendMessage(chatId, "<b>Assalomu alaykum!</b> Tanlang:", { parse_mode: 'HTML', ...mainKeyboard });
      } else if (text === '🔴 Chiqim' || text === '🟢 Kirim') {
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
        const type = text === '🟢 Kirim' ? 'income' : 'expense';
        await bot.telegram.sendMessage(chatId, "📂 Kategoriyani tanlang:", {
          reply_markup: { inline_keyboard: [[{ text: '🍳 Nonushta', callback_data: `cat:${type}:Nonushta` }, { text: '🍱 Tushlik', callback_data: `cat:${type}:Tushlik` }], [{ text: '🚕 Taxi', callback_data: `cat:${type}:Taxi` }, { text: '🛒 Bozor', callback_data: `cat:${type}:Bozor` }], [{ text: '➕ Boshqa', callback_data: `cat:${type}:Boshqa` }]] }
        });
      } else if (update.message.voice || (text && !['📊 Statistika', "🌐 Saytga o'tish"].includes(text))) {
        let content = text;
        if (update.message.voice) {
          const fb = await bot.telegram.sendMessage(chatId, "🎤 Ovoz tahlil qilinmoqda...");
          const fileLink = await bot.telegram.getFileLink(update.message.voice.file_id);
          const res = await fetch(fileLink.href);
          const transcription = await groq.audio.transcriptions.create({ file: await Groq.toFile(Buffer.from(await res.arrayBuffer()), "voice.ogg"), model: "whisper-large-v3", language: "uz" });
          content = transcription.text;
          try { await bot.telegram.deleteMessage(chatId, fb.message_id); } catch (e) {}
        }
        const parsed = await parseTransaction(content);
        if (parsed.amount) {
          await query('INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)', [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || content]);
          const emoji = parsed.type === 'income' ? '🟢' : '🔴';
          await bot.telegram.sendMessage(chatId, `<b>Muvaffaqiyatli saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${parsed.amount.toLocaleString()} UZS\n📊 <b>Turi:</b> ${emoji} <b>${parsed.type === 'income' ? 'Kirim' : 'Chiqim'}</b>\n🗂 <b>Kategoriya:</b> ${parsed.category}`, { parse_mode: 'HTML', ...mainKeyboard });
        } else {
          await bot.telegram.sendMessage(chatId, "⚠️ Summani aniqlab bo'lmadi.", mainKeyboard);
        }
      } else if (text === '📊 Statistika') {
        const s = await query(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as inc, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp FROM transactions WHERE user_id=$1`, [profile.id]);
        await bot.telegram.sendMessage(chatId, `📊 <b>Statistika:</b>\n\n🟢 Kirim: ${Number(s.rows[0].inc).toLocaleString()} UZS\n🔴 Chiqim: ${Number(s.rows[0].exp).toLocaleString()} UZS\n\n💰 Foyda: ${(Number(s.rows[0].inc)-Number(s.rows[0].exp)).toLocaleString()} UZS`, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (text === "🌐 Saytga o'tish") {
        await bot.telegram.sendMessage(chatId, "Dashboard:", { reply_markup: { inline_keyboard: [[{ text: "🖥 Ochish", url: "https://finance-15gk.onrender.com/dashboard" }]] } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ ok: true }); }
}
