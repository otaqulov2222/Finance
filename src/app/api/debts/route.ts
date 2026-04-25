import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM debts ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Fetch debts error:", error);
    return NextResponse.json({ error: 'Failed to fetch debts', detail: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { person, amount, due_date, status } = body;
    
    const { rows } = await query(
      'INSERT INTO debts (person, amount, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [person, amount, due_date || null, status || 'pending']
    );
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error("Create debt error detail:", error);
    return NextResponse.json({ 
      error: 'Failed to create debt', 
      detail: error.message 
    }, { status: 500 });
  }
}
