import { useEffect, useMemo, useState } from "react";
import { useFinance, Recurrence } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, addWeeks, addMonths, addYears, isWithinInterval } from "date-fns";

export default function Budgets() {
  const { budgets, categories, accounts, expenses, convertToBase, addBudget, updateBudget, deleteBudget, currentPeriod, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: 0, categoryId: categories[0]?.id || null as string | null, accountId: null as string | null, recurrence: "monthly" as Recurrence, startDate: new Date().toISOString(), endDate: null as string | null });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", amount: 0, categoryId: categories[0]?.id || null as string | null, accountId: null as string | null, recurrence: "monthly" as Recurrence, startDate: new Date().toISOString(), endDate: null as string | null });

  useEffect(() => { document.title = "Budgets — Personal Finance"; }, []);

  function budgetWindow(b: typeof form | (typeof budgets)[number]) {
    const start = new Date(b.startDate);
    let end: Date;
    switch (b.recurrence) {
      case "weekly": end = addWeeks(start, 1); break;
      case "yearly": end = addYears(start, 1); break;
      default: end = addMonths(start, 1); break;
    }
    return { start, end: addDays(end, -1) };
  }

  const rows = useMemo(() => budgets.map(b => {
    // Compute actual spent in current period, for category/account filters
    const spent = expenses.filter(e => {
      const within = isWithinInterval(new Date(e.date), { start: currentPeriod.start, end: currentPeriod.end });
      if (!within) return false;
      if (b.categoryId && e.categoryId !== b.categoryId) return false;
      if (b.accountId && e.accountId !== b.accountId) return false;
      return true;
    }).reduce((s, e) => {
      const acc = accounts.find(a => a.id === e.accountId)!;
      return s + convertToBase(e.amount, acc.currency);
    }, 0);
    const diff = b.amount - spent;
    return { b, spent, diff };
  }), [budgets, expenses, currentPeriod, accounts, convertToBase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Budget</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder="Amount (base currency)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              <Select value={form.categoryId || "all"} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v === "all" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Budget for" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.accountId || "all"} onValueChange={(v) => setForm(f => ({ ...f, accountId: v === "all" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Account (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any account</SelectItem>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.recurrence} onValueChange={(v: Recurrence) => setForm(f => ({ ...f, recurrence: v }))}>
                <SelectTrigger><SelectValue placeholder="Recurrence" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={form.startDate.slice(0,10)} onChange={e => setForm(f => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { addBudget(form); setOpen(false); }}>Save</Button>
              <p className="text-xs text-muted-foreground">Budgets auto-renew per recurrence and are summarized using your custom month start: day {settings.monthStartDay}.</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder="Amount (base currency)" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              <Select value={editForm.categoryId || "all"} onValueChange={(v) => setEditForm(f => ({ ...f, categoryId: v === "all" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Budget for" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={editForm.accountId || "all"} onValueChange={(v) => setEditForm(f => ({ ...f, accountId: v === "all" ? null : v }))}>
                <SelectTrigger><SelectValue placeholder="Account (optional)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any account</SelectItem>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={editForm.recurrence} onValueChange={(v: Recurrence) => setEditForm(f => ({ ...f, recurrence: v }))}>
                <SelectTrigger><SelectValue placeholder="Recurrence" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={editForm.startDate.slice(0,10)} onChange={e => setEditForm(f => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { if (editingId) updateBudget(editingId, editForm); setEditOpen(false); setEditingId(null); }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Active Budgets</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {rows.map(({ b, spent, diff }) => (
              <div key={b.id} className="p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs opacity-70">{b.recurrence} · Target {b.amount.toFixed(2)} {settings.baseCurrency}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-semibold ${diff < 0 ? "text-destructive" : ""}`}>{diff.toFixed(2)} {settings.baseCurrency}</div>
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(b.id); setEditForm({ name: b.name, amount: b.amount, categoryId: b.categoryId || null, accountId: b.accountId || null, recurrence: b.recurrence, startDate: b.startDate, endDate: b.endDate || null }); setEditOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this budget?")) deleteBudget(b.id); }}>Delete</Button>
                  </div>
                </div>
                <div className="h-2 rounded bg-secondary mt-2">
                  <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, (spent / b.amount) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Spent: {spent.toFixed(2)} {settings.baseCurrency}</span>
                  <span>Remaining: {Math.max(0, diff).toFixed(2)} {settings.baseCurrency}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
