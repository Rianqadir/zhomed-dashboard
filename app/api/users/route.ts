import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const result = await sql`
      SELECT id, email, role, name, created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `;
    
    const users = result.map((row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      name: row.name,
      createdAt: new Date(row.createdAt),
    }));
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}






