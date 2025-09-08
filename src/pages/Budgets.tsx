import { useEffect, useMemo, useState } from "react";
import { useFinance, Recurrence } from "@/context/FinanceContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isWithinInterval,
} from "date-fns";

export default function Budgets() {
  const {
    budgets,
    categories,
    accounts,
    expenses,
    convertToBase,
    addBudget,
    updateBudget,
    deleteBudget,
    currentPeriod,
    settings,
  } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: 0,
    recurrence: "monthly" as Recurrence,
    startDate: new Date().toISOString(),
    endDate: null as string | null,
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: 0,
    recurrence: "monthly" as Recurrence,
    startDate: new Date().toISOString(),
    endDate: null as string | null,
  });

  useEffect(() => {
    document.title = "Budgets — Personal Finance";
  }, []);

  function budgetWindow(b: typeof form | (typeof budgets)[number]) {
    const start = new Date(b.startDate);
    let end: Date;
    switch (b.recurrence) {
      case "weekly":
        end = addWeeks(start, 1);
        break;
      case "yearly":
        end = addYears(start, 1);
        break;
      default:
        end = addMonths(start, 1);
        break;
    }
    return { start, end: addDays(end, -1) };
  }

  const rows = useMemo(
    () =>
      budgets.map((b) => {
        // Get expenses directly assigned to this budget
        const directExpenses = expenses.filter((e) => {
          // Check if expense is assigned to this budget
          if (e.budgetId !== b.id) return false;
          // Check if expense is within current period
          const within = isWithinInterval(new Date(e.date), {
            start: currentPeriod.start,
            end: currentPeriod.end,
          });
          return within;
        });

        // Calculate total spent
        const spent = directExpenses.reduce((s, e) => {
          const acc = accounts.find((a) => a.id === e.accountId)!;
          return s + convertToBase(e.amount, acc.currency);
        }, 0);

        const diff = b.amount - spent;
        const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;

        return {
          b,
          spent,
          diff,
          percentage: Math.min(percentage, 100),
          expenseCount: directExpenses.length,
        };
      }),
    [budgets, expenses, currentPeriod, accounts, convertToBase]
  );

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
              <Input
                placeholder="Budget Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="Budget Amount (base currency)"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <Select
                value={form.recurrence}
                onValueChange={(v: Recurrence) =>
                  setForm((f) => ({ ...f, recurrence: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={form.startDate.slice(0, 10)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    startDate: new Date(e.target.value).toISOString(),
                  }))
                }
              />
              <Button
                onClick={() => {
                  // Remove categoryId and accountId as they're no longer needed
                  addBudget({
                    name: form.name,
                    amount: form.amount,
                    recurrence: form.recurrence,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    categoryId: null,
                    accountId: null,
                  });
                  setOpen(false);
                  setForm({
                    name: "",
                    amount: 0,
                    recurrence: "monthly",
                    startDate: new Date().toISOString(),
                    endDate: null,
                  });
                }}
              >
                Save
              </Button>
              <p className="text-xs text-muted-foreground">
                Create a budget to track your expenses. You can assign expenses
                to this budget when creating or editing them.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Budget</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input
                placeholder="Budget Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="Budget Amount (base currency)"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
              <Select
                value={editForm.recurrence}
                onValueChange={(v: Recurrence) =>
                  setEditForm((f) => ({ ...f, recurrence: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Recurrence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={editForm.startDate.slice(0, 10)}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    startDate: new Date(e.target.value).toISOString(),
                  }))
                }
              />
              <Button
                onClick={() => {
                  if (editingId) {
                    updateBudget(editingId, {
                      name: editForm.name,
                      amount: editForm.amount,
                      recurrence: editForm.recurrence,
                      startDate: editForm.startDate,
                      endDate: editForm.endDate,
                      categoryId: null,
                      accountId: null,
                    });
                  }
                  setEditOpen(false);
                  setEditingId(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {rows.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No budgets created yet. Click "Add Budget" to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          rows.map(({ b, spent, diff, percentage, expenseCount }) => (
            <Card key={b.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{b.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(b.id);
                        setEditForm({
                          name: b.name,
                          amount: b.amount,
                          recurrence: b.recurrence,
                          startDate: b.startDate,
                          endDate: b.endDate || null,
                        });
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "Delete this budget? Expenses will not be deleted but will no longer be assigned to this budget."
                          )
                        ) {
                          deleteBudget(b.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {b.recurrence} Budget · {expenseCount} expense
                    {expenseCount !== 1 ? "s" : ""}
                  </span>
                  <span
                    className={`font-semibold ${
                      diff < 0 ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {diff >= 0 ? "+" : ""}
                    {diff.toFixed(2)} {settings.baseCurrency}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Spent: {spent.toFixed(2)} {settings.baseCurrency}
                    </span>
                    <span>
                      Budget: {b.amount.toFixed(2)} {settings.baseCurrency}
                    </span>
                  </div>
                  <Progress
                    value={percentage}
                    className={percentage > 100 ? "bg-destructive/20" : ""}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {percentage.toFixed(1)}% used
                  </div>
                </div>

                {percentage > 80 && percentage <= 100 && (
                  <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-950/20 p-2 rounded">
                    ⚠️ You've used {percentage.toFixed(1)}% of your budget
                  </div>
                )}

                {percentage > 100 && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    ⚠️ Budget exceeded by {(spent - b.amount).toFixed(2)}{" "}
                    {settings.baseCurrency}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
