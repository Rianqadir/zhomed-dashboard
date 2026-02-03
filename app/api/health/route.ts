import { NextResponse } from 'next/server';
import { sql, isDatabaseAvailable } from '@/lib/db';

export async function GET() {
  try {
    const health: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        configured: isDatabaseAvailable(),
        connected: false,
      },
    };

    // Test database connection if configured
    if (isDatabaseAvailable()) {
      try {
        const testResult = await sql`SELECT 1 as test, NOW() as current_time`;
        health.database.connected = true;
        health.database.message = 'Database connection successful';
        health.database.testResult = testResult[0];
      } catch (dbError: any) {
        health.database.connected = false;
        health.database.error = dbError?.message || 'Connection failed';
        health.database.code = dbError?.code;
        health.database.stack = process.env.NODE_ENV === 'development' ? dbError?.stack : undefined;
        health.status = 'degraded';
      }
    } else {
      health.database.message = 'DATABASE_URL not configured';
      health.status = 'degraded';
    }

    return NextResponse.json(health, { 
      status: health.status === 'ok' ? 200 : 503 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        error: error?.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

