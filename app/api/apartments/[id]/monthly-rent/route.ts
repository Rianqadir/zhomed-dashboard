import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { MonthlyRent } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let query;
    if (year && month) {
      query = sql`
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
        WHERE apartment_id = ${id} AND year = ${parseInt(year)} AND month = ${parseInt(month)}
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
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
        WHERE apartment_id = ${id}
        ORDER BY year DESC, month DESC, created_at DESC
      `;
    }

    const result = await query;
    const rents: MonthlyRent[] = result.map((row: any) => ({
      id: row.id,
      apartmentId: row.apartmentId,
      month: row.month,
      year: row.year,
      amount: parseFloat(row.amount || 0),
      tenantName: row.tenantName || undefined,
      paymentNote: row.paymentNote || undefined,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    }));

    return NextResponse.json(rents);
  } catch (error) {
    console.error('Error fetching monthly rent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly rent' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { month, year, amount, tenantName, paymentNote } = body;

    if (!month || !year || amount === undefined) {
      return NextResponse.json(
        { error: 'Month, year, and amount are required' },
        { status: 400 }
      );
    }

    // Generate unique ID using timestamp to allow multiple entries per month
    const rentId = `${id}-${year}-${month}-${Date.now()}`;

    const result = await sql`
      INSERT INTO monthly_rent (id, apartment_id, month, year, amount, tenant_name, payment_note)
      VALUES (${rentId}, ${id}, ${parseInt(month)}, ${parseInt(year)}, ${parseFloat(amount)}, ${tenantName || null}, ${paymentNote || null})
      RETURNING 
        id,
        apartment_id as "apartmentId",
        month,
        year,
        amount,
        tenant_name as "tenantName",
        payment_note as "paymentNote",
        created_at as "createdAt",
        updated_at as "updatedAt"
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

    return NextResponse.json(rent, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating monthly rent:', error);
    return NextResponse.json(
      { error: 'Failed to save monthly rent' },
      { status: 500 }
    );
  }
}


