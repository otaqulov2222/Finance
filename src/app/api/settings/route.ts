import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM settings WHERE id = 1');
    return NextResponse.json(rows[0] || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { business_name, currency, daily_report, large_expenses } = body;
    
    const { rows } = await query(`
      UPDATE settings 
      SET business_name = $1, currency = $2, daily_report = $3, large_expenses = $4, updated_at = NOW()
      WHERE id = 1
      RETURNING *
    `, [business_name, currency, daily_report, large_expenses]);

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
