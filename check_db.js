const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv",
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSchema() {
  try {
    const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `);
    console.log("TABLE SCHEMA:", JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (err) {
    console.error("SCHEMA ERROR:", err);
    await pool.end();
  }
}

checkSchema();
