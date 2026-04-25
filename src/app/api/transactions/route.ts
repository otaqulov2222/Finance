import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(`
      SELECT t.*, p.business_name 
      FROM transactions t 
      JOIN profiles p ON t.user_id = p.id 
      ORDER BY t.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
