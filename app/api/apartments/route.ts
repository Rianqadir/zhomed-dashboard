import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { Apartment } from '@/lib/types';

export async function GET() {
  try {
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
      ORDER BY name
    `;
    
    const apartments: Apartment[] = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      rentalPrice: parseFloat(row.rentalPrice),
      totalInvestment: parseFloat(row.totalInvestment || 0),
      status: row.status,
      currentTenant: row.currentTenant || undefined,
      leaseStartDate: row.leaseStartDate ? new Date(row.leaseStartDate) : undefined,
      leaseEndDate: row.leaseEndDate ? new Date(row.leaseEndDate) : undefined,
    }));
    
    return NextResponse.json(apartments);
  } catch (error) {
    console.error('Error fetching apartments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}


