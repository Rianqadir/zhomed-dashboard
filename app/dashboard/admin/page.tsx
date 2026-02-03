"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    if (!isAuthenticated()) {
      router.push("/login")
      return
    } else if (user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    async function loadUsers() {
      try {
        setLoading(true)
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const user = getCurrentUser()

  if (user?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      <DashboardNav />

      <main className="container py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>

        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You are viewing the admin panel. Only users with admin role can access this section.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>All users with access to the portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{u.name}</p>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {u.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Data Storage</span>
              <span className="font-medium">PostgreSQL (Neon)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Authentication</span>
              <span className="font-medium">Local Storage + Database</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">AED (UAE Dirham)</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
