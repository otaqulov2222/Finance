const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv",
  ssl: { rejectUnauthorized: false }
});

async function resetDebts() {
  try {
    console.log("Dropping old 'debts' table...");
    await pool.query(`DROP TABLE IF EXISTS debts CASCADE;`);
    
    console.log("Creating new 'debts' table with correct columns...");
    await pool.query(`
      CREATE TABLE debts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        person TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        due_date DATE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log("Success! Table 'debts' recreated correctly.");
    await pool.end();
  } catch (err) {
    console.error("Reset error:", err);
    await pool.end();
  }
}

resetDebts();
