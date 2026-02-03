import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { Transaction } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql`
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
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
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
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      apartmentId,
      type,
      category,
      amount,
      description,
      date,
    } = body;

    await sql`
      UPDATE transactions
      SET
        apartment_id = COALESCE(${apartmentId}, apartment_id),
        type = COALESCE(${type}, type),
        category = COALESCE(${category}, category),
        amount = COALESCE(${amount}, amount),
        description = COALESCE(${description}, description),
        date = COALESCE(${date ? new Date(date) : null}, date)
      WHERE id = ${id}
    `;

    // Return updated transaction
    const result = await sql`
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
      WHERE id = ${id}
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

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await sql`DELETE FROM transactions WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}





