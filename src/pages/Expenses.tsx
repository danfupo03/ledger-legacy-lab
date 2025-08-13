import { useEffect, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Expenses() {
  const { expenses, categories, accounts, addExpense, updateExpense, deleteExpense, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: categories[0]?.id || "", amount: 0, accountId: accounts[0]?.id || "", date: new Date().toISOString(), budgetId: null as string | null });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", categoryId: categories[0]?.id || "", amount: 0, accountId: accounts[0]?.id || "", date: new Date().toISOString(), budgetId: null as string | null });
  
  // Filters
  const [filters, setFilters] = useState({ search: "", category: "all", account: "all", dateFrom: "", dateTo: "" });
  
  const filteredExpenses = expenses.filter(e => {
    if (filters.search && !e.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== "all" && e.categoryId !== filters.category) return false;
    if (filters.account !== "all" && e.accountId !== filters.account) return false;
    if (filters.dateFrom && new Date(e.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(e.date) > new Date(filters.dateTo)) return false;
    return true;
  });

  useEffect(() => { document.title = "Expenses — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-name">Expense Name</Label>
                <Input id="expense-name" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input id="expense-amount" type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type !== "income").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-account">Account</Label>
                <Select value={form.accountId} onValueChange={(v) => setForm(f => ({ ...f, accountId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} · {a.currency}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input id="expense-date" type="date" value={format(new Date(form.date), "yyyy-MM-dd")} onChange={e => setForm(f => ({ ...f, date: new Date(e.target.value).toISOString() }))} />
              </div>
              <Button onClick={() => { addExpense(form); setOpen(false); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-expense-name">Expense Name</Label>
                <Input id="edit-expense-name" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-amount">Amount</Label>
                <Input id="edit-expense-amount" type="number" placeholder="Amount" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-category">Category</Label>
                <Select value={editForm.categoryId} onValueChange={(v) => setEditForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type !== "income").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-account">Account</Label>
                <Select value={editForm.accountId} onValueChange={(v) => setEditForm(f => ({ ...f, accountId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} · {a.currency}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expense-date">Date</Label>
                <Input id="edit-expense-date" type="date" value={format(new Date(editForm.date), "yyyy-MM-dd")} onChange={e => setEditForm(f => ({ ...f, date: new Date(e.target.value).toISOString() }))} />
              </div>
              <Button onClick={() => { if (editingId) updateExpense(editingId, editForm); setEditOpen(false); setEditingId(null); }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-4">
            <Input placeholder="Search expenses..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            <Select value={filters.category} onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(c => c.type !== "income").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.account} onValueChange={(v) => setFilters(f => ({ ...f, account: v }))}>
              <SelectTrigger><SelectValue placeholder="All Accounts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" placeholder="From date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
            <Input type="date" placeholder="To date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Account</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(e => {
                  const acc = accounts.find(a => a.id === e.accountId)!;
                  const cat = categories.find(c => c.id === e.categoryId);
                  return (
                    <tr key={e.id} className="border-b">
                      <td className="py-2">{e.name}</td>
                      <td className="py-2">{cat?.name || "-"}</td>
                      <td className="py-2">{e.amount.toFixed(2)} {acc.currency}</td>
                      <td className="py-2">{acc.name}</td>
                      <td className="py-2">{format(new Date(e.date), "PP")}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => { setEditingId(e.id); setEditForm({ name: e.name, categoryId: e.categoryId, amount: e.amount, accountId: e.accountId, date: e.date, budgetId: e.budgetId ?? null }); setEditOpen(true); }}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this expense?")) deleteExpense(e.id); }}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
