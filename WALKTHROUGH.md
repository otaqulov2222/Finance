# UzFinance Application Walkthrough

Welcome to your production-ready finance management system. This application consists of a powerful Telegram Bot for voice-based entry and a professional Web Dashboard for deep analytics.

## 1. Prerequisites
- **Render Account**: For Hosting and PostgreSQL database.
- **Groq AI Account**: For free Voice-to-Text and Intent Recognition.
- **Telegram Bot**: Created via @BotFather.

## 2. Database Setup
The database is hosted on **Render PostgreSQL**. 
- The schema is already initialized using `schema.sql`.
- It contains `profiles`, `transactions`, and `debts` (Nasiya Daftari) tables.

## 3. Environment Variables
The following variables must be set in your hosting environment (Render/Vercel):
- `TELEGRAM_BOT_TOKEN`: Your bot token from BotFather.
- `GROQ_API_KEY`: Your free API key from Groq Console.
- `DATABASE_URL`: Your PostgreSQL connection string.

## 4. Telegram Webhook Setup
The bot uses a Webhook for real-time responses. Once deployed, set your webhook by visiting:
`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOYED_URL>/api/webhook`

## 5. How to Use
### A. Telegram Bot (The Assistant)
- **Voice Entry**: Send a voice note like *"Bugun savdodan 1.5 mln tushdi"* or *"Xarajat: tushlik uchun 40 ming"*.
- **Text Entry**: Simply type your transaction details.
- **AI Processing**: The bot uses **Groq Whisper** for transcription and **Llama 3** for intent extraction.

### B. Web Dashboard (The Analytics)
- **Overview**: View total balance, monthly income, and expense trends.
- **Transactions**: Manage all records in a sophisticated table with Export to Excel.
- **Nasiya Daftari**: Track debts and payment statuses.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn/UI.
- **AI**: Groq SDK (Whisper-large-v3, Llama3-70b).
- **Database**: PostgreSQL (Render).
- **Charts**: Recharts.
