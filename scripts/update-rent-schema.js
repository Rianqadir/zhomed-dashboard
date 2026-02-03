// Script to update monthly_rent table to allow multiple entries per month
// Run with: node scripts/update-rent-schema.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function updateRentSchema() {
  try {
    console.log('Updating monthly_rent table schema...\n');
    
    // Drop the unique constraint if it exists
    try {
      await sql`
        ALTER TABLE monthly_rent 
        DROP CONSTRAINT IF EXISTS monthly_rent_apartment_id_month_year_key
      `;
      console.log('✅ Removed unique constraint on (apartment_id, month, year)');
    } catch (error) {
      console.log('ℹ️  Constraint may not exist or already removed');
    }

    // Add tenant_name column if it doesn't exist (optional field to track which tenant paid)
    try {
      await sql`
        ALTER TABLE monthly_rent 
        ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(255)
      `;
      console.log('✅ Added tenant_name column to monthly_rent table');
    } catch (error) {
      console.log('ℹ️  tenant_name column may already exist');
    }

    // Add payment_note column if it doesn't exist (optional field for notes)
    try {
      await sql`
        ALTER TABLE monthly_rent 
        ADD COLUMN IF NOT EXISTS payment_note TEXT
      `;
      console.log('✅ Added payment_note column to monthly_rent table');
    } catch (error) {
      console.log('ℹ️  payment_note column may already exist');
    }

    console.log('\n✅ Monthly rent schema updated successfully!');
    console.log('Now multiple rent entries per apartment per month are allowed.');
  } catch (error) {
    console.error('❌ Error updating rent schema:', error);
    throw error;
  }
}

updateRentSchema()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });





