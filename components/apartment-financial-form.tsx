"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Save, X } from "lucide-react"
import type { Apartment, MonthlyExpense, MonthlyRent } from "@/lib/types"
import { updateApartment, saveMonthlyExpense, saveMonthlyRent, deleteMonthlyExpense, deleteMonthlyRent } from "@/lib/data-service"

interface ApartmentFinancialFormProps {
  apartment: Apartment
  onUpdate: () => void
}

export function ApartmentFinancialForm({ apartment, onUpdate }: ApartmentFinancialFormProps) {
  const [editingTotalInvestment, setEditingTotalInvestment] = useState(false)
  const [totalInvestment, setTotalInvestment] = useState(apartment.totalInvestment?.toString() || "0")
  const [saving, setSaving] = useState(false)

  const handleSaveTotalInvestment = async () => {
    try {
      setSaving(true)
      await updateApartment(apartment.id, { totalInvestment: parseFloat(totalInvestment) || 0 })
      setEditingTotalInvestment(false)
      onUpdate()
    } catch (error) {
      console.error('Error saving total investment:', error)
      alert('Failed to save total investment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Information</CardTitle>
        <CardDescription>Manage investment and monthly financial data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <Label className="text-sm font-medium">Total Deposit/Investment</Label>
            <p className="text-xs text-muted-foreground">Total deposit or investment amount for this apartment</p>
          </div>
          {editingTotalInvestment ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(e.target.value)}
                className="w-32"
                step="0.01"
              />
              <Button size="sm" onClick={handleSaveTotalInvestment} disabled={saving}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setTotalInvestment(apartment.totalInvestment?.toString() || "0")
                setEditingTotalInvestment(false)
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">
                AED {parseFloat(totalInvestment || "0").toLocaleString()}
              </span>
              <Button size="sm" variant="ghost" onClick={() => setEditingTotalInvestment(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MonthlyBillsForm apartmentId={apartment.id} onUpdate={onUpdate} />
          <MonthlyRentForm apartmentId={apartment.id} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  )
}

function MonthlyBillsForm({ apartmentId, onUpdate }: { apartmentId: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [waterElectricity, setWaterElectricity] = useState("0")
  const [gas, setGas] = useState("0")
  const [wifi, setWifi] = useState("0")
  const [maintenance, setMaintenance] = useState("0")
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
        <Button variant="outline" className="w-full">Add/Edit Monthly Bills</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Monthly Bills</DialogTitle>
          <DialogDescription>Enter monthly expenses for water, electricity, gas, wifi, and maintenance</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                <SelectTrigger id="month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min="2020"
                max="2099"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="waterElectricity">Water & Electricity (AED)</Label>
            <Input
              id="waterElectricity"
              type="number"
              step="0.01"
              value={waterElectricity}
              onChange={(e) => setWaterElectricity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gas">Gas (AED)</Label>
            <Input
              id="gas"
              type="number"
              step="0.01"
              value={gas}
              onChange={(e) => setGas(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifi">WiFi (AED)</Label>
            <Input
              id="wifi"
              type="number"
              step="0.01"
              value={wifi}
              onChange={(e) => setWifi(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance">Maintenance (AED)</Label>
            <Input
              id="maintenance"
              type="number"
              step="0.01"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function MonthlyRentForm({ apartmentId, onUpdate }: { apartmentId: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [amount, setAmount] = useState("0")
  const [tenantName, setTenantName] = useState("")
  const [paymentNote, setPaymentNote] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await saveMonthlyRent(apartmentId, {
        month,
        year,
        amount: parseFloat(amount) || 0,
        tenantName: tenantName || undefined,
        paymentNote: paymentNote || undefined,
      })
      setOpen(false)
      // Reset form
      setAmount("0")
      setTenantName("")
      setPaymentNote("")
      onUpdate()
    } catch (error) {
      console.error('Error saving monthly rent:', error)
      alert('Failed to save monthly rent')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Add Rent Payment</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Rent Payment</DialogTitle>
          <DialogDescription>Record a rent payment from a tenant (you can add multiple entries per month)</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rent-month">Month</Label>
              <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                <SelectTrigger id="rent-month">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent-year">Year</Label>
              <Input
                id="rent-year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                min="2020"
                max="2099"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Rent Amount (AED) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name (Optional)</Label>
            <Input
              id="tenantName"
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="Enter tenant name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentNote">Payment Note (Optional)</Label>
            <Input
              id="paymentNote"
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g., Partial payment, First installment, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

