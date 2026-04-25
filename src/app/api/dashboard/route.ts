import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
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

    return NextResponse.json({
      balance,
      income: Number(total_income),
      expense: Number(total_expense),
      profit,
      chartData: chartResult.rows
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
