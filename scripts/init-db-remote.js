// Node.js script to initialize database on Netlify
// Usage: node scripts/init-db-remote.js https://your-site.netlify.app

const siteUrl = process.argv[2] || process.env.NETLIFY_SITE_URL;
const token = process.env.INIT_DB_TOKEN || 'init-db-secret-token-change-in-production';

if (!siteUrl) {
  console.error('❌ Please provide your Netlify site URL');
  console.error('Usage: node scripts/init-db-remote.js https://your-site.netlify.app');
  process.exit(1);
}

const initUrl = `${siteUrl}/api/init-db`;

console.log(`\n🔧 Initializing database at: ${initUrl}\n`);

fetch(initUrl, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
  .then(async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', data.error || 'Unknown error');
      if (data.hint) {
        console.error('💡 Hint:', data.hint);
      }
      process.exit(1);
    }
    
    console.log('✅ Database initialized successfully!\n');
    console.log('📋 Login Credentials:');
    if (data.usersCreated) {
      data.usersCreated.forEach((user) => {
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: ${user.password}`);
        console.log(`  Role: ${user.role}\n`);
      });
    }
    
    console.log('✅ Done! You can now log in with the credentials above.');
  })
  .catch((error) => {
    console.error('❌ Error initializing database:', error.message);
    console.error('\n💡 Tips:');
    console.error('  1. Make sure DATABASE_URL is set in Netlify environment variables');
    console.error('  2. Check that your site is deployed and accessible');
    console.error('  3. Verify the token matches');
    process.exit(1);
  });

