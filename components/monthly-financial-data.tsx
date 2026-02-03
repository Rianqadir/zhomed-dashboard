"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit2 } from "lucide-react"
import { getMonthlyExpenses, getMonthlyRent, deleteMonthlyExpense, deleteMonthlyRent, saveMonthlyExpense, saveMonthlyRent, updateMonthlyRent } from "@/lib/data-service"
import type { MonthlyExpense, MonthlyRent } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MonthlyFinancialDataProps {
  apartmentId: string
  selectedYear: number
  onUpdate: () => void
}

export function MonthlyFinancialData({ apartmentId, selectedYear, onUpdate }: MonthlyFinancialDataProps) {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([])
  const [rents, setRents] = useState<MonthlyRent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [apartmentId, selectedYear])

  async function loadData() {
    try {
      setLoading(true)
      const [expensesData, rentsData] = await Promise.all([
        getMonthlyExpenses(apartmentId, selectedYear) as Promise<MonthlyExpense[]>,
        getMonthlyRent(apartmentId, selectedYear) as Promise<MonthlyRent[]>,
      ])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setRents(Array.isArray(rentsData) ? rentsData : [])
    } catch (error) {
      console.error('Error loading monthly data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpense = async (year: number, month: number) => {
    if (!confirm('Are you sure you want to delete this monthly expense record?')) return
    try {
      await deleteMonthlyExpense(apartmentId, year, month)
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Error deleting expense:', error)
      alert('Failed to delete monthly expense')
    }
  }

  const handleDeleteRent = async (rentId: string) => {
    if (!confirm('Are you sure you want to delete this rent payment?')) return
    try {
      await deleteMonthlyRent(rentId)
      loadData()
      onUpdate()
    } catch (error) {
      console.error('Error deleting rent:', error)
      alert('Failed to delete rent payment')
    }
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
  }

  const getExpenseForMonth = (month: number) => {
    return expenses.find(e => e.month === month)
  }

  const getRentsForMonth = (month: number) => {
    return rents.filter(r => r.month === month)
  }

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Financial Data - {selectedYear}</CardTitle>
        <CardDescription>Track monthly expenses and rent collection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
            const expense = getExpenseForMonth(month)
            const monthRents = getRentsForMonth(month)
            const totalRent = monthRents.reduce((sum, r) => sum + r.amount, 0)
            const totalExpenses = expense 
              ? (expense.waterElectricity + expense.gas + expense.wifi + expense.maintenance)
              : 0
            const netProfit = totalRent - totalExpenses

            return (
              <div key={month} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{getMonthName(month)}</h4>
                  <Badge variant={netProfit >= 0 ? "default" : "destructive"}>
                    Net: AED {netProfit.toLocaleString()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Rent Collected</p>
                    <p className="font-semibold text-green-600">
                      AED {totalRent.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {monthRents.length} payment{monthRents.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Water & Electricity</p>
                    <p className="font-semibold">
                      {expense ? `AED ${expense.waterElectricity.toLocaleString()}` : 'Not recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Gas</p>
                    <p className="font-semibold">
                      {expense ? `AED ${expense.gas.toLocaleString()}` : 'Not recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">WiFi</p>
                    <p className="font-semibold">
                      {expense ? `AED ${expense.wifi.toLocaleString()}` : 'Not recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Maintenance</p>
                    <p className="font-semibold">
                      {expense ? `AED ${expense.maintenance.toLocaleString()}` : 'Not recorded'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Total Expenses</p>
                    <p className="font-semibold text-red-600">
                      AED {totalExpenses.toLocaleString()}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {expense && (
                        <EditMonthlyExpenseButton apartmentId={apartmentId} expense={expense} onUpdate={loadData} />
                      )}
                      {expense && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2"
                          onClick={() => handleDeleteExpense(expense.year, expense.month)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display individual rent payments */}
                {monthRents.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Rent Payments:</p>
                    <div className="space-y-2">
                      {monthRents.map((rent) => (
                        <div key={rent.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-green-600">AED {rent.amount.toLocaleString()}</p>
                            {rent.tenantName && (
                              <p className="text-xs text-muted-foreground">Tenant: {rent.tenantName}</p>
                            )}
                            {rent.paymentNote && (
                              <p className="text-xs text-muted-foreground">{rent.paymentNote}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <EditMonthlyRentButton apartmentId={apartmentId} rent={rent} onUpdate={loadData} />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRent(rent.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function EditMonthlyExpenseButton({ apartmentId, expense, onUpdate }: { apartmentId: string; expense: MonthlyExpense; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(expense.month)
  const [year, setYear] = useState(expense.year)
  const [waterElectricity, setWaterElectricity] = useState(expense.waterElectricity.toString())
  const [gas, setGas] = useState(expense.gas.toString())
  const [wifi, setWifi] = useState(expense.wifi.toString())
  const [maintenance, setMaintenance] = useState(expense.maintenance.toString())
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await saveMonthlyExpense(apartmentId, {
        month,
        year,
        waterElectricity: parseFloat(waterElectricity) || 0,
        gas: parseFloat(gas) || 0,
        wifi: parseFloat(wifi) || 0,
        maintenance: parseFloat(maintenance) || 0,
      })
      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error saving monthly bills:', error)
      alert('Failed to save monthly bills')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-6 px-2">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Monthly Bills</DialogTitle>
          <DialogDescription>Update monthly expenses</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Water & Electricity (AED)</Label>
            <Input type="number" step="0.01" value={waterElectricity} onChange={(e) => setWaterElectricity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gas (AED)</Label>
            <Input type="number" step="0.01" value={gas} onChange={(e) => setGas(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WiFi (AED)</Label>
            <Input type="number" step="0.01" value={wifi} onChange={(e) => setWifi(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Maintenance (AED)</Label>
            <Input type="number" step="0.01" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditMonthlyRentButton({ apartmentId, rent, onUpdate }: { apartmentId: string; rent: MonthlyRent; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(rent.amount.toString())
  const [tenantName, setTenantName] = useState(rent.tenantName || "")
  const [paymentNote, setPaymentNote] = useState(rent.paymentNote || "")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateMonthlyRent(rent.id, {
        amount: parseFloat(amount) || 0,
        tenantName: tenantName || undefined,
        paymentNote: paymentNote || undefined,
      })
      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating monthly rent:', error)
      alert('Failed to update monthly rent')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-6 px-2">
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rent Payment</DialogTitle>
          <DialogDescription>Update rent payment details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rent Amount (AED) *</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Tenant Name (Optional)</Label>
            <Input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Enter tenant name" />
          </div>
          <div className="space-y-2">
            <Label>Payment Note (Optional)</Label>
            <Input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="Payment notes" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


