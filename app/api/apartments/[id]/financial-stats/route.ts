import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get apartment investment
    const apartmentResult = await sql`
      SELECT COALESCE(total_investment, 0) as total_investment
      FROM apartments
      WHERE id = ${id}
    `;
    const totalInvestment = parseFloat(apartmentResult[0]?.total_investment || '0');

    // Get ALL-TIME monthly rent for this apartment
    const allTimeRentResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM monthly_rent
      WHERE apartment_id = ${id}
    `;
    const allTimeRent = parseFloat(allTimeRentResult[0]?.total || '0');

    // Get ALL-TIME monthly expenses for this apartment
    const allTimeExpensesResult = await sql`
      SELECT 
        COALESCE(SUM(water_electricity), 0) as water_electricity,
        COALESCE(SUM(gas), 0) as gas,
        COALESCE(SUM(wifi), 0) as wifi,
        COALESCE(SUM(maintenance), 0) as maintenance
      FROM monthly_expenses
      WHERE apartment_id = ${id}
    `;
    const allTimeExpensesRow = allTimeExpensesResult[0] as any;
    const allTimeExpenses = 
      parseFloat(allTimeExpensesRow?.water_electricity || '0') +
      parseFloat(allTimeExpensesRow?.gas || '0') +
      parseFloat(allTimeExpensesRow?.wifi || '0') +
      parseFloat(allTimeExpensesRow?.maintenance || '0');

    // Calculate ALL-TIME net earnings (rent - expenses)
    const allTimeNetEarnings = allTimeRent - allTimeExpenses;

    // Calculate remaining investment (investment - net earnings)
    const remainingInvestment = totalInvestment - allTimeNetEarnings;

    // Calculate recovery percentage
    const recoveryPercentage = totalInvestment > 0 ? (allTimeNetEarnings / totalInvestment) * 100 : 0;

    return NextResponse.json({
      apartmentId: id,
      totalInvestment,
      allTimeRent,
      allTimeExpenses,
      allTimeNetEarnings,
      remainingInvestment,
      recoveryPercentage,
    });
  } catch (error) {
    console.error('Error fetching apartment financial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apartment financial stats' },
      { status: 500 }
    );
  }
}

