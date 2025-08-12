import { useEffect, useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { addDays, format } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary-foreground))", "hsl(var(--ring))"];

export default function Dashboard() {
  const { expenses, incomes, accounts, categories, convertToBase, currentPeriod, settings } = useFinance();

  useEffect(() => {
    document.title = "Dashboard — Personal Finance";
  }, []);

  const days = useMemo(() => {
    const arr: Date[] = [];
    for (let d = new Date(currentPeriod.start); d <= currentPeriod.end; d = addDays(d, 1)) arr.push(new Date(d));
    return arr;
  }, [currentPeriod]);

  const daily = useMemo(() => {
    return days.map((d) => {
      const key = format(d, "MM/dd");
      const exp = expenses.filter(e => new Date(e.date).toDateString() === d.toDateString()).reduce((sum, e) => {
        const acc = accounts.find(a => a.id === e.accountId)!;
        return sum + convertToBase(e.amount, acc.currency);
      }, 0);
      const inc = incomes.filter(i => new Date(i.date).toDateString() === d.toDateString()).reduce((sum, i) => {
        const acc = accounts.find(a => a.id === i.accountId)!;
        return sum + convertToBase(i.amount, acc.currency);
      }, 0);
      return { day: key, expenses: Number(exp.toFixed(2)), incomes: Number(inc.toFixed(2)) };
    });
  }, [days, expenses, incomes, accounts, convertToBase]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter(e => new Date(e.date) >= currentPeriod.start && new Date(e.date) <= currentPeriod.end)
      .forEach(e => {
        const acc = accounts.find(a => a.id === e.accountId)!;
        const base = convertToBase(e.amount, acc.currency);
        map[e.categoryId] = (map[e.categoryId] || 0) + base;
      });
    return Object.entries(map).map(([categoryId, value]) => ({
      name: categories.find(c => c.id === categoryId)?.name || "Unknown",
      value: Number(value.toFixed(2)),
    }));
  }, [expenses, accounts, convertToBase, currentPeriod, categories]);

  const totalExpenses = daily.reduce((s, d) => s + d.expenses, 0);
  const totalIncomes = daily.reduce((s, d) => s + d.incomes, 0);
  const balance = totalIncomes - totalExpenses;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Total Incomes ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">{totalIncomes.toFixed(2)}</CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Total Expenses ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">{totalExpenses.toFixed(2)}</CardContent>
        </Card>
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Balance ({settings.baseCurrency})</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">{balance.toFixed(2)}</CardContent>
        </Card>
      </section>

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
                <Line type="monotone" dataKey="incomes" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
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
                <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90}>
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
