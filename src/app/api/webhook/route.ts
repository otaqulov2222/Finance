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
      [{ text: "📋 Kunlik xulosa" }, { text: "📊 Statistika" }],
      [{ text: "🌐 Saytga o'tish" }]
    ],
    resize_keyboard: true
  }
};

async function parseTransaction(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Siz professional O'zbek moliya tahlilchisiz. Javob FAQAT JSON: {"amount": number|null, "type": "income"|"expense", "category": string, "note": string}`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content || "{}");
}

async function getDailySummary(userId: string) {
  const stats = await query(`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense,
      COUNT(*) as count
    FROM transactions 
    WHERE user_id = $1 AND created_at >= CURRENT_DATE
  `, [userId]);

  const details = await query(`
    SELECT category, amount, type, note 
    FROM transactions 
    WHERE user_id = $1 AND created_at >= CURRENT_DATE
    ORDER BY created_at DESC
  `, [userId]);

  const { income, expense, count } = stats.rows[0];
  
  let msg = `📅 <b>Bugungi hisobot:</b>\n\n`;
  msg += `🟢 <b>Kirim:</b> ${Number(income).toLocaleString()} UZS\n`;
  msg += `🔴 <b>Chiqim:</b> ${Number(expense).toLocaleString()} UZS\n`;
  msg += `⚖️ <b>Balans:</b> ${(Number(income) - Number(expense)).toLocaleString()} UZS\n`;
  msg += `📝 <b>Amallar soni:</b> ${count} ta\n\n`;
  
  if (details.rows.length > 0) {
    msg += `<b>Oxirgi amallar:</b>\n`;
    details.rows.slice(0, 5).forEach((t: any) => {
      const emo = t.type === 'income' ? '➕' : '➖';
      msg += `${emo} ${Number(t.amount).toLocaleString()} - ${t.category}\n`;
    });
  }

  // AI Insight
  const aiRes = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "Siz moliyaviy maslahatchisiz. Kunlik sarf-xarajatga qisqa (1 ta gap) o'zbekcha maslahat bering." },
      { role: "user", content: `Kirim: ${income}, Chiqim: ${expense}.` }
    ]
  });
  msg += `\n💡 <b>AI Maslahat:</b> <i>${aiRes.choices[0].message.content}</i>`;

  return msg;
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
    const userId = update.message?.from?.id || update.callback_query?.from?.id;
    if (!chatId || !userId) return NextResponse.json({ ok: true });

    let { rows: pr } = await query('SELECT * FROM profiles WHERE telegram_id = $1', [userId]);
    let profile = pr[0];
    if (!profile) {
      const { rows: nr } = await query('INSERT INTO profiles (telegram_id, business_name) VALUES ($1, $2) RETURNING *', [userId, update.message?.from?.first_name || 'Mening Biznesim']);
      profile = nr[0];
    }

    if (update.callback_query) {
      const d = update.callback_query.data;
      const mid = update.callback_query.message.message_id;
      const [action, ...p] = d.split(':');

      if (action === 'type') {
        const type = p[0];
        const { rows: cats } = await query('SELECT name FROM categories WHERE user_id = $1 AND type = $2', [profile.id, type]);
        const inline_keyboard = [];
        for (let i = 0; i < cats.length; i += 2) {
          const row = cats.slice(i, i + 2).map(c => ({ text: c.name, callback_data: `cat:${type}:${c.name}` }));
          inline_keyboard.push(row);
        }
        inline_keyboard.push([{ text: "🏘 Menyu", callback_data: "menu" }]);
        await bot.telegram.editMessageText(chatId, mid, undefined, "📂 Kategoriyani tanlang:", { reply_markup: { inline_keyboard } });
      } else if (action === 'cat') {
        const [type, cat] = p;
        const amts = [10000, 30000, 50000, 100000, 250000, 500000];
        await bot.telegram.editMessageText(chatId, mid, undefined, `💰 [${cat}] uchun summani tanlang:`, {
          reply_markup: { inline_keyboard: [...Array.from({ length: 3 }, (_, i) => amts.slice(i * 2, i * 2 + 2).map(a => ({ text: `${a.toLocaleString()} UZS`, callback_data: `save:${type}:${cat}:${a}` }))), [{ text: "⌨️ Boshqa summa", callback_data: `manual:${type}:${cat}` }], [{ text: "🏘 Menyu", callback_data: "menu" }]] }
        });
      } else if (action === 'save') {
        const [type, cat, amt] = p;
        await query('INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)', [profile.id, amt, type, cat, `Bot orqali: ${cat}`]);
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
        await bot.telegram.sendMessage(chatId, `<b>Saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${Number(amt).toLocaleString()} UZS\n📊 <b>Kategoriya:</b> ${cat}`, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (action === 'menu') {
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
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
        const { rows: cats } = await query('SELECT name FROM categories WHERE user_id = $1 AND type = $2', [profile.id, type]);
        const inline_keyboard = [];
        for (let i = 0; i < cats.length; i += 2) {
          const row = cats.slice(i, i + 2).map(c => ({ text: c.name, callback_data: `cat:${type}:${c.name}` }));
          inline_keyboard.push(row);
        }
        inline_keyboard.push([{ text: "🏘 Menyu", callback_data: "menu" }]);
        await bot.telegram.sendMessage(chatId, "📂 Kategoriyani tanlang:", { reply_markup: { inline_keyboard } });
      } else if (text === '📋 Kunlik xulosa') {
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
        const summary = await getDailySummary(profile.id);
        await bot.telegram.sendMessage(chatId, summary, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (text === '📊 Statistika') {
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
        const s = await query(`SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as inc, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as exp FROM transactions WHERE user_id=$1`, [profile.id]);
        await bot.telegram.sendMessage(chatId, `📊 <b>Jami Statistika:</b>\n\n🟢 Kirim: ${Number(s.rows[0].inc).toLocaleString()} UZS\n🔴 Chiqim: ${Number(s.rows[0].exp).toLocaleString()} UZS`, { parse_mode: 'HTML', ...mainKeyboard });
      } else if (text === "🌐 Saytga o'tish") {
        try { await bot.telegram.deleteMessage(chatId, mid); } catch (e) {}
        await bot.telegram.sendMessage(chatId, "Dashboard:", { reply_markup: { inline_keyboard: [[{ text: "🖥 Ochish", url: "https://finance-15gk.onrender.com/dashboard" }]] } });
      } else if (update.message.voice || (text && !['📊 Statistika', '📋 Kunlik xulosa', "🌐 Saytga o'tish"].includes(text))) {
        let content = text;
        if (update.message.voice) {
          const fb = await bot.telegram.sendMessage(chatId, "🎤 Tahlil qilinmoqda...");
          const fl = await bot.telegram.getFileLink(update.message.voice.file_id);
          const r = await fetch(fl.href);
          const trans = await groq.audio.transcriptions.create({ file: await Groq.toFile(Buffer.from(await r.arrayBuffer()), "voice.ogg"), model: "whisper-large-v3", language: "uz" });
          content = trans.text;
          try { await bot.telegram.deleteMessage(chatId, fb.message_id); } catch (e) {}
          
          // Bo'sh yoki juda qisqa xabarni o'tkazib yuborish
          if (!content || content.trim().length < 3) {
            await bot.telegram.sendMessage(chatId, "⚠️ Ovozli xabarda ma'lumot topilmadi yoki tushunarsiz.", mainKeyboard);
            return NextResponse.json({ ok: true });
          }
        }
        
        const p = await parseTransaction(content);
        if (p && p.amount && p.amount > 0) {
          await query('INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)', [profile.id, p.amount, p.type, p.category || 'Boshqa', p.note || content]);
          const emo = p.type === 'income' ? '🟢' : '🔴';
          await bot.telegram.sendMessage(chatId, `<b>Saqlandi!</b> ✅\n\n💰 <b>Summa:</b> ${p.amount.toLocaleString()} UZS\n📊 <b>Kategoriya:</b> ${p.category}`, { parse_mode: 'HTML', ...mainKeyboard });
        } else {
          await bot.telegram.sendMessage(chatId, "⚠️ Gapda summa yoki mantiqiy amal aniqlanmadi.", mainKeyboard);
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ ok: true }); }
}
