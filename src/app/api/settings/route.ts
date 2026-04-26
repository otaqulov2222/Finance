import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query('SELECT * FROM settings WHERE id = 1');
    if (rows.length === 0) {
      // Default sozlamalar yaratish
      const defaultSettings = await query(
        'INSERT INTO settings (id, business_name, currency, daily_report, large_expenses) VALUES (1, $1, $2, $3, $4) RETURNING *',
        ['Mening Biznesim', 'UZS', true, false]
      );
      return NextResponse.json(defaultSettings.rows[0]);
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { business_name, currency, daily_report, large_expenses } = await req.json();
    
    // Aniq ID=1 bilan yangilash yoki yaratish
    const result = await query(
      `INSERT INTO settings (id, business_name, currency, daily_report, large_expenses) 
       VALUES (1, $1, $2, $3, $4) 
       ON CONFLICT (id) DO UPDATE SET 
         business_name = $1, 
         currency = $2, 
         daily_report = $3, 
         large_expenses = $4 
       RETURNING *`,
      [business_name, currency, daily_report, large_expenses]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
