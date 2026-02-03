import { neon } from '@neondatabase/serverless';

// Lazy initialization of database client
// This prevents errors during build time when DATABASE_URL might not be available
let sqlClient: ReturnType<typeof neon> | null = null;

function getSqlClient() {
  if (!sqlClient) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set. Please configure it in your environment variables.');
    }
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}

// Create a proxy that forwards all calls to the lazy-initialized client
export const sql = new Proxy({} as ReturnType<typeof neon>, {
  get(_target, prop) {
    const client = getSqlClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  apply(_target, _thisArg, args) {
    return getSqlClient().apply(null, args);
  },
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
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}






