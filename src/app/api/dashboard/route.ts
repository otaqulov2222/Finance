import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic'; // API keshda qolib ketmasligi uchun

export async function GET() {
  try {
    // 1. CBU dan kursni olish
    let usdRate = 12600;
    try {
      const cbuRes = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/', { cache: 'no-store' });
      const cbuData = await cbuRes.json();
      if (cbuData && cbuData[0]) {
        usdRate = parseFloat(cbuData[0].Rate);
      }
    } catch (e) {}

    // 2. Bazadan ENG OXIRGI sozlamalarni olish (ID: 1)
    const settingsResult = await query('SELECT currency FROM settings WHERE id = 1');
    const dbCurrency = settingsResult.rows[0]?.currency || 'UZS';

    // 3. Statistikani hisoblash
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
    `);
    
    const { income, expense } = statsResult.rows[0];
    const balance = Number(income) - Number(expense);

    // 4. Haftalik ma'lumotlar
    const chartResult = await query(`
      SELECT 
        TO_CHAR(created_at, 'DD/MM') as name,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    return NextResponse.json({
      balance: Number(balance),
      income: Number(income),
      expense: Number(expense),
      profit: Number(balance),
      currency: dbCurrency, // Bazadagi haqiqiy qiymat
      usdRate: usdRate,
      chartData: chartResult.rows.map(r => ({
        name: r.name,
        income: Number(r.income),
        expense: Number(r.expense)
      }))
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0' // Brauzerga keshlamaslikni aytamiz
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
