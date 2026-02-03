// Script to initialize the database schema
// Run with: node scripts/init-db.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function initDatabase() {
  try {
    console.log('Initializing database schema...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'viewer')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create apartments table
    await sql`
      CREATE TABLE IF NOT EXISTS apartments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        rental_price DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('occupied', 'vacant')),
        current_tenant VARCHAR(255),
        lease_start_date DATE,
        lease_end_date DATE
      )
    `;

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_by VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_apartment_id ON transactions(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status)`;
    
    console.log('Database schema initialized successfully!');

    // Seed user credentials only
    console.log('Seeding user credentials...');
    
    // Ensure admin user exists (upsert)
    await sql`
      INSERT INTO users (id, email, password, role, name, created_at)
      VALUES ('1', 'admin@zubaihomes.com', 'admin123', 'admin', 'Admin User', NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name
    `;

    // Ensure viewer user exists (upsert)
    await sql`
      INSERT INTO users (id, email, password, role, name, created_at)
      VALUES ('2', 'viewer@zubaihomes.com', 'viewer123', 'viewer', 'Viewer User', NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name
    `;
    
    console.log('Admin user credentials: admin@zubaihomes.com / admin123');
    console.log('User credentials seeded successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

initDatabase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });


