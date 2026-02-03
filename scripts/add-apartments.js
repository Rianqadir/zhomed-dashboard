// Script to add apartments to the database
// Run with: node scripts/add-apartments.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function addApartments() {
  try {
    console.log('Adding apartments to database...');
    
    const apartments = [
      {
        id: 'apt-407',
        name: 'Apartment 407',
        address: 'Desert Charm Building, Al Barsha 1',
        rentalPrice: 0, // Default, can be updated later
        status: 'vacant',
      },
      {
        id: 'apt-103',
        name: 'Apartment 103',
        address: 'Green View 1, Barsha Heights(Tecom)',
        rentalPrice: 0, // Default, can be updated later
        status: 'vacant',
      },
      {
        id: 'apt-106',
        name: 'Apartment 106',
        address: 'Green View 1, Barsha Heights(Tecom)',
        rentalPrice: 0, // Default, can be updated later
        status: 'vacant',
      },
      {
        id: 'apt-502',
        name: 'Apartment 502',
        address: 'Green View 1, Barsha Heights(Tecom)',
        rentalPrice: 0, // Default, can be updated later
        status: 'vacant',
      },
    ];

    for (const apt of apartments) {
      await sql`
        INSERT INTO apartments (id, name, address, rental_price, status, current_tenant, lease_start_date, lease_end_date)
        VALUES (${apt.id}, ${apt.name}, ${apt.address}, ${apt.rentalPrice}, ${apt.status}, NULL, NULL, NULL)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          address = EXCLUDED.address,
          status = EXCLUDED.status
      `;
      console.log(`✅ Added: ${apt.name} - ${apt.address}`);
    }

    console.log('\n✅ All apartments added successfully!');
    
    // Verify the apartments were added
    const result = await sql`SELECT id, name, address, status FROM apartments ORDER BY name`;
    console.log('\n📋 Current apartments in database:');
    result.forEach(apt => {
      console.log(`   - ${apt.name}: ${apt.address} (${apt.status})`);
    });
  } catch (error) {
    console.error('❌ Error adding apartments:', error);
    throw error;
  }
}

addApartments()
  .then(() => {
    console.log('\nDone!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });





