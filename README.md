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

2. **Initialize Database:**
   - Make sure you've run `node scripts/init-db.js` to create the users table and seed credentials
   - For production (Netlify), you may need to run this script manually or set up a one-time initialization

3. **Check Browser Console:**
   - Open browser DevTools (F12) → Console tab
   - Look for any error messages when attempting to login
   - Check the Network tab to see the API response

4. **Verify User Exists:**
   - Run `node scripts/test-login.js` to verify the user exists in the database

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NODE_ENV`: `production`
3. Deploy - Netlify will automatically build and deploy

**Important:** After deployment, you may need to initialize the database by running the init script or manually inserting the user credentials.