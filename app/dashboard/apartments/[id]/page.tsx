"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getApartmentById, getTransactions, getApartments } from "@/lib/data-service"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, DollarSign, User, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import { ApartmentFinancialForm } from "@/components/apartment-financial-form"
import { MonthlyFinancialData } from "@/components/monthly-financial-data"
import { TransactionActions } from "@/components/transaction-actions"

export default function ApartmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [apartment, setApartment] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const resolvedParams = use(params)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    async function loadData() {
      try {
        setLoading(true)
        const [apartmentData, transactionsData, apartmentsData] = await Promise.all([
          getApartmentById(resolvedParams.id),
          getTransactions(resolvedParams.id),
          getApartments(),
        ])
        setApartment(apartmentData)
        setTransactions(transactionsData)
        setApartments(apartmentsData)
      } catch (error) {
        console.error('Error loading apartment data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, resolvedParams.id])

  const handleUpdate = () => {
    async function loadData() {
      try {
        const [apartmentData, transactionsData, apartmentsData] = await Promise.all([
          getApartmentById(resolvedParams.id),
          getTransactions(resolvedParams.id),
          getApartments(),
        ])
        setApartment(apartmentData)
        setTransactions(transactionsData)
        setApartments(apartmentsData)
      } catch (error) {
        console.error('Error loading apartment data:', error)
      }
    }
    loadData()
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className="min-h-screen bg-muted/30">
        <DashboardHeader />
        <DashboardNav />
        <main className="container py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Apartment not found</h1>
            <Button asChild className="mt-4">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <DashboardNav />

      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{apartment.name}</h1>
            <p className="text-muted-foreground">Detailed view and transaction history</p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/transactions/new?apartmentId=${apartment.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Information about this apartment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{apartment.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Annual Rent</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(apartment.rentalPrice)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Total Investment</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(apartment.totalInvestment || 0)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Current Tenant</p>
                  <p className="text-sm text-muted-foreground">{apartment.currentTenant || "No tenant"}</p>
                </div>
              </div>

              {apartment.leaseStartDate && apartment.leaseEndDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Lease Period</p>
                    <p className="text-sm text-muted-foreground">
                      {apartment.leaseStartDate.toLocaleDateString()} - {apartment.leaseEndDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Badge variant={apartment.status === "occupied" ? "default" : "secondary"} className="capitalize">
                  {apartment.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>All-time statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ApartmentFinancialForm apartment={apartment} onUpdate={handleUpdate} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Monthly Financial Data</h2>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-md"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <MonthlyFinancialData apartmentId={apartment.id} selectedYear={selectedYear} onUpdate={handleUpdate} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All financial activities for this property</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <Button asChild className="mt-4 bg-transparent" variant="outline">
                  <Link href={`/dashboard/transactions/new?apartmentId=${apartment.id}`}>Add first transaction</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{transaction.category}</p>
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.date.toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <TransactionActions transaction={transaction} apartments={apartments} onUpdate={handleUpdate} />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
