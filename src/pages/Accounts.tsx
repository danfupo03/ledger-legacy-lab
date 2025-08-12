import { useEffect, useState } from "react";
import { useFinance, Account, AccountType, Currency } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const types: AccountType[] = ["Checking", "Savings", "Brokerage", "Credit Card", "Cash"];
const currencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "MXN", "ARS", "COP", "CLP"];

export default function Accounts() {
  const { accounts, expenses, incomes, addAccount, convertToBase, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Account, "id">>({ name: "", type: "Checking", currency: settings.baseCurrency });

  useEffect(() => { document.title = "Accounts — Personal Finance"; }, []);

  const totals = (id: string) => {
    const exp = expenses.filter(e => e.accountId === id).reduce((s, e) => s + convertToBase(e.amount, accounts.find(a => a.id === id)!.currency), 0);
    const inc = incomes.filter(i => i.accountId === id).reduce((s, i) => s + convertToBase(i.amount, accounts.find(a => a.id === id)!.currency), 0);
    return { exp, inc, bal: inc - exp };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Accounts</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Account</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Select value={form.type} onValueChange={(v: AccountType) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.currency} onValueChange={(v: Currency) => setForm(f => ({ ...f, currency: v }))}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => { addAccount(form); setOpen(false); setForm({ name: "", type: "Checking", currency: settings.baseCurrency }); }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map(acc => {
          const t = totals(acc.id);
          return (
            <Card key={acc.id} className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{acc.name}</span>
                  <span className="text-sm opacity-70">{acc.type} · {acc.currency}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="opacity-70">Incomes</div>
                    <div className="font-semibold">{t.inc.toFixed(2)} {settings.baseCurrency}</div>
                  </div>
                  <div>
                    <div className="opacity-70">Expenses</div>
                    <div className="font-semibold">{t.exp.toFixed(2)} {settings.baseCurrency}</div>
                  </div>
                  <div>
                    <div className="opacity-70">Balance</div>
                    <div className="font-semibold">{t.bal.toFixed(2)} {settings.baseCurrency}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
