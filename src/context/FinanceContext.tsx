import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from "react";
import { addDays, addMonths, endOfDay, startOfDay } from "date-fns";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "MXN" | "ARS" | "COP" | "CLP" | "CHF";

export type AccountType = "Checking" | "Savings" | "Brokerage" | "Credit Card" | "Cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  initialAmount?: number; // initial balance in account currency
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "expense" | "income" | "both";
  budgetedAmount?: number; // optional per-category budgeting
}

export interface Expense {
  id: string;
  name: string;
  categoryId: string;
  amount: number; // in account currency
  accountId: string;
  date: string; // ISO
  budgetId?: string | null;
}

export interface Income {
  id: string;
  name: string;
  amount: number; // in account currency
  date: string; // ISO
  accountId: string;
  categoryId?: string | null;
}

export type Recurrence = "monthly" | "weekly" | "yearly";

export interface Budget {
  id: string;
  name: string;
  accountId?: string | null; // optional
  categoryId?: string | null; // target category or null for all
  amount: number; // target amount in base currency
  recurrence: Recurrence;
  startDate: string; // ISO
  endDate?: string | null; // ISO or null
}

export interface SavingGoal {
  id: string;
  name: string;
  totalAmount: number; // base currency
  currentAmount: number; // base currency
  startDate: string; // ISO
  endDate: string; // ISO
}

export interface Debt {
  id: string;
  name: string;
  currentBalance: number; // base currency
  totalAmount: number; // base currency
  interestRate?: number; // % annual
  dueDate?: string; // ISO
}

export interface Settings {
  baseCurrency: Currency;
  monthStartDay: number; // 1-31
  exchangeRates: Record<Currency, number>; // 1 baseCurrency = rate * currency
}

export interface FinanceState {
  accounts: Account[];
  categories: Category[];
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  savingGoals: SavingGoal[];
  debts: Debt[];
  settings: Settings;
}

const LS_KEY = "finance-state-v1";

const defaultState: FinanceState = {
  accounts: [
    { id: "acc-1", name: "Main Checking", type: "Checking", currency: "USD" },
    { id: "acc-2", name: "Brokerage", type: "Brokerage", currency: "USD" },
    { id: "acc-3", name: "EU Savings", type: "Savings", currency: "EUR" },
  ],
  categories: [
    { id: "cat-1", name: "Salary", type: "income" },
    { id: "cat-2", name: "Groceries", type: "expense" },
    { id: "cat-3", name: "Investments", type: "income" },
    { id: "cat-4", name: "Utilities", type: "expense" },
  ],
  expenses: [],
  incomes: [],
  budgets: [
    {
      id: "bud-1",
      name: "Groceries Monthly",
      categoryId: "cat-2",
      amount: 400,
      recurrence: "monthly",
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
      endDate: null,
      accountId: null,
    },
  ],
  savingGoals: [
    {
      id: "goal-1",
      name: "Emergency Fund",
      totalAmount: 5000,
      currentAmount: 1200,
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(),
      endDate: addMonths(new Date(), 12).toISOString(),
    },
  ],
  debts: [
    { id: "debt-1", name: "Credit Card", currentBalance: 850, totalAmount: 1200, interestRate: 24.9 },
  ],
  settings: {
    baseCurrency: "USD",
    monthStartDay: 25,
    exchangeRates: {
      USD: 1,
      EUR: 1.08,
      GBP: 1.27,
      JPY: 0.0064,
      MXN: 0.058,
      ARS: 0.0011,
      COP: 0.00026,
      CLP: 0.0011,
      CHF: 1.11,
    },
  },
};

function periodFor(date: Date, monthStartDay: number) {
  // Compute custom month period inclusive of start day
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), monthStartDay);
  let periodStart = start <= d ? start : new Date(d.getFullYear(), d.getMonth() - 1, monthStartDay);
  let periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, monthStartDay);
  periodEnd = addDays(periodEnd, -1);
  return { start: startOfDay(periodStart), end: endOfDay(periodEnd) };
}

function uid(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 9)}`; }

interface FinanceContextType extends FinanceState {
  convertToBase: (amount: number, currency: Currency) => number;
  currentPeriod: { start: Date; end: Date };
  addAccount: (a: Omit<Account, "id">) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  addIncome: (i: Omit<Income, "id">) => void;
  addCategory: (c: Omit<Category, "id">) => void;
  addBudget: (b: Omit<Budget, "id">) => void;
  addSavingGoal: (g: Omit<SavingGoal, "id">) => void;
  addDebt: (d: Omit<Debt, "id">) => void;
  updateSettings: (s: Partial<Settings>) => void;
  updateAccount: (id: string, a: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateIncome: (id: string, i: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  updateSavingGoal: (id: string, g: Partial<SavingGoal>) => void;
  deleteSavingGoal: (id: string) => void;
  updateDebt: (id: string, d: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(() => {
    const saved = localStorage.getItem(LS_KEY);
    return saved ? JSON.parse(saved) : defaultState;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const convertToBase = (amount: number, currency: Currency) => {
    const rate = state.settings.exchangeRates[currency] ?? 1;
    return amount * rate;
  };

  const currentPeriod = useMemo(() => periodFor(new Date(), state.settings.monthStartDay), [state.settings.monthStartDay]);

  const api: FinanceContextType = {
    ...state,
    convertToBase,
    currentPeriod,
    addAccount: (a) => setState(s => ({ ...s, accounts: [...s.accounts, { ...a, id: uid("acc") }] })),
    addExpense: (e) => setState(s => ({ ...s, expenses: [...s.expenses, { ...e, id: uid("exp") }] })),
    addIncome: (i) => setState(s => ({ ...s, incomes: [...s.incomes, { ...i, id: uid("inc") }] })),
    addCategory: (c) => setState(s => ({ ...s, categories: [...s.categories, { ...c, id: uid("cat") }] })),
    addBudget: (b) => setState(s => ({ ...s, budgets: [...s.budgets, { ...b, id: uid("bud") }] })),
    addSavingGoal: (g) => setState(s => ({ ...s, savingGoals: [...s.savingGoals, { ...g, id: uid("goal") }] })),
    addDebt: (d) => setState(s => ({ ...s, debts: [...s.debts, { ...d, id: uid("debt") }] })),
    updateSettings: (sPart) => setState(s => ({ ...s, settings: { ...s.settings, ...sPart } })),
    updateAccount: (id, a) => setState(s => ({ ...s, accounts: s.accounts.map(x => x.id === id ? { ...x, ...a } : x) })),
    deleteAccount: (id) => setState(s => ({ ...s, accounts: s.accounts.filter(x => x.id !== id) })),
    updateExpense: (id, e) => setState(s => ({ ...s, expenses: s.expenses.map(x => x.id === id ? { ...x, ...e } : x) })),
    deleteExpense: (id) => setState(s => ({ ...s, expenses: s.expenses.filter(x => x.id !== id) })),
    updateIncome: (id, i) => setState(s => ({ ...s, incomes: s.incomes.map(x => x.id === id ? { ...x, ...i } : x) })),
    deleteIncome: (id) => setState(s => ({ ...s, incomes: s.incomes.filter(x => x.id !== id) })),
    updateCategory: (id, c) => setState(s => ({ ...s, categories: s.categories.map(x => x.id === id ? { ...x, ...c } : x) })),
    deleteCategory: (id) => setState(s => ({ ...s, categories: s.categories.filter(x => x.id !== id) })),
    updateBudget: (id, b) => setState(s => ({ ...s, budgets: s.budgets.map(x => x.id === id ? { ...x, ...b } : x) })),
    deleteBudget: (id) => setState(s => ({ ...s, budgets: s.budgets.filter(x => x.id !== id) })),
    updateSavingGoal: (id, g) => setState(s => ({ ...s, savingGoals: s.savingGoals.map(x => x.id === id ? { ...x, ...g } : x) })),
    deleteSavingGoal: (id) => setState(s => ({ ...s, savingGoals: s.savingGoals.filter(x => x.id !== id) })),
    updateDebt: (id, d) => setState(s => ({ ...s, debts: s.debts.map(x => x.id === id ? { ...x, ...d } : x) })),
    deleteDebt: (id) => setState(s => ({ ...s, debts: s.debts.filter(x => x.id !== id) })),
  };

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
