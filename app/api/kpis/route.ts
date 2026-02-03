import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { KPIData } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let transactionQuery;
    if (startDate && endDate) {
      transactionQuery = sql`
        SELECT type, amount
        FROM transactions
        WHERE date >= ${startDate} AND date <= ${endDate}
      `;
    } else {
      transactionQuery = sql`
        SELECT type, amount
        FROM transactions
      `;
    }
    
    const transactions = await transactionQuery;
    
    const totalRevenue = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
    
    const netProfit = totalRevenue - totalExpenses;
    
    // Get occupancy rate
    const apartmentsResult = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'occupied') as occupied
      FROM apartments
    `;
    
    const totalApartments = parseInt(apartmentsResult[0]?.total || '0');
    const occupiedApartments = parseInt(apartmentsResult[0]?.occupied || '0');
    const occupancyRate = totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;
    
    const period = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : 'All Time';
    
    const kpis: KPIData = {
      totalRevenue,
      totalExpenses,
      netProfit,
      occupancyRate,
      period,
    };
    
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}






