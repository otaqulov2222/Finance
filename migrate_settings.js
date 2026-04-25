const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv",
  ssl: { rejectUnauthorized: false }
});

async function migrateSettings() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        business_name TEXT DEFAULT 'Mening Biznesim',
        currency TEXT DEFAULT 'UZS',
        daily_report BOOLEAN DEFAULT true,
        large_expenses BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Faqat bitta qator bo'lishini ta'minlaymiz
      INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);
    console.log("Migration successful: 'settings' table created.");
    await pool.end();
  } catch (err) {
    console.error("Migration error:", err);
    await pool.end();
  }
}

migrateSettings();
