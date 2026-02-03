import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Simple security check - in production, add proper authentication
    // For easier setup, also allow GET requests (remove in production)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.INIT_DB_TOKEN || 'init-db-secret-token-change-in-production';
    
    // Allow if token matches OR if no auth header in development (for easier setup)
    const isAuthorized = authHeader === `Bearer ${expectedToken}` || 
                        (process.env.NODE_ENV !== 'production' && !authHeader);
    
    if (!isAuthorized) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          hint: 'Include Authorization header: Bearer init-db-secret-token-change-in-production'
        },
        { status: 401 }
      );
    }

    console.log('Initializing database schema...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'viewer')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create apartments table
    await sql`
      CREATE TABLE IF NOT EXISTS apartments (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        rental_price DECIMAL(12, 2) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('occupied', 'vacant')),
        current_tenant VARCHAR(255),
        lease_start_date DATE,
        lease_end_date DATE,
        total_investment DECIMAL(12, 2) DEFAULT 0
      )
    `;

    // Create transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
        category VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_by VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create monthly_expenses table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_expenses (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        water_electricity DECIMAL(12, 2) DEFAULT 0,
        gas DECIMAL(12, 2) DEFAULT 0,
        wifi DECIMAL(12, 2) DEFAULT 0,
        maintenance DECIMAL(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(apartment_id, month, year)
      )
    `;

    // Create monthly_rent table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_rent (
        id VARCHAR(255) PRIMARY KEY,
        apartment_id VARCHAR(255) NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
        month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
        year INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        tenant_name VARCHAR(255),
        payment_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_apartment_id ON transactions(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_apartments_status ON apartments(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_expenses_apartment_id ON monthly_expenses(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_expenses_month_year ON monthly_expenses(year, month)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_rent_apartment_id ON monthly_rent(apartment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_monthly_rent_month_year ON monthly_rent(year, month)`;
    
    console.log('Database schema initialized successfully!');

    // Seed user credentials
    console.log('Seeding user credentials...');
    
    // Ensure admin user exists (upsert)
    await sql`
      INSERT INTO users (id, email, password, role, name, created_at)
      VALUES ('1', 'admin@zubaihomes.com', 'admin123', 'admin', 'Admin User', NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name
    `;

    // Ensure viewer user exists (upsert)
    await sql`
      INSERT INTO users (id, email, password, role, name, created_at)
      VALUES ('2', 'viewer@zubaihomes.com', 'viewer123', 'viewer', 'Viewer User', NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        name = EXCLUDED.name
    `;
    
    console.log('User credentials seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      usersCreated: [
        { email: 'admin@zubaihomes.com', password: 'admin123', role: 'admin' },
        { email: 'viewer@zubaihomes.com', password: 'viewer123', role: 'viewer' },
      ],
    });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to initialize database',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

