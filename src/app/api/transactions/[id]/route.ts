import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await query('DELETE FROM transactions WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { amount, category, note, type } = await request.json();
    
    // updated_at ni olib tashladik, chunki u bazada bo'lmasligi mumkin
    await query(`
      UPDATE transactions 
      SET amount = $1, category = $2, note = $3, type = $4
      WHERE id = $5
    `, [amount, category, note, type, id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update error detail:", error);
    return NextResponse.json({ 
      error: 'Failed to update transaction',
      detail: error.message 
    }, { status: 500 });
  }
}
