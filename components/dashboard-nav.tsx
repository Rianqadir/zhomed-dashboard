"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Home, Building2, Receipt, Users } from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const user = getCurrentUser()

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      exact: true,
    },
    {
      href: "/dashboard/apartments",
      label: "Apartments",
      icon: Building2,
    },
    {
      href: "/dashboard/transactions",
      label: "Transactions",
      icon: Receipt,
    },
  ]

  if (user?.role === "admin") {
    navItems.push({
      href: "/dashboard/admin",
      label: "Admin",
      icon: Users,
    })
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="flex items-center gap-1 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-12 items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
