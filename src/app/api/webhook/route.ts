import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import Groq from "groq-sdk";
import { query } from '@/lib/db';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// AI Parsing logic using Groq (Llama 3)
async function parseTransaction(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content: `Siz moliya bo'yicha yordamchisiz. Foydalanuvchi matnidan tranzaksiya ma'lumotlarini JSON formatida ajratib oling.
        Format: { "amount": number, "type": "income" | "expense", "category": string | null, "note": string | null }
        Agar kategoriya aniq bo'lmasa, null qaytaring. Faqat JSON qaytaring.`
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // We handle the bot logic inside the route
    const handleUpdate = async (update: any) => {
      const chatId = update.message?.chat?.id;
      const userId = update.message?.from?.id;
      
      if (!chatId || !userId) return;

      // Find profile
      let { rows } = await query(
        'SELECT * FROM profiles WHERE telegram_id = $1',
        [userId]
      );
      let profile = rows[0];

      if (!profile) {
        // Auto-create profile for new user
        const { rows: newProfileRows } = await query(
          'INSERT INTO profiles (telegram_id, business_name) VALUES ($1, $2) RETURNING *',
          [userId, update.message?.from?.first_name || 'Mening Biznesim']
        );
        profile = newProfileRows[0];
        await bot.telegram.sendMessage(chatId, "Xush kelibsiz! Siz uchun yangi profil yaratildi.");
      }

      // Handle Voice
      if (update.message.voice) {
        const fileId = update.message.voice.file_id;
        const fileLink = await bot.telegram.getFileLink(fileId);
        
        // Groq Whisper transcription (Free)
        const response = await fetch(fileLink.href);
        const buffer = await response.arrayBuffer();
        
        const transcription = await groq.audio.transcriptions.create({
          file: new File([buffer], "voice.ogg", { type: "audio/ogg" }),
          model: "whisper-large-v3",
        });

        const text = transcription.text;
        const parsed = await parseTransaction(text);

        if (!parsed.category) {
          await bot.telegram.sendMessage(chatId, `Tushundim: "${text}".\nLekin bu qaysi kategoriya uchun? (Masalan: ijara, xarid, savdo)`);
          // Note: In a real bot, we'd use a state machine or temp storage to handle the follow-up
          return;
        }

        // Save to DB
        await query(
          'INSERT INTO transactions (user_id, amount, type, category, note, voice_transcription) VALUES ($1, $2, $3, $4, $5, $6)',
          [profile.id, parsed.amount, parsed.type, parsed.category, parsed.note || text, text]
        );

        await bot.telegram.sendMessage(chatId, `Muvaffaqiyatli saqlandi!\n💰 Miqdor: ${parsed.amount} ${profile.currency}\n🗂 Kategoriya: ${parsed.category}\n📝 Izoh: ${parsed.note || 'Yo'q'}`);
      }

      // Handle Text
      if (update.message.text) {
        const text = update.message.text;
        
        if (text === '/start') {
          await bot.telegram.sendMessage(chatId, "Xush kelibsiz! Men sizning moliyaviy yordamchingizman. Voice yoki matn orqali xarajatlaringizni yozib boring.");
          return;
        }

        if (text.includes("qancha foyda")) {
          // Simple query logic
          const { rows: trans } = await query(
            'SELECT amount, type FROM transactions WHERE user_id = $1',
            [profile.id]
          );
          
          const profit = (trans || []).reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
          await bot.telegram.sendMessage(chatId, `Sizning umumiy balansingiz: ${profit} ${profile.currency}`);
          return;
        }

        const parsed = await parseTransaction(text);
        if (parsed.amount) {
           await query(
            'INSERT INTO transactions (user_id, amount, type, category, note) VALUES ($1, $2, $3, $4, $5)',
            [profile.id, parsed.amount, parsed.type, parsed.category || 'Boshqa', parsed.note || text]
          );
          await bot.telegram.sendMessage(chatId, "Saqlandi!");
        }
      }
    };

    await handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
