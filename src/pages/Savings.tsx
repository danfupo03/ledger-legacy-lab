import { useEffect, useMemo, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { differenceInDays, format } from "date-fns";

export default function Savings() {
  const { savingGoals, addSavingGoal, updateSavingGoal, deleteSavingGoal, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", totalAmount: 0, currentAmount: 0, startDate: new Date().toISOString(), endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 6, new Date().getDate()).toISOString() });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", totalAmount: 0, currentAmount: 0, startDate: new Date().toISOString(), endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 6, new Date().getDate()).toISOString() });

  useEffect(() => { document.title = "Saving Goals — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Saving Goals</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Saving Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder={`Total Amount (${settings.baseCurrency})`} value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder={`Current Amount (${settings.baseCurrency})`} value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 }))} />
              <Input type="date" value={form.startDate.slice(0,10)} onChange={e => setForm(f => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} />
              <Input type="date" value={form.endDate.slice(0,10)} onChange={e => setForm(f => ({ ...f, endDate: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { addSavingGoal(form); setOpen(false); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Saving Goal</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder={`Total Amount (${settings.baseCurrency})`} value={editForm.totalAmount} onChange={e => setEditForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder={`Current Amount (${settings.baseCurrency})`} value={editForm.currentAmount} onChange={e => setEditForm(f => ({ ...f, currentAmount: parseFloat(e.target.value) || 0 }))} />
              <Input type="date" value={editForm.startDate.slice(0,10)} onChange={e => setEditForm(f => ({ ...f, startDate: new Date(e.target.value).toISOString() }))} />
              <Input type="date" value={editForm.endDate.slice(0,10)} onChange={e => setEditForm(f => ({ ...f, endDate: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { if (editingId) updateSavingGoal(editingId, editForm); setEditOpen(false); setEditingId(null); }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {savingGoals.map(g => {
          const pct = Math.min(100, (g.currentAmount / g.totalAmount) * 100);
          const daysLeft = differenceInDays(new Date(g.endDate), new Date());
          return (
            <Card key={g.id} className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{g.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">{pct.toFixed(0)}%</span>
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(g.id); setEditForm({ name: g.name, totalAmount: g.totalAmount, currentAmount: g.currentAmount, startDate: g.startDate, endDate: g.endDate }); setEditOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this goal?")) deleteSavingGoal(g.id); }}>Delete</Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-2 rounded bg-secondary">
                  <div className="h-2 rounded bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>{g.currentAmount.toFixed(2)} / {g.totalAmount.toFixed(2)} {settings.baseCurrency}</span>
                  <span>{daysLeft} days left</span>
                </div>
                <div className="text-xs opacity-70 mt-1">{format(new Date(g.startDate), "PP")} - {format(new Date(g.endDate), "PP")}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
