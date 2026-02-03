import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { MonthlyExpense } from '@/lib/types';

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
          water_electricity as "waterElectricity",
          gas,
          wifi,
          maintenance,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM monthly_expenses
        WHERE apartment_id = ${id} AND year = ${parseInt(year)} AND month = ${parseInt(month)}
      `;
    } else {
      query = sql`
        SELECT 
          id,
          apartment_id as "apartmentId",
          month,
          year,
          water_electricity as "waterElectricity",
          gas,
          wifi,
          maintenance,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM monthly_expenses
        WHERE apartment_id = ${id}
        ORDER BY year DESC, month DESC
      `;
    }

    const result = await query;
    const expenses: MonthlyExpense[] = result.map((row: any) => ({
      id: row.id,
      apartmentId: row.apartmentId,
      month: row.month,
      year: row.year,
      waterElectricity: parseFloat(row.waterElectricity || 0),
      gas: parseFloat(row.gas || 0),
      wifi: parseFloat(row.wifi || 0),
      maintenance: parseFloat(row.maintenance || 0),
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    }));

    return NextResponse.json(year && month ? (expenses[0] || null) : expenses);
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly expenses' },
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
    const { month, year, waterElectricity, gas, wifi, maintenance } = body;

    if (!month || !year) {
      return NextResponse.json(
        { error: 'Month and year are required' },
        { status: 400 }
      );
    }

    const expenseId = `${id}-${year}-${month}`;

    const result = await sql`
      INSERT INTO monthly_expenses (
        id, apartment_id, month, year, 
        water_electricity, gas, wifi, maintenance
      )
      VALUES (
        ${expenseId}, ${id}, ${parseInt(month)}, ${parseInt(year)},
        ${waterElectricity || 0}, ${gas || 0}, ${wifi || 0}, ${maintenance || 0}
      )
      ON CONFLICT (apartment_id, month, year) 
      DO UPDATE SET
        water_electricity = EXCLUDED.water_electricity,
        gas = EXCLUDED.gas,
        wifi = EXCLUDED.wifi,
        maintenance = EXCLUDED.maintenance,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        apartment_id as "apartmentId",
        month,
        year,
        water_electricity as "waterElectricity",
        gas,
        wifi,
        maintenance,
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const row = result[0] as any;
    const expense: MonthlyExpense = {
      id: row.id,
      apartmentId: row.apartmentId,
      month: row.month,
      year: row.year,
      waterElectricity: parseFloat(row.waterElectricity || 0),
      gas: parseFloat(row.gas || 0),
      wifi: parseFloat(row.wifi || 0),
      maintenance: parseFloat(row.maintenance || 0),
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    };

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating monthly expense:', error);
    return NextResponse.json(
      { error: 'Failed to save monthly expense' },
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
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM monthly_expenses
      WHERE apartment_id = ${id} AND year = ${parseInt(year)} AND month = ${parseInt(month)}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting monthly expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete monthly expense' },
      { status: 500 }
    );
  }
}





