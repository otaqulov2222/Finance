# UzFinance Application Walkthrough

Welcome to your production-ready finance management system. This application consists of a powerful Telegram Bot for voice-based entry and a professional Web Dashboard for deep analytics.

## 1. Prerequisites
- **Supabase Account**: Create a project and obtain your URL, Anon Key, and Service Role Key.
- **OpenAI Account**: Get an API Key (requires GPT-4o and Whisper access).
- **Telegram Bot**: Create a new bot via @BotFather and get the Token.

## 2. Database Setup
1. Go to your Supabase Dashboard.
2. Open the **SQL Editor**.
3. Copy the contents of `schema.sql` (found in the root directory) and run it.
   - This will create `profiles`, `transactions`, and `debts` tables.
   - It also sets up Row Level Security (RLS).

## 3. Environment Variables
1. Rename `.env.local.example` to `.env.local`.
2. Fill in your credentials:
   - `TELEGRAM_BOT_TOKEN`: From BotFather.
   - `OPENAI_API_KEY`: From OpenAI.
   - `NEXT_PUBLIC_SUPABASE_URL`: From Supabase Settings > API.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From Supabase Settings > API.
   - `SUPABASE_SERVICE_ROLE_KEY`: From Supabase Settings > API (Keep this secret!).

## 4. Telegram Webhook Setup
The bot uses a Webhook for real-time responses. Once you deploy your application (e.g., to Vercel), set your webhook by visiting:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_URL>/api/webhook`

## 5. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your dashboard.

## 6. How to Use
- **Voice Entry**: Send a voice note like *"Bugun tushlik uchun 50 ming so'm sarfladim"* to the bot.
- **Text Entry**: Type *"Sotuvdan 1 mln tushdi"*.
- **Querying**: Ask the bot *"Bu hafta qancha foyda qildik?"*.
- **Dashboard**: Use the web interface to edit transactions, export to Excel, and track debts in the **Nasiya Daftari**.

## Key Features
- **AI Intent Recognition**: Automatically detects if a transaction is income or expense.
- **Voice-to-Text**: High accuracy Uzbek transcription via Whisper.
- **Nasiya Daftari**: Dedicated debt management with due date tracking.
- **Sophisticated UI**: Dark-themed, high-performance dashboard with Recharts.
