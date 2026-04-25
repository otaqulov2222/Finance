import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // In a real app, you would get the user_id from the session/auth
    // For now, we'll fetch everything to show data is working
    const { rows: transactions } = await query('SELECT * FROM transactions ORDER BY created_at DESC');
    const { rows: debts } = await query('SELECT * FROM debts ORDER BY created_at DESC');

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const profit = income - expense;

    return NextResponse.json({
      transactions,
      debts,
      stats: {
        income,
        expense,
        profit,
        balance: profit // Simple assumption
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
