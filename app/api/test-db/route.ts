import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // Check 1: DATABASE_URL is set
  diagnostics.checks.databaseUrlSet = !!process.env.DATABASE_URL;
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    diagnostics.checks.databaseUrlFormat = {
      hasPostgres: url.includes('postgres'),
      hasNeon: url.includes('neon'),
      length: url.length,
      startsWithPostgres: url.startsWith('postgresql://') || url.startsWith('postgres://'),
    };
  }

  // Check 2: Try to connect
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    diagnostics.checks.connection = {
      success: true,
      currentTime: result[0]?.current_time,
      postgresVersion: result[0]?.pg_version?.substring(0, 50),
    };
  } catch (error: any) {
    diagnostics.checks.connection = {
      success: false,
      error: error?.message,
      code: error?.code,
      name: error?.name,
    };
  }

  // Check 3: Try to query users table
  try {
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    diagnostics.checks.usersTable = {
      exists: true,
      userCount: parseInt(users[0]?.count || '0'),
    };
  } catch (error: any) {
    diagnostics.checks.usersTable = {
      exists: false,
      error: error?.message,
      code: error?.code,
      hint: error?.message?.includes('does not exist') 
        ? 'Database not initialized. Call /api/init-db to initialize.'
        : 'Unknown error',
    };
  }

  // Check 4: Try to query apartments table
  try {
    const apartments = await sql`SELECT COUNT(*) as count FROM apartments`;
    diagnostics.checks.apartmentsTable = {
      exists: true,
      apartmentCount: parseInt(apartments[0]?.count || '0'),
    };
  } catch (error: any) {
    diagnostics.checks.apartmentsTable = {
      exists: false,
      error: error?.message,
    };
  }

  const allChecksPass = 
    diagnostics.checks.databaseUrlSet &&
    diagnostics.checks.connection?.success &&
    diagnostics.checks.usersTable?.exists;

  return NextResponse.json({
    ...diagnostics,
    status: allChecksPass ? 'healthy' : 'unhealthy',
    recommendation: !diagnostics.checks.databaseUrlSet
      ? 'Set DATABASE_URL environment variable in Netlify'
      : !diagnostics.checks.connection?.success
      ? `Fix database connection: ${diagnostics.checks.connection?.error}`
      : !diagnostics.checks.usersTable?.exists
      ? 'Initialize database by calling POST /api/init-db'
      : 'Database is ready',
  });
}

