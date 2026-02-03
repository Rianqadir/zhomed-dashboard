import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { Apartment } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql`
      SELECT 
        id,
        name,
        address,
        rental_price as "rentalPrice",
        COALESCE(total_investment, 0) as "totalInvestment",
        status,
        current_tenant as "currentTenant",
        lease_start_date as "leaseStartDate",
        lease_end_date as "leaseEndDate"
      FROM apartments
      WHERE id = ${id}
    `;
    
    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }
    
    const row = result[0] as any;
    const apartment: Apartment = {
      id: row.id,
      name: row.name,
      address: row.address,
      rentalPrice: parseFloat(row.rentalPrice),
      totalInvestment: parseFloat(row.totalInvestment || 0),
      status: row.status,
      currentTenant: row.currentTenant || undefined,
      leaseStartDate: row.leaseStartDate ? new Date(row.leaseStartDate) : undefined,
      leaseEndDate: row.leaseEndDate ? new Date(row.leaseEndDate) : undefined,
    };
    
    return NextResponse.json(apartment);
  } catch (error) {
    console.error('Error fetching apartment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apartment' },
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
      name,
      address,
      rentalPrice,
      totalInvestment,
      status,
      currentTenant,
      leaseStartDate,
      leaseEndDate,
    } = body;

    await sql`
      UPDATE apartments
      SET
        name = COALESCE(${name}, name),
        address = COALESCE(${address}, address),
        rental_price = COALESCE(${rentalPrice}, rental_price),
        total_investment = COALESCE(${totalInvestment}, total_investment),
        status = COALESCE(${status}, status),
        current_tenant = ${currentTenant !== undefined ? currentTenant : null},
        lease_start_date = ${leaseStartDate ? new Date(leaseStartDate) : null},
        lease_end_date = ${leaseEndDate ? new Date(leaseEndDate) : null}
      WHERE id = ${id}
    `;

    // Return updated apartment
    const result = await sql`
      SELECT 
        id,
        name,
        address,
        rental_price as "rentalPrice",
        COALESCE(total_investment, 0) as "totalInvestment",
        status,
        current_tenant as "currentTenant",
        lease_start_date as "leaseStartDate",
        lease_end_date as "leaseEndDate"
      FROM apartments
      WHERE id = ${id}
    `;

    const row = result[0] as any;
    const apartment: Apartment = {
      id: row.id,
      name: row.name,
      address: row.address,
      rentalPrice: parseFloat(row.rentalPrice),
      totalInvestment: parseFloat(row.totalInvestment || 0),
      status: row.status,
      currentTenant: row.currentTenant || undefined,
      leaseStartDate: row.leaseStartDate ? new Date(row.leaseStartDate) : undefined,
      leaseEndDate: row.leaseEndDate ? new Date(row.leaseEndDate) : undefined,
    };

    return NextResponse.json(apartment);
  } catch (error) {
    console.error('Error updating apartment:', error);
    return NextResponse.json(
      { error: 'Failed to update apartment' },
      { status: 500 }
    );
  }
}
