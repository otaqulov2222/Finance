import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function getUsdRate() {
  try {
    const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/', { next: { revalidate: 3600 } });
    const data = await res.json();
    return Number(data[0].Rate);
  } catch (err) {
    console.error("CBU API error:", err);
    return 12650; // Xatolik bo'lsa default kurs
  }
}

export async function GET() {
  try {
    const usdRate = await getUsdRate();

    // 1. Umumiy balans, kirim va chiqimlarni hisoblash
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
      FROM transactions
    `);

    const { total_income, total_expense } = statsResult.rows[0];
    const balance = Number(total_income) - Number(total_expense);
    const profit = balance > 0 ? balance : 0;

    // 2. So'nggi 7 kunlik grafik ma'lumotlari
    const chartResult = await query(`
      SELECT 
        TO_CHAR(created_at, 'DD/MM') as name,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'DD/MM'), created_at
      ORDER BY created_at ASC
    `);

    // 3. Sozlamalardan valyutani olish
    const settingsRes = await query('SELECT currency FROM settings WHERE id = 1');
    const currency = settingsRes.rows[0]?.currency || 'UZS';

    return NextResponse.json({
      balance,
      income: Number(total_income),
      expense: Number(total_expense),
      profit,
      chartData: chartResult.rows,
      usdRate,
      currency
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
