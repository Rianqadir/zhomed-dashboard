import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { MonthlyRent } from '@/lib/types';

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
        month,
        year,
        amount,
        tenant_name as "tenantName",
        payment_note as "paymentNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM monthly_rent
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Rent entry not found' },
        { status: 404 }
      );
    }
    
    const row = result[0] as any;
    const rent: MonthlyRent = {
      id: row.id,
      apartmentId: row.apartmentId,
      month: row.month,
      year: row.year,
      amount: parseFloat(row.amount),
      tenantName: row.tenantName || undefined,
      paymentNote: row.paymentNote || undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };
    
    return NextResponse.json(rent);
  } catch (error) {
    console.error('Error fetching rent entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rent entry' },
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
    
    const { amount, tenantName, paymentNote } = body;

    await sql`
      UPDATE monthly_rent
      SET
        amount = COALESCE(${amount !== undefined ? parseFloat(amount) : null}, amount),
        tenant_name = ${tenantName !== undefined ? tenantName : null},
        payment_note = ${paymentNote !== undefined ? paymentNote : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Return updated rent entry
    const result = await sql`
      SELECT 
        id,
        apartment_id as "apartmentId",
        month,
        year,
        amount,
        tenant_name as "tenantName",
        payment_note as "paymentNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM monthly_rent
      WHERE id = ${id}
    `;

    const row = result[0] as any;
    const rent: MonthlyRent = {
      id: row.id,
      apartmentId: row.apartmentId,
      month: row.month,
      year: row.year,
      amount: parseFloat(row.amount),
      tenantName: row.tenantName || undefined,
      paymentNote: row.paymentNote || undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };

    return NextResponse.json(rent);
  } catch (error) {
    console.error('Error updating rent entry:', error);
    return NextResponse.json(
      { error: 'Failed to update rent entry' },
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
    
    await sql`DELETE FROM monthly_rent WHERE id = ${id}`;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rent entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete rent entry' },
      { status: 500 }
    );
  }
}





