"use client"

import type { Apartment, Transaction, KPIData, MonthlyExpense, MonthlyRent } from "./types"

export async function getApartments(): Promise<Apartment[]> {
  const response = await fetch('/api/apartments')
  if (!response.ok) {
    throw new Error('Failed to fetch apartments')
  }
  const data = await response.json()
  return data.map((apt: any) => ({
    ...apt,
    totalInvestment: apt.totalInvestment || 0,
    leaseStartDate: apt.leaseStartDate ? new Date(apt.leaseStartDate) : undefined,
    leaseEndDate: apt.leaseEndDate ? new Date(apt.leaseEndDate) : undefined,
  }))
}

export async function getApartmentById(id: string): Promise<Apartment | undefined> {
  const response = await fetch(`/api/apartments/${id}`)
  if (!response.ok) {
    if (response.status === 404) return undefined
    throw new Error('Failed to fetch apartment')
  }
  const apt = await response.json()
  return {
    ...apt,
    totalInvestment: apt.totalInvestment || 0,
    leaseStartDate: apt.leaseStartDate ? new Date(apt.leaseStartDate) : undefined,
    leaseEndDate: apt.leaseEndDate ? new Date(apt.leaseEndDate) : undefined,
  }
}

export async function getTransactions(apartmentId?: string): Promise<Transaction[]> {
  const url = apartmentId ? `/api/transactions?apartmentId=${apartmentId}` : '/api/transactions'
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch transactions')
  }
  const data = await response.json()
  return data.map((t: any) => ({
    ...t,
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
  }))
}

export async function addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...transaction,
      date: transaction.date instanceof Date ? transaction.date.toISOString().split('T')[0] : transaction.date,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to create transaction')
  }
  const t = await response.json()
  return {
    ...t,
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
  }
}

export async function getKPIs(startDate?: Date, endDate?: Date): Promise<KPIData> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate.toISOString().split('T')[0])
  if (endDate) params.append('endDate', endDate.toISOString().split('T')[0])
  
  const url = `/api/kpis${params.toString() ? `?${params.toString()}` : ''}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch KPIs')
  }
  return response.json()
}

export async function updateApartment(id: string, data: Partial<Apartment>): Promise<Apartment> {
  const response = await fetch(`/api/apartments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update apartment')
  }
  const apt = await response.json()
  return {
    ...apt,
    totalInvestment: apt.totalInvestment || 0,
    leaseStartDate: apt.leaseStartDate ? new Date(apt.leaseStartDate) : undefined,
    leaseEndDate: apt.leaseEndDate ? new Date(apt.leaseEndDate) : undefined,
  }
}

export async function getMonthlyExpenses(apartmentId: string, year?: number, month?: number): Promise<MonthlyExpense | MonthlyExpense[]> {
  let url = `/api/apartments/${apartmentId}/monthly-expenses`
  if (year && month) {
    url += `?year=${year}&month=${month}`
  } else if (year) {
    url += `?year=${year}`
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch monthly expenses')
  }
  const data = await response.json()
  if (Array.isArray(data)) {
    return data.map((e: any) => ({
      ...e,
      createdAt: e.createdAt ? new Date(e.createdAt) : undefined,
      updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
    }))
  }
  return data ? {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  } : null as any
}

export async function saveMonthlyExpense(apartmentId: string, expense: Omit<MonthlyExpense, 'id' | 'apartmentId' | 'createdAt' | 'updatedAt'>): Promise<MonthlyExpense> {
  const response = await fetch(`/api/apartments/${apartmentId}/monthly-expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(expense),
  })
  if (!response.ok) {
    throw new Error('Failed to save monthly expense')
  }
  const data = await response.json()
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  }
}

export async function deleteMonthlyExpense(apartmentId: string, year: number, month: number): Promise<void> {
  const response = await fetch(`/api/apartments/${apartmentId}/monthly-expenses?year=${year}&month=${month}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete monthly expense')
  }
}

export async function getMonthlyRent(apartmentId: string, year?: number, month?: number): Promise<MonthlyRent[]> {
  let url = `/api/apartments/${apartmentId}/monthly-rent`
  if (year && month) {
    url += `?year=${year}&month=${month}`
  } else if (year) {
    url += `?year=${year}`
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch monthly rent')
  }
  const data = await response.json()
  return Array.isArray(data) ? data.map((r: any) => ({
    ...r,
    createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
  })) : []
}

export async function saveMonthlyRent(apartmentId: string, rent: Omit<MonthlyRent, 'id' | 'apartmentId' | 'createdAt' | 'updatedAt'>): Promise<MonthlyRent> {
  const response = await fetch(`/api/apartments/${apartmentId}/monthly-rent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rent),
  })
  if (!response.ok) {
    throw new Error('Failed to save monthly rent')
  }
  const data = await response.json()
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  }
}

export async function updateMonthlyRent(id: string, rent: Partial<Omit<MonthlyRent, 'id' | 'apartmentId' | 'month' | 'year' | 'createdAt'>>): Promise<MonthlyRent> {
  const response = await fetch(`/api/monthly-rent/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rent),
  })
  if (!response.ok) {
    throw new Error('Failed to update monthly rent')
  }
  const data = await response.json()
  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  }
}

export async function deleteMonthlyRent(id: string): Promise<void> {
  const response = await fetch(`/api/monthly-rent/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete monthly rent')
  }
}

export async function updateTransaction(id: string, transaction: Partial<Omit<Transaction, "id" | "createdAt" | "createdBy">>): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...transaction,
      date: transaction.date instanceof Date ? transaction.date.toISOString().split('T')[0] : transaction.date,
    }),
  })
  if (!response.ok) {
    throw new Error('Failed to update transaction')
  }
  const t = await response.json()
  return {
    ...t,
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete transaction')
  }
}
