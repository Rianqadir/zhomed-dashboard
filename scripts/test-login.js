// Script to test login credentials
// Run with: node scripts/test-login.js

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testLogin() {
  try {
    console.log('Testing admin login credentials...');
    
    const email = 'admin@zubaihomes.com';
    const password = 'admin123';
    
    // Check if user exists
    const result = await sql`
      SELECT id, email, password, role, name
      FROM users
      WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      console.error('❌ User not found in database!');
      process.exit(1);
    }
    
    const user = result[0];
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
    
    // Verify password
    if (user.password === password) {
      console.log('✅ Password matches correctly!');
      console.log('\n✅ Login credentials are working!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: ${user.role}`);
    } else {
      console.error('❌ Password does not match!');
      console.error('   Expected:', password);
      console.error('   Found:', user.password);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error testing login:', error);
    process.exit(1);
  }
}

testLogin()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });





