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
    
    const result = await sql`
      SELECT id, email, password, role, name, created_at
      FROM users
      WHERE email = ${email}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = result[0] as any;
    
    // For now, simple password comparison (in production, use bcrypt)
    if (user.password !== password) {
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
    
    return NextResponse.json(userResponse);
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}






