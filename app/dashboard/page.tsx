"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getApartments, getKPIs, getTransactions } from "@/lib/data-service"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, Home, Plus, PiggyBank } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [kpis, setKpis] = useState<any>(null)
  const [apartments, setApartments] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [apartmentFinancialStats, setApartmentFinancialStats] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    async function loadData() {
      try {
        setLoading(true)
        const [kpisData, apartmentsData, transactionsData] = await Promise.all([
          getKPIs(),
          getApartments(),
          getTransactions(),
        ])
        setKpis(kpisData)
        setApartments(apartmentsData)
        setRecentTransactions(transactionsData.slice(-5).reverse())

        // Load financial stats for each apartment
        if (apartmentsData.length > 0) {
          const statsPromises = apartmentsData.map(apartment =>
            fetch(`/api/apartments/${apartment.id}/financial-stats`)
              .then(res => res.json())
              .then(data => ({ apartmentId: apartment.id, ...data }))
              .catch(err => {
                console.error(`Error loading stats for ${apartment.id}:`, err)
                return null
              })
          )
          const statsResults = await Promise.all(statsPromises)
          const statsMap: Record<string, any> = {}
          statsResults.forEach(stat => {
            if (stat) {
              statsMap[stat.apartmentId] = stat
            }
          })
          setApartmentFinancialStats(statsMap)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!kpis) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <DashboardNav />

      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your property portfolio</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Revenue"
            value={formatCurrency(kpis.totalRevenue)}
            icon={DollarSign}
            trend="12.5% from last month"
            trendUp={true}
          />
          <KPICard
            title="Total Expenses"
            value={formatCurrency(kpis.totalExpenses)}
            icon={TrendingDown}
            trend="3.2% from last month"
            trendUp={false}
          />
          <KPICard
            title="Net Profit"
            value={formatCurrency(kpis.netProfit)}
            icon={TrendingUp}
            trend="18.7% from last month"
            trendUp={true}
          />
          <KPICard title="Occupancy Rate" value={`${kpis.occupancyRate.toFixed(0)}%`} icon={Home} />
        </div>

        {/* Investment Recovery Status - Per Apartment */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Investment Recovery Status
            </CardTitle>
            <CardDescription>Track how much of each apartment's investment has been recovered through net earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apartments.map((apartment) => {
                const stats = apartmentFinancialStats[apartment.id]
                if (!stats) {
                  return (
                    <div key={apartment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{apartment.name}</p>
                          <p className="text-xs text-muted-foreground">{apartment.address}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Loading...</p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={apartment.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{apartment.name}</p>
                        <p className="text-xs text-muted-foreground">{apartment.address}</p>
                      </div>
                      <Link href={`/dashboard/apartments/${apartment.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Investment</p>
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalInvestment)}</p>
                        <p className="text-xs text-muted-foreground">Deposit/investment for this apartment</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Net Earnings</p>
                        <p className={`text-2xl font-bold ${stats.allTimeNetEarnings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stats.allTimeNetEarnings)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(stats.allTimeRent)} rent - {formatCurrency(stats.allTimeExpenses)} expenses
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                        <p className={`text-2xl font-bold ${stats.remainingInvestment <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatCurrency(stats.remainingInvestment)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${stats.recoveryPercentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, Math.max(0, stats.recoveryPercentage))}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium min-w-[60px]">
                            {stats.recoveryPercentage >= 0 ? stats.recoveryPercentage.toFixed(1) : '0.0'}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {stats.remainingInvestment <= 0 
                            ? '✓ Fully recovered!' 
                            : `${formatCurrency(Math.abs(stats.remainingInvestment))} to recover`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest financial activities across all properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const apartment = apartments.find((a) => a.id === transaction.apartmentId)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{transaction.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {apartment?.name} • {transaction.date.toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href="/dashboard/transactions">View all transactions</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Properties Overview</CardTitle>
              <CardDescription>Status of all apartments in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apartments.map((apartment) => (
                  <Link
                    key={apartment.id}
                    href={`/dashboard/apartments/${apartment.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{apartment.name}</p>
                      <p className="text-xs text-muted-foreground">{apartment.currentTenant || "Vacant"}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold">{formatCurrency(apartment.rentalPrice)}/yr</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          apartment.status === "occupied"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {apartment.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
