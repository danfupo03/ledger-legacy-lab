import { useEffect, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function Incomes() {
  const { incomes, categories, accounts, addIncome, updateIncome, deleteIncome } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", categoryId: categories.find(c => c.type !== "expense")?.id || "", amount: 0, accountId: accounts[0]?.id || "", date: new Date().toISOString() });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", categoryId: categories.find(c => c.type !== "expense")?.id || "", amount: 0, accountId: accounts[0]?.id || "", date: new Date().toISOString() });

  useEffect(() => { document.title = "Incomes — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Incomes</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Income</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Income</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              <Select value={form.categoryId || ""} onValueChange={(v) => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Category (optional)" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.type !== "expense").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.accountId} onValueChange={(v) => setForm(f => ({ ...f, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} · {a.currency}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={format(new Date(form.date), "yyyy-MM-dd")} onChange={e => setForm(f => ({ ...f, date: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { addIncome(form); setOpen(false); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder="Amount" value={editForm.amount} onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              <Select value={editForm.categoryId || ""} onValueChange={(v) => setEditForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Category (optional)" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.type !== "expense").map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={editForm.accountId} onValueChange={(v) => setEditForm(f => ({ ...f, accountId: v }))}>
                <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} · {a.currency}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="date" value={format(new Date(editForm.date), "yyyy-MM-dd")} onChange={e => setEditForm(f => ({ ...f, date: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { if (editingId) updateIncome(editingId, editForm); setEditOpen(false); setEditingId(null); }}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Incomes</CardTitle></CardHeader>
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
                {incomes.map(i => {
                  const acc = accounts.find(a => a.id === i.accountId)!;
                  const cat = categories.find(c => c.id === i.categoryId || "");
                  return (
                    <tr key={i.id} className="border-b">
                      <td className="py-2">{i.name}</td>
                      <td className="py-2">{cat?.name || "-"}</td>
                      <td className="py-2">{i.amount.toFixed(2)} {acc.currency}</td>
                      <td className="py-2">{acc.name}</td>
                      <td className="py-2">{format(new Date(i.date), "PP")}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => { setEditingId(i.id); setEditForm({ name: i.name, categoryId: i.categoryId || "", amount: i.amount, accountId: i.accountId, date: i.date }); setEditOpen(true); }}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this income?")) deleteIncome(i.id); }}>Delete</Button>
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
