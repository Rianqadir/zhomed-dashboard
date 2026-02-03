"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { getApartments } from "@/lib/data-service"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ApartmentsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [apartments, setApartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    async function loadApartments() {
      try {
        setLoading(true)
        const data = await getApartments()
        setApartments(data)
      } catch (error) {
        console.error('Error loading apartments:', error)
      } finally {
        setLoading(false)
      }
    }

    loadApartments()
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apartments</h1>
          <p className="text-muted-foreground">Manage all properties in your portfolio</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apartments.map((apartment) => (
            <Link key={apartment.id} href={`/dashboard/apartments/${apartment.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{apartment.name}</CardTitle>
                      <CardDescription className="mt-1">{apartment.address}</CardDescription>
                    </div>
                    <Badge variant={apartment.status === "occupied" ? "default" : "secondary"} className="capitalize">
                      {apartment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Annual Rent</span>
                    <span className="font-semibold">{formatCurrency(apartment.rentalPrice)}</span>
                  </div>
                  {apartment.currentTenant && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tenant</span>
                      <span className="font-medium">{apartment.currentTenant}</span>
                    </div>
                  )}
                  {apartment.leaseEndDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Lease Ends</span>
                      <span className="font-medium">{apartment.leaseEndDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
