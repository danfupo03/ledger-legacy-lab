import { useEffect, useMemo, useState } from "react";
import { useFinance, Income, Expense } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { addDays, format } from "date-fns";
import { Plus, Wallet, Banknote } from "lucide-react";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary-foreground))",
  "hsl(var(--ring))",
];

export default function Dashboard() {
  const {
    expenses,
    incomes,
    accounts,
    categories,
    convertToBase,
    currentPeriod,
    settings,
    addExpense,
    addIncome,
  } = useFinance();

  // Estados para los diálogos
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);

  // Estados para los formularios
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, "id">>({
    name: "",
    amount: 0,
    categoryId: "",
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [incomeForm, setIncomeForm] = useState<Omit<Income, "id">>({
    name: "",
    amount: 0,
    categoryId: null,
    accountId: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    document.title = "Dashboard — Personal Finance";
  }, []);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (
      let d = new Date(currentPeriod.start);
      d <= currentPeriod.end;
      d = addDays(d, 1)
    )
      arr.push(new Date(d));
    return arr;
  }, [currentPeriod]);

  const daily = useMemo(() => {
    return days.map((d) => {
      const key = format(d, "MM/dd");
      const exp = expenses
        .filter((e) => new Date(e.date).toDateString() === d.toDateString())
        .reduce((sum, e) => {
          const acc = accounts.find((a) => a.id === e.accountId)!;
          return sum + convertToBase(e.amount, acc.currency);
        }, 0);
      const inc = incomes
        .filter((i) => new Date(i.date).toDateString() === d.toDateString())
        .reduce((sum, i) => {
          const acc = accounts.find((a) => a.id === i.accountId)!;
          return sum + convertToBase(i.amount, acc.currency);
        }, 0);
      return {
        day: key,
        expenses: Number(exp.toFixed(2)),
        incomes: Number(inc.toFixed(2)),
      };
    });
  }, [days, expenses, incomes, accounts, convertToBase]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter(
        (e) =>
          new Date(e.date) >= currentPeriod.start &&
          new Date(e.date) <= currentPeriod.end
      )
      .forEach((e) => {
        const acc = accounts.find((a) => a.id === e.accountId)!;
        const base = convertToBase(e.amount, acc.currency);
        map[e.categoryId] = (map[e.categoryId] || 0) + base;
      });
    return Object.entries(map).map(([categoryId, value]) => ({
      name: categories.find((c) => c.id === categoryId)?.name || "Unknown",
      value: Number(value.toFixed(2)),
    }));
  }, [expenses, accounts, convertToBase, currentPeriod, categories]);

  const totalExpenses = daily.reduce((s, d) => s + d.expenses, 0);
  const totalIncomes = daily.reduce((s, d) => s + d.incomes, 0);
  const balance = totalIncomes - totalExpenses;

  // Funciones para manejar los formularios
  const handleAddExpense = () => {
    if (expenseForm.name && expenseForm.amount && expenseForm.accountId) {
      addExpense(expenseForm);
      setExpenseForm({
        name: "",
        amount: 0,
        categoryId: "",
        accountId: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      setExpenseOpen(false);
    }
  };

  const handleAddIncome = () => {
    if (incomeForm.name && incomeForm.amount && incomeForm.accountId) {
      addIncome(incomeForm);
      setIncomeForm({
        name: "",
        amount: 0,
        categoryId: null,
        accountId: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      setIncomeOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con botones de acción */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your financial data
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Botón Add Expense */}
          <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Add Expense
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Expense</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-name">Expense Name</Label>
                  <Input
                    id="expense-name"
                    placeholder="Name"
                    value={expenseForm.name}
                    onChange={(e) =>
                      setExpenseForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input
                    id="expense-amount"
                    type="number"
                    placeholder="Amount"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-date">Date</Label>
                  <Input
                    id="expense-date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Category</Label>
                  <Select
                    value={expenseForm.categoryId}
                    onValueChange={(v) =>
                      setExpenseForm((f) => ({ ...f, categoryId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.type !== "income")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-account">Account</Label>
                  <Select
                    value={expenseForm.accountId}
                    onValueChange={(v) =>
                      setExpenseForm((f) => ({ ...f, accountId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddExpense} className="w-full">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón Add Income */}
          <Dialog open={incomeOpen} onOpenChange={setIncomeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Add Income
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Income</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="income-name">Income Name</Label>
                  <Input
                    id="income-name"
                    placeholder="Name"
                    value={incomeForm.name}
                    onChange={(e) =>
                      setIncomeForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-amount">Amount</Label>
                  <Input
                    id="income-amount"
                    type="number"
                    placeholder="Amount"
                    value={incomeForm.amount}
                    onChange={(e) =>
                      setIncomeForm((f) => ({
                        ...f,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-date">Date</Label>
                  <Input
                    id="income-date"
                    type="date"
                    value={incomeForm.date}
                    onChange={(e) =>
                      setIncomeForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-category">Category (Optional)</Label>
                  <Select
                    value={incomeForm.categoryId || ""}
                    onValueChange={(v) =>
                      setIncomeForm((f) => ({ ...f, categoryId: v || null }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.type !== "expense")
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income-account">Account</Label>
                  <Select
                    value={incomeForm.accountId}
                    onValueChange={(v) =>
                      setIncomeForm((f) => ({ ...f, accountId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddIncome} className="w-full">
                  Add Income
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sección de tarjetas de resumen */}
      <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Total Incomes ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {totalIncomes.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Total Expenses ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {totalExpenses.toFixed(2)}
          </CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Balance ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {balance.toFixed(2)}
          </CardContent>
        </Card>
      </section>

      {/* Sección de gráficos */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Flow</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="incomes"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
