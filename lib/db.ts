import { neon } from '@neondatabase/serverless';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a Neon database client
export const sql = neon(databaseUrl);

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully:', result[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}






