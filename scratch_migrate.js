const { Client } = require('pg');
const DATABASE_URL = "postgresql://finance_manager_db_unmv_user:uPgquydqItFZpISY1nZImpOymZaEOHMw@dpg-d7mdo6svikkc73ftcph0-a.ohio-postgres.render.com/finance_manager_db_unmv";

async function migrate() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Avval jadvalni o'chirib (agar noto'g'ri yaratilgan bo'lsa), keyin to'g'ri UUID bilan yaratamiz
    await client.query(`DROP TABLE IF EXISTS goals`);
    
    await client.query(`
      CREATE TABLE goals (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES profiles(id),
        name TEXT NOT NULL,
        target_amount NUMERIC NOT NULL,
        current_amount NUMERIC DEFAULT 0,
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Goals table created successfully with UUID');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
