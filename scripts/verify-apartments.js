// Script to verify apartments are in the database
// Run with: node scripts/verify-apartments.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function verifyApartments() {
  try {
    console.log('Verifying apartments in database...\n');
    
    const result = await sql`
      SELECT id, name, address, rental_price, status 
      FROM apartments 
      ORDER BY name
    `;
    
    if (result.length === 0) {
      console.log('❌ No apartments found in database');
      return;
    }
    
    console.log(`✅ Found ${result.length} apartment(s):\n`);
    result.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.name}`);
      console.log(`   Address: ${apt.address}`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Rental Price: AED ${apt.rental_price}`);
      console.log(`   ID: ${apt.id}\n`);
    });
    
    console.log('✅ All apartments are ready to display on the portal!');
  } catch (error) {
    console.error('❌ Error verifying apartments:', error);
    throw error;
  }
}

verifyApartments()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });





