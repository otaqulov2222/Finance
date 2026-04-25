import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    await query('DELETE FROM transactions WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { amount, category, note, type } = await request.json();
    
    await query(`
      UPDATE transactions 
      SET amount = $1, category = $2, note = $3, type = $4, updated_at = NOW() 
      WHERE id = $5
    `, [amount, category, note, type, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
