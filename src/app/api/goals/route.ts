import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM goals ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, target_amount, deadline } = await req.json();
    
    // Test uchun birinchi profilni olamiz (keyinchalik auth bilan bog'lanadi)
    const profile = await query('SELECT id FROM profiles LIMIT 1');
    const userId = profile.rows[0].id;

    const result = await query(
      'INSERT INTO goals (user_id, name, target_amount, deadline) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, target_amount, deadline]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, current_amount } = await req.json();
    const result = await query(
      'UPDATE goals SET current_amount = $1 WHERE id = $2 RETURNING *',
      [current_amount, id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await query('DELETE FROM goals WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
