import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await query('DELETE FROM debts WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete debt' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { person, amount, due_date, status } = await request.json();
    
    await query(`
      UPDATE debts 
      SET person = $1, amount = $2, due_date = $3, status = $4
      WHERE id = $5
    `, [person, amount, due_date, status, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update debt' }, { status: 500 });
  }
}
