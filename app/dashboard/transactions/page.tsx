"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getApartments, getTransactions } from "@/lib/data-service"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TransactionActions } from "@/components/transaction-actions"

export default function TransactionsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [transactionsData, apartmentsData] = await Promise.all([
        getTransactions(),
        getApartments(),
      ])
      setTransactions(transactionsData)
      setApartments(apartmentsData)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
            <p className="text-muted-foreground">Complete history of income and expenses</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/transactions/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All financial activities across all properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map((transaction) => {
                  const apartment = apartments.find((a) => a.id === transaction.apartmentId)
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{transaction.category}</p>
                          <Badge variant={transaction.type === "income" ? "default" : "secondary"}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {apartment?.name} • {transaction.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <TransactionActions transaction={transaction} apartments={apartments} onUpdate={loadData} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
