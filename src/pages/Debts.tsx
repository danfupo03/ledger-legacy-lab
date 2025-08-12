import { useEffect, useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Debts() {
  const { debts, addDebt, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", currentBalance: 0, totalAmount: 0, interestRate: 0, dueDate: new Date().toISOString() });

  useEffect(() => { document.title = "Debts — Personal Finance"; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Debts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Debt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Debt</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input type="number" placeholder={`Current Balance (${settings.baseCurrency})`} value={form.currentBalance} onChange={e => setForm(f => ({ ...f, currentBalance: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder={`Total Amount (${settings.baseCurrency})`} value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))} />
              <Input type="number" placeholder="Interest Rate (%)" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: parseFloat(e.target.value) || 0 }))} />
              <Input type="date" value={form.dueDate.slice(0,10)} onChange={e => setForm(f => ({ ...f, dueDate: new Date(e.target.value).toISOString() }))} />
              <Button onClick={() => { addDebt(form); setOpen(false); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Debt Tracker</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {debts.map(d => {
              const pct = Math.min(100, (1 - d.currentBalance / d.totalAmount) * 100);
              return (
                <div key={d.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{d.name}</div>
                    <div className="text-sm opacity-70">{pct.toFixed(0)}% paid</div>
                  </div>
                  <div className="h-2 rounded bg-secondary mt-2">
                    <div className="h-2 rounded bg-destructive" style={{ width: `${100 - pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>{d.currentBalance.toFixed(2)} / {d.totalAmount.toFixed(2)} {settings.baseCurrency} remaining</span>
                    {d.interestRate ? <span>{d.interestRate}% APR</span> : <span />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
