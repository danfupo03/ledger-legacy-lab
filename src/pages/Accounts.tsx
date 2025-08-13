import { useEffect, useState } from "react";
import { useFinance, Account, AccountType, Currency } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const types: AccountType[] = ["Checking", "Savings", "Brokerage", "Credit Card", "Cash"];
const currencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "MXN", "ARS", "COP", "CLP", "CHF"];

export default function Accounts() {
  const { accounts, expenses, incomes, addAccount, updateAccount, deleteAccount, convertToBase, settings } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Account, "id">>({ name: "", type: "Checking", currency: settings.baseCurrency, initialAmount: 0 });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Account, "id">>({ name: "", type: "Checking", currency: settings.baseCurrency, initialAmount: 0 });

  useEffect(() => { document.title = "Accounts — Personal Finance"; }, []);

  const totals = (id: string) => {
    const account = accounts.find(a => a.id === id)!;
    const exp = expenses.filter(e => e.accountId === id).reduce((s, e) => s + convertToBase(e.amount, account.currency), 0);
    const inc = incomes.filter(i => i.accountId === id).reduce((s, i) => s + convertToBase(i.amount, account.currency), 0);
    const initial = convertToBase(account.initialAmount || 0, account.currency);
    return { exp, inc, bal: initial + inc - exp };
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
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input id="account-name" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Select value={form.type} onValueChange={(v: AccountType) => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-currency">Currency</Label>
                  <Select value={form.currency} onValueChange={(v: Currency) => setForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-amount">Initial Amount</Label>
                  <Input id="initial-amount" type="number" placeholder="Initial balance" value={form.initialAmount || ""} onChange={e => setForm(f => ({ ...f, initialAmount: parseFloat(e.target.value) || 0 }))} />
                </div>
                <Button onClick={() => { addAccount(form); setOpen(false); setForm({ name: "", type: "Checking", currency: settings.baseCurrency, initialAmount: 0 }); }}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Account</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-account-name">Account Name</Label>
                  <Input id="edit-account-name" placeholder="Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-account-type">Account Type</Label>
                  <Select value={editForm.type} onValueChange={(v: AccountType) => setEditForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-account-currency">Currency</Label>
                  <Select value={editForm.currency} onValueChange={(v: Currency) => setEditForm(f => ({ ...f, currency: v }))}>
                    <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-initial-amount">Initial Amount</Label>
                  <Input id="edit-initial-amount" type="number" placeholder="Initial balance" value={editForm.initialAmount || ""} onChange={e => setEditForm(f => ({ ...f, initialAmount: parseFloat(e.target.value) || 0 }))} />
                </div>
                <Button onClick={() => { if (editingId) updateAccount(editingId, editForm); setEditOpen(false); setEditingId(null); }}>Save Changes</Button>
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
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{acc.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm opacity-70">{acc.type} · {acc.currency}</span>
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(acc.id); setEditForm({ name: acc.name, type: acc.type, currency: acc.currency, initialAmount: acc.initialAmount || 0 }); setEditOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => { if (confirm("Delete this account?")) deleteAccount(acc.id); }}>Delete</Button>
                  </div>
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
