import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Markaziy Bankdan real vaqtda USD kursini olish
    let usdRate = 12500; // Default
    try {
      const cbuRes = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/');
      const cbuData = await cbuRes.json();
      if (cbuData && cbuData[0]) {
        usdRate = parseFloat(cbuData[0].Rate);
      }
    } catch (e) {
      console.error("CBU Fetch error:", e);
    }

    // 2. Sozlamalarni olish
    const settingsResult = await query('SELECT * FROM settings LIMIT 1');
    const settings = settingsResult.rows[0] || { currency: 'UZS', business_name: 'Mening Biznesim' };

    // 3. Moliyaviy ma'lumotlarni hisoblash
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions
    `);
    
    const { income, expense } = statsResult.rows[0];
    const balance = Number(income) - Number(expense);

    // 4. Grafik uchun oxirgi 7 kunlik ma'lumotlar
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
      currency: settings.currency,
      usdRate: usdRate,
      chartData: chartResult.rows.map(r => ({
        name: r.name,
        income: Number(r.income),
        expense: Number(r.expense)
      }))
    });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
