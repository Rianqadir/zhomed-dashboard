"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Edit2, Trash2 } from "lucide-react"
import { updateTransaction, deleteTransaction } from "@/lib/data-service"
import type { Transaction } from "@/lib/types"

interface TransactionActionsProps {
  transaction: Transaction
  apartments: any[]
  onUpdate: () => void
}

export function TransactionActions({ transaction, apartments, onUpdate }: TransactionActionsProps) {
  const [open, setOpen] = useState(false)
  const [apartmentId, setApartmentId] = useState(transaction.apartmentId)
  const [type, setType] = useState<"income" | "expense">(transaction.type)
  const [category, setCategory] = useState(transaction.category)
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [description, setDescription] = useState(transaction.description)
  const [date, setDate] = useState(transaction.date.toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const incomeCategories = ["Rent Payment", "Deposit", "Late Fee", "Other Income"]
  const expenseCategories = [
    "Maintenance",
    "Repairs",
    "Utilities",
    "Property Management",
    "Insurance",
    "Property Tax",
    "Other Expense",
  ]

  const categories = type === "income" ? incomeCategories : expenseCategories

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await updateTransaction(transaction.id, {
        apartmentId,
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
      })
      setOpen(false)
      onUpdate()
    } catch (error) {
      console.error('Error updating transaction:', error)
      alert('Failed to update transaction')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await deleteTransaction(transaction.id)
      onUpdate()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 px-2">
            <Edit2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>Update transaction details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apartment">Apartment *</Label>
              <Select value={apartmentId} onValueChange={setApartmentId} required>
                <SelectTrigger id="apartment">
                  <SelectValue placeholder="Select an apartment" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.name} - {apartment.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={type}
                  onValueChange={(value) => {
                    setType(value as "income" | "expense")
                    setCategory("")
                  }}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (AED) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter transaction details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Button size="sm" variant="ghost" className="h-8 px-2 text-destructive hover:text-destructive" onClick={handleDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

