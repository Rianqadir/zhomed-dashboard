import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    // Get total investment across all apartments
    const totalInvestmentResult = await sql`
      SELECT COALESCE(SUM(total_investment), 0) as total
      FROM apartments
    `;
    const totalInvestment = parseFloat(totalInvestmentResult[0]?.total || '0');

    // Get ALL-TIME monthly rent (all years)
    const allTimeRentResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM monthly_rent
    `;
    const allTimeRent = parseFloat(allTimeRentResult[0]?.total || '0');

    // Get ALL-TIME monthly expenses (all years)
    const allTimeExpensesResult = await sql`
      SELECT 
        COALESCE(SUM(water_electricity), 0) as water_electricity,
        COALESCE(SUM(gas), 0) as gas,
        COALESCE(SUM(wifi), 0) as wifi,
        COALESCE(SUM(maintenance), 0) as maintenance
      FROM monthly_expenses
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

    // Get monthly rent for the year (for year-specific stats)
    const monthlyRentResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM monthly_rent
      WHERE year = ${year}
    `;
    const totalMonthlyRent = parseFloat(monthlyRentResult[0]?.total || '0');

    // Get monthly expenses for the year
    const monthlyExpensesResult = await sql`
      SELECT 
        COALESCE(SUM(water_electricity), 0) as water_electricity,
        COALESCE(SUM(gas), 0) as gas,
        COALESCE(SUM(wifi), 0) as wifi,
        COALESCE(SUM(maintenance), 0) as maintenance
      FROM monthly_expenses
      WHERE year = ${year}
    `;
    const expensesRow = monthlyExpensesResult[0] as any;
    const totalMonthlyExpenses = 
      parseFloat(expensesRow?.water_electricity || '0') +
      parseFloat(expensesRow?.gas || '0') +
      parseFloat(expensesRow?.wifi || '0') +
      parseFloat(expensesRow?.maintenance || '0');

    // Calculate net profit for the year
    const netProfit = totalMonthlyRent - totalMonthlyExpenses;

    // Calculate ROI (Return on Investment) percentage for the year
    const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

    // Get average monthly rent
    const avgMonthlyRent = totalMonthlyRent / 12;

    // Get average monthly expenses
    const avgMonthlyExpenses = totalMonthlyExpenses / 12;

    return NextResponse.json({
      totalInvestment,
      allTimeRent,
      allTimeExpenses,
      allTimeNetEarnings,
      remainingInvestment,
      recoveryPercentage,
      totalMonthlyRent,
      totalMonthlyExpenses,
      netProfit,
      roi,
      avgMonthlyRent,
      avgMonthlyExpenses,
      year,
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial stats' },
      { status: 500 }
    );
  }
}





