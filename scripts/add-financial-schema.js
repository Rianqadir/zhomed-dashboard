// Script to add financial fields to the database schema
// Run with: node scripts/add-financial-schema.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function addFinancialSchema() {
  try {
    console.log('Adding financial fields to database schema...\n');
    
    // Add total_investment column to apartments table if it doesn't exist
    try {
      await sql`
        ALTER TABLE apartments 
        ADD COLUMN IF NOT EXISTS total_investment DECIMAL(12, 2) DEFAULT 0
      `;
      console.log('✅ Added total_investment column to apartments table');
    } catch (error) {
      console.log('ℹ️  total_investment column may already exist');
    }

    // Create monthly_expenses table for monthly bills
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_expenses (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        year INTEGER NOT NULL,
        water_electricity DECIMAL(12, 2) DEFAULT 0,
        gas DECIMAL(12, 2) DEFAULT 0,
        wifi DECIMAL(12, 2) DEFAULT 0,
        maintenance DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(apartment_id, month, year)
      )
    `;
    console.log('✅ Created monthly_expenses table');

    // Create monthly_rent table for rent collection
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_rent (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        year INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(apartment_id, month, year)
      )
    `;
    console.log('✅ Created monthly_rent table');

    // Create indexes for better query performance
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_expenses_apartment_id ON monthly_expenses(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_expenses_month_year ON monthly_expenses(year, month)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_rent_apartment_id ON monthly_rent(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_rent_month_year ON monthly_rent(year, month)`;
    console.log('✅ Created indexes for financial tables');

    console.log('\n✅ Financial schema added successfully!');
  } catch (error) {
    console.error('❌ Error adding financial schema:', error);
    throw error;
  }
}

addFinancialSchema()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });





