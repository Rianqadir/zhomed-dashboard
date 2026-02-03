import { neon } from '@neondatabase/serverless';

// Lazy initialization function
function createSqlClient() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure it in Netlify environment variables.'
    );
  }

  // Initialize Neon client
  // The neon() function returns a tagged template function
  return neon(databaseUrl);
}

// Cache the client to avoid re-initialization
let sqlClient: ReturnType<typeof neon> | null = null;

// Get or create the SQL client
function getSqlClient() {
  if (!sqlClient) {
    sqlClient = createSqlClient();
  }
  return sqlClient;
}

// Export sql as the tagged template function
// This ensures the client is initialized on first use
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  return getSqlClient()(strings, ...values);
}) as ReturnType<typeof neon>;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`;
    console.log('Database connected successfully:', result[0]);
    return true;
  } catch (error: any) {
    console.error('Database connection error:', error?.message || error);
    throw error;
  }
}






