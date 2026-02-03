import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { Transaction } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apartmentId = searchParams.get('apartmentId');
    
    let result;
    if (apartmentId) {
      result = await sql`
        SELECT 
          id,
          apartment_id as "apartmentId",
          type,
          category,
          amount,
          description,
          date,
          created_by as "createdBy",
          created_at as "createdAt"
        FROM transactions
        WHERE apartment_id = ${apartmentId}
        ORDER BY date DESC, created_at DESC
      `;
    } else {
      result = await sql`
        SELECT 
          id,
          apartment_id as "apartmentId",
          type,
          category,
          amount,
          description,
          date,
          created_by as "createdBy",
          created_at as "createdAt"
        FROM transactions
        ORDER BY date DESC, created_at DESC
      `;
    }
    
    const transactions: Transaction[] = result.map((row: any) => ({
      id: row.id,
      apartmentId: row.apartmentId,
      type: row.type,
      category: row.category,
      amount: parseFloat(row.amount),
      description: row.description,
      date: new Date(row.date),
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
    }));
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      apartmentId,
      type,
      category,
      amount,
      description,
      date,
      createdBy,
    } = body;
    
    // Validate required fields
    if (!apartmentId || !type || !category || !amount || !date || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID
    const id = Date.now().toString();
    
    const result = await sql`
      INSERT INTO transactions (id, apartment_id, type, category, amount, description, date, created_by, created_at)
      VALUES (${id}, ${apartmentId}, ${type}, ${category}, ${amount}, ${description}, ${date}, ${createdBy}, NOW())
      RETURNING 
        id,
        apartment_id as "apartmentId",
        type,
        category,
        amount,
        description,
        date,
        created_by as "createdBy",
        created_at as "createdAt"
    `;
    
    const row = result[0] as any;
    const transaction: Transaction = {
      id: row.id,
      apartmentId: row.apartmentId,
      type: row.type,
      category: row.category,
      amount: parseFloat(row.amount),
      description: row.description,
      date: new Date(row.date),
      createdBy: row.createdBy,
      createdAt: new Date(row.createdAt),
    };
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}






