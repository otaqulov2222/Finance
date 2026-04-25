import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM debts ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { person, amount, due_date, status } = await request.json();
    const { rows } = await query(
      'INSERT INTO debts (person, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [person, amount, due_date, status || 'pending']
    );
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create debt' }, { status: 500 });
  }
}
