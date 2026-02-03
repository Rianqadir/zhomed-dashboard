# Zubair Homes Dashboard

A comprehensive property management dashboard for tracking apartments, tenants, financial data, and transactions.

## Login Credentials

**Admin Account:**
- Email: `admin@zubaihomes.com`
- Password: `admin123`

**Viewer Account:**
- Email: `viewer@zubaihomes.com`
- Password: `viewer123`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=your_neon_postgresql_connection_string
```

### 2. Initialize Database

Run the initialization script to create tables and seed user credentials:

```bash
node scripts/init-db.js
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

## Troubleshooting Login Issues

If you cannot log in even with the correct credentials:

1. **Check Database Connection:**
   - Verify `DATABASE_URL` is set correctly in your environment variables
   - For Netlify: Go to Site Settings → Environment Variables → Add `DATABASE_URL`
   - Test connection: Visit `/api/health` to check database status

2. **Initialize Database (IMPORTANT):**
   - **For Production (Netlify):** After deployment, call the init endpoint:
     ```bash
     curl -X POST https://your-site.netlify.app/api/init-db \
       -H "Authorization: Bearer init-db-secret-token-change-in-production"
     ```
   - Or set `INIT_DB_TOKEN` environment variable and use that token
   - **For Local:** Run `node scripts/init-db.js` to create tables and seed credentials

3. **Check Browser Console:**
   - Open browser DevTools (F12) → Console tab
   - Look for any error messages when attempting to login
   - Check the Network tab to see the API response

4. **Verify Database Connection:**
   - Visit `/api/health` endpoint to check database connection status
   - Check Netlify function logs for detailed error messages

5. **Common Issues:**
   - **"Database connection error"**: DATABASE_URL might be incorrect or database is not accessible
   - **"Invalid email or password"**: Database not initialized - run init endpoint
   - **Connection timeout**: Check if Neon database allows connections from Netlify IPs

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NODE_ENV`: `production`
3. Deploy - Netlify will automatically build and deploy

**Important:** After deployment, you may need to initialize the database by running the init script or manually inserting the user credentials.