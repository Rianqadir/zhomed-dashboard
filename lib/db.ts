import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL environment variable is not set');
}

// Initialize Neon client with proper configuration for serverless environments
// Use fetch API for better compatibility with serverless functions
const sql: NeonQueryFunction<false, false> = databaseUrl 
  ? neon(databaseUrl, {
      fetchConnectionCache: true,
    })
  : (() => {
      throw new Error('DATABASE_URL environment variable is not set. Please configure it in your environment variables.');
    })() as any;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

// Test database connection
export async function testConnection() {
  try {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured');
    }
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully:', result[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export { sql };






