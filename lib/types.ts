export interface User {
  id: string
  email: string
  password: string
  role: "admin" | "viewer"
  name: string
  createdAt: Date
}

export interface Apartment {
  id: string
  name: string
  address: string
  rentalPrice: number
  totalInvestment?: number
  status: "occupied" | "vacant"
  currentTenant?: string
  leaseStartDate?: Date
  leaseEndDate?: Date
}

export interface MonthlyExpense {
  id: string
  apartmentId: string
  month: number
  year: number
  waterElectricity: number
  gas: number
  wifi: number
  maintenance: number
  createdAt?: Date
  updatedAt?: Date
}

export interface MonthlyRent {
  id: string
  apartmentId: string
  month: number
  year: number
  amount: number
  tenantName?: string
  paymentNote?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface Transaction {
  id: string
  apartmentId: string
  type: "income" | "expense"
  category: string
  amount: number
  description: string
  date: Date
  createdBy: string
  createdAt: Date
}

export interface KPIData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  occupancyRate: number
  period: string
}
