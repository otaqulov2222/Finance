const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv",
  ssl: { rejectUnauthorized: false }
});

async function fix() {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log("pgcrypto extension enabled.");
    await pool.end();
  } catch (err) {
    console.error("Fix error:", err);
    await pool.end();
  }
}

fix();
