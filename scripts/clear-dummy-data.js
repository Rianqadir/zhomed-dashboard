// Script to clear all dummy data except user credentials
// Run with: node scripts/clear-dummy-data.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function clearDummyData() {
  try {
    console.log('Clearing dummy data from database...');
    
    // Delete all transactions
    const transactionsDeleted = await sql`DELETE FROM transactions`;
    console.log(`✅ Deleted all transactions`);
    
    // Delete all apartments
    const apartmentsDeleted = await sql`DELETE FROM apartments`;
    console.log(`✅ Deleted all apartments`);
    
    // Keep users (credentials)
    console.log('✅ User credentials preserved');
    
    console.log('\n✅ All dummy data cleared successfully!');
    console.log('User credentials remain intact.');
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    throw error;
  }
}

clearDummyData()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });





