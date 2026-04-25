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
        content: "Siz moliya bo'yicha yordamchisiz. Foydalanuvchi matnidan tranzaksiya ma'lumotlarini JSON formatida ajratib oling. Format: { \"amount\": number, \"type\": \"income\" | \"expense\", \"category\": string | null, \"note\": string | null }. Agar kategoriya aniq bo'lmasa, null qaytaring. Faqat JSON qaytaring."
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

    const chatId = update.message?.chat?.id;
    const userId = update.message?.from?.id;
    
    if (!chatId || !userId) {
      return NextResponse.json({ ok: true });
    }

    // Find profile
    let { rows } = await query(
      'SELECT * FROM profiles WHERE telegram_id = $1',
      [userId]
    );
    let profile = rows[0];

    if (!profile) {
      const { rows: newProfileRows } = await query(
        'INSERT INTO profiles (telegram_id, business_name) VALUES ($1, $2) RETURNING *',
        [userId, update.message?.from?.first_name || 'Mening Biznesim']
      );
      profile = newProfileRows[0];
      await bot.telegram.sendMessage(chatId, "Xush kelibsiz! Siz uchun yangi profil yaratildi.");
    }

    // Handle Voice
    if (update.message.voice) {
      const feedback = await bot.telegram.sendMessage(chatId, "🎤 Ovoz tahlil qilinmoqda...");
      
      try {
        const fileId = update.message.voice.file_id;
        const fileLink = await bot.telegram.getFileLink(fileId);
        
        const res = await fetch(fileLink.href);
        if (!res.ok) throw new Error("Telegramdan faylni yuklab bo'lmadi");
        
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Use a more direct way to send buffer to Groq
        const transcription = await groq.audio.transcriptions.create({
          file: await Groq.toFile(buffer, "voice.ogg"),
          model: "whisper-large-v3",
        });

        const text = transcription.text;
        const parsed = await parseTransaction(text);

        if (!parsed.amount) {
          await bot.telegram.sendMessage(chatId, `⚠️ Miqdorni aniqlab bo'lmadi. Matn: "${text}"`);
          return NextResponse.json({ ok: true });
        }

        await query(
          'INSERT INTO transactions (user_id, amount, type, category, note, voice_transcription) VALUES ($1, $2, $3, $4, $5, $6)',
          [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text, text]
        );

        await bot.telegram.deleteMessage(chatId, feedback.message_id);
        await bot.telegram.sendMessage(chatId, `✅ Saqlandi!\n💰 Miqdor: ${parsed.amount.toLocaleString()} UZS\n🗂 Kategoriya: ${parsed.category || 'Boshqa'}`);
      } catch (err: any) {
        await bot.telegram.sendMessage(chatId, `❌ Xatolik: ${err.message}`);
      }
    }

    // Handle Text
    if (update.message.text) {
      const text = update.message.text;
      
      if (text === '/start') {
        await bot.telegram.sendMessage(chatId, "Xush kelibsiz! Men sizning moliyaviy yordamchingizman. Ovozli yoki matnli xabar yuboring.");
      } else if (text.includes("qancha foyda")) {
        const { rows: trans } = await query(
          'SELECT amount, type FROM transactions WHERE user_id = $1',
          [profile.id]
        );
        const profit = (trans || []).reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
        await bot.telegram.sendMessage(chatId, `Sizning umumiy balansingiz: ${profit} ${profile.currency}`);
      } else {
        const parsed = await parseTransaction(text);
        if (parsed.amount) {
          await query(
            'INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)',
            [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text]
          );
          await bot.telegram.sendMessage(chatId, "✅ Saqlandi!");
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
