import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { User } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Database configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }
    
    let result;
    try {
      result = await sql`
        SELECT id, email, password, role, name, created_at
        FROM users
        WHERE email = ${email}
      `;
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      console.error('Error details:', {
        message: dbError?.message,
        code: dbError?.code,
        stack: dbError?.stack,
        databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set'
      });
      
      // Provide more specific error message
      const errorMessage = dbError?.message || 'Unknown database error';
      return NextResponse.json(
        { 
          error: 'Database connection error. Please try again later.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }
    
    if (result.length === 0) {
      console.log(`Login attempt failed: User not found for email: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = result[0] as any;
    
    // For now, simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
      console.log(`Login attempt failed: Password mismatch for email: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    const userResponse: Omit<User, 'password'> = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      createdAt: new Date(user.created_at),
    };
    
    console.log(`Login successful for user: ${user.email}`);
    return NextResponse.json(userResponse);
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}






