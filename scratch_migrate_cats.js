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

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES profiles(id),
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Boshlang'ich kategoriyalarni qo'shib qo'yamiz
    const profile = await client.query('SELECT id FROM profiles LIMIT 1');
    if (profile.rows.length > 0) {
      const uid = profile.rows[0].id;
      await client.query(`
        INSERT INTO categories (user_id, name, type) VALUES 
        ('${uid}', '🍳 Ovqat', 'expense'),
        ('${uid}', '🛒 Bozor', 'expense'),
        ('${uid}', '🚕 Transport', 'expense'),
        ('${uid}', '💰 Savdo', 'income'),
        ('${uid}', '💵 Ish haqi', 'income')
        ON CONFLICT DO NOTHING
      `);
    }
    
    console.log('Categories table created successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
}

migrate();
