const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv",
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        person TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        due_date DATE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Migration successful: 'debts' table created.");
    await pool.end();
  } catch (err) {
    console.error("Migration error:", err);
    await pool.end();
  }
}

migrate();
