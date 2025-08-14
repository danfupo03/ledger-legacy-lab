import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { addDays, addMonths, endOfDay, startOfDay } from "date-fns";
import { supabase } from "@/lib/supabase";

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "MXN"
  | "ARS"
  | "COP"
  | "CLP"
  | "CHF";
export type AccountType =
  | "Checking"
  | "Savings"
  | "Brokerage"
  | "Credit Card"
  | "Cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  initialAmount?: number;
  note?: string;
}

export interface Category {
  id: string;
  name: string;
  type: "expense" | "income" | "both";
  budgetedAmount?: number;
}

export interface Expense {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  accountId: string;
  date: string;
  budgetId?: string | null;
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  date: string;
  accountId: string;
  categoryId?: string | null;
}

export type Recurrence = "monthly" | "weekly" | "yearly";

export interface Budget {
  id: string;
  name: string;
  accountId?: string | null;
  categoryId?: string | null;
  amount: number;
  recurrence: Recurrence;
  startDate: string;
  endDate?: string | null;
}

export interface SavingGoal {
  id: string;
  name: string;
  totalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
}

export interface Debt {
  id: string;
  name: string;
  currentBalance: number;
  totalAmount: number;
  interestRate?: number;
  dueDate?: string;
}

export interface Settings {
  baseCurrency: Currency;
  monthStartDay: number;
  exchangeRates: Record<Currency, number>;
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
  loading: boolean;
}

export interface FinanceContextType extends FinanceState {
  convertToBase: (amount: number, currency: Currency) => number;
  currentPeriod: { start: Date; end: Date };
  addAccount: (a: Omit<Account, "id">) => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
  addIncome: (i: Omit<Income, "id">) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  addBudget: (b: Omit<Budget, "id">) => Promise<void>;
  addSavingGoal: (g: Omit<SavingGoal, "id">) => Promise<void>;
  addDebt: (d: Omit<Debt, "id">) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  updateAccount: (id: string, a: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  updateExpense: (id: string, e: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  updateIncome: (id: string, i: Partial<Income>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
  updateCategory: (id: string, c: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateBudget: (id: string, b: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  updateSavingGoal: (id: string, g: Partial<SavingGoal>) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  updateDebt: (id: string, d: Partial<Debt>) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
}

const defaultState: FinanceState = {
  accounts: [],
  categories: [],
  expenses: [],
  incomes: [],
  budgets: [],
  savingGoals: [],
  debts: [],
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
  loading: true,
};

function uid(prefix: string) {
  return prefix + "-" + Math.random().toString(36).substr(2, 9);
}

function periodFor(date: Date, monthStartDay: number) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), monthStartDay);
  const periodStart = start <= d ? start : addMonths(start, -1);
  const periodEnd = addDays(addMonths(periodStart, 1), -1);
  return { start: startOfDay(periodStart), end: endOfDay(periodEnd) };
}

const FinanceContext = createContext<FinanceContextType | null>(null);

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FinanceState>(defaultState);

  // Cargar todos los datos al iniciar
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setState((s) => ({ ...s, loading: true }));

      // Cargar datos en paralelo
      const [
        accountsRes,
        categoriesRes,
        expensesRes,
        incomesRes,
        budgetsRes,
        savingGoalsRes,
        debtsRes,
        settingsRes,
      ] = await Promise.all([
        supabase.from("accounts").select("*"),
        supabase.from("categories").select("*"),
        supabase.from("expenses").select("*"),
        supabase.from("incomes").select("*"),
        supabase.from("budgets").select("*"),
        supabase.from("saving_goals").select("*"),
        supabase.from("debts").select("*"),
        supabase.from("settings").select("*").single(),
      ]);

      // Transformar datos al formato del frontend
      const accounts = (accountsRes.data || []).map(transformAccountFromDB);
      const categories = (categoriesRes.data || []).map(
        transformCategoryFromDB
      );
      const expenses = (expensesRes.data || []).map(transformExpenseFromDB);
      const incomes = (incomesRes.data || []).map(transformIncomeFromDB);
      const budgets = (budgetsRes.data || []).map(transformBudgetFromDB);
      const savingGoals = (savingGoalsRes.data || []).map(
        transformSavingGoalFromDB
      );
      const debts = (debtsRes.data || []).map(transformDebtFromDB);
      const settings = settingsRes.data
        ? transformSettingsFromDB(settingsRes.data)
        : defaultState.settings;

      setState({
        accounts,
        categories,
        expenses,
        incomes,
        budgets,
        savingGoals,
        debts,
        settings,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      setState((s) => ({ ...s, loading: false }));
    }
  };

  // Funciones de transformación de datos
  const transformAccountFromDB = (dbAccount: any): Account => ({
    id: dbAccount.id,
    name: dbAccount.name,
    type: dbAccount.type,
    currency: dbAccount.currency,
    initialAmount: dbAccount.initial_amount,
    note: dbAccount.note,
  });

  const transformAccountToDB = (account: Account) => ({
    id: account.id,
    name: account.name,
    type: account.type,
    currency: account.currency,
    initial_amount: account.initialAmount,
    note: account.note,
  });

  const transformCategoryFromDB = (dbCategory: any): Category => ({
    id: dbCategory.id,
    name: dbCategory.name,
    type: dbCategory.type,
    budgetedAmount: dbCategory.budgeted_amount,
  });

  const transformCategoryToDB = (category: Category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
    budgeted_amount: category.budgetedAmount,
  });

  const transformExpenseFromDB = (dbExpense: any): Expense => ({
    id: dbExpense.id,
    name: dbExpense.name,
    categoryId: dbExpense.category_id,
    amount: dbExpense.amount,
    accountId: dbExpense.account_id,
    date: dbExpense.date,
    budgetId: dbExpense.budget_id,
  });

  const transformExpenseToDB = (expense: Expense) => ({
    id: expense.id,
    name: expense.name,
    category_id: expense.categoryId,
    amount: expense.amount,
    account_id: expense.accountId,
    date: expense.date,
    budget_id: expense.budgetId,
  });

  const transformIncomeFromDB = (dbIncome: any): Income => ({
    id: dbIncome.id,
    name: dbIncome.name,
    amount: dbIncome.amount,
    date: dbIncome.date,
    accountId: dbIncome.account_id,
    categoryId: dbIncome.category_id,
  });

  const transformIncomeToDB = (income: Income) => ({
    id: income.id,
    name: income.name,
    amount: income.amount,
    date: income.date,
    account_id: income.accountId,
    category_id: income.categoryId,
  });

  const transformBudgetFromDB = (dbBudget: any): Budget => ({
    id: dbBudget.id,
    name: dbBudget.name,
    accountId: dbBudget.account_id,
    categoryId: dbBudget.category_id,
    amount: dbBudget.amount,
    recurrence: dbBudget.recurrence,
    startDate: dbBudget.start_date,
    endDate: dbBudget.end_date,
  });

  const transformBudgetToDB = (budget: Budget) => ({
    id: budget.id,
    name: budget.name,
    account_id: budget.accountId,
    category_id: budget.categoryId,
    amount: budget.amount,
    recurrence: budget.recurrence,
    start_date: budget.startDate,
    end_date: budget.endDate,
  });

  const transformSavingGoalFromDB = (dbGoal: any): SavingGoal => ({
    id: dbGoal.id,
    name: dbGoal.name,
    totalAmount: dbGoal.total_amount,
    currentAmount: dbGoal.current_amount,
    startDate: dbGoal.start_date,
    endDate: dbGoal.end_date,
  });

  const transformSavingGoalToDB = (goal: SavingGoal) => ({
    id: goal.id,
    name: goal.name,
    total_amount: goal.totalAmount,
    current_amount: goal.currentAmount,
    start_date: goal.startDate,
    end_date: goal.endDate,
  });

  const transformDebtFromDB = (dbDebt: any): Debt => ({
    id: dbDebt.id,
    name: dbDebt.name,
    currentBalance: dbDebt.current_balance,
    totalAmount: dbDebt.total_amount,
    interestRate: dbDebt.interest_rate,
    dueDate: dbDebt.due_date,
  });

  const transformDebtToDB = (debt: Debt) => ({
    id: debt.id,
    name: debt.name,
    current_balance: debt.currentBalance,
    total_amount: debt.totalAmount,
    interest_rate: debt.interestRate,
    due_date: debt.dueDate,
  });

  const transformSettingsFromDB = (dbSettings: any): Settings => ({
    baseCurrency: dbSettings.base_currency,
    monthStartDay: dbSettings.month_start_day,
    exchangeRates: dbSettings.exchange_rates,
  });

  const transformSettingsToDB = (settings: Settings) => ({
    base_currency: settings.baseCurrency,
    month_start_day: settings.monthStartDay,
    exchange_rates: settings.exchangeRates,
  });

  const convertToBase = (amount: number, currency: Currency) => {
    const rate = state.settings.exchangeRates[currency] ?? 1;
    return amount * rate;
  };

  const currentPeriod = useMemo(
    () => periodFor(new Date(), state.settings.monthStartDay),
    [state.settings.monthStartDay]
  );

  // CRUD Functions
  const addAccount = async (account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: uid("acc") };
    const { error } = await supabase
      .from("accounts")
      .insert([transformAccountToDB(newAccount)]);

    if (!error) {
      setState((s) => ({ ...s, accounts: [...s.accounts, newAccount] }));
    }
  };

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const newExpense = { ...expense, id: uid("exp") };
    const { error } = await supabase
      .from("expenses")
      .insert([transformExpenseToDB(newExpense)]);

    if (!error) {
      setState((s) => ({ ...s, expenses: [...s.expenses, newExpense] }));
    }
  };

  const addIncome = async (income: Omit<Income, "id">) => {
    const newIncome = { ...income, id: uid("inc") };
    const { error } = await supabase
      .from("incomes")
      .insert([transformIncomeToDB(newIncome)]);

    if (!error) {
      setState((s) => ({ ...s, incomes: [...s.incomes, newIncome] }));
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    const newCategory = { ...category, id: uid("cat") };
    const { error } = await supabase
      .from("categories")
      .insert([transformCategoryToDB(newCategory)]);

    if (!error) {
      setState((s) => ({ ...s, categories: [...s.categories, newCategory] }));
    }
  };

  const addBudget = async (budget: Omit<Budget, "id">) => {
    const newBudget = { ...budget, id: uid("bud") };
    const { error } = await supabase
      .from("budgets")
      .insert([transformBudgetToDB(newBudget)]);

    if (!error) {
      setState((s) => ({ ...s, budgets: [...s.budgets, newBudget] }));
    }
  };

  const addSavingGoal = async (goal: Omit<SavingGoal, "id">) => {
    const newGoal = { ...goal, id: uid("goal") };
    const { error } = await supabase
      .from("saving_goals")
      .insert([transformSavingGoalToDB(newGoal)]);

    if (!error) {
      setState((s) => ({ ...s, savingGoals: [...s.savingGoals, newGoal] }));
    }
  };

  const addDebt = async (debt: Omit<Debt, "id">) => {
    const newDebt = { ...debt, id: uid("debt") };
    const { error } = await supabase
      .from("debts")
      .insert([transformDebtToDB(newDebt)]);

    if (!error) {
      setState((s) => ({ ...s, debts: [...s.debts, newDebt] }));
    }
  };

  const updateSettings = async (settingsPart: Partial<Settings>) => {
    const newSettings = { ...state.settings, ...settingsPart };
    const { error } = await supabase
      .from("settings")
      .update(transformSettingsToDB(newSettings))
      .eq("id", 1);

    if (!error) {
      setState((s) => ({ ...s, settings: newSettings }));
    }
  };

  const updateAccount = async (id: string, accountPart: Partial<Account>) => {
    const { error } = await supabase
      .from("accounts")
      .update(transformAccountToDB(accountPart as Account))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        accounts: s.accounts.map((x) =>
          x.id === id ? { ...x, ...accountPart } : x
        ),
      }));
    }
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        accounts: s.accounts.filter((x) => x.id !== id),
      }));
    }
  };

  const updateExpense = async (id: string, expensePart: Partial<Expense>) => {
    const { error } = await supabase
      .from("expenses")
      .update(transformExpenseToDB(expensePart as Expense))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        expenses: s.expenses.map((x) =>
          x.id === id ? { ...x, ...expensePart } : x
        ),
      }));
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        expenses: s.expenses.filter((x) => x.id !== id),
      }));
    }
  };

  const updateIncome = async (id: string, incomePart: Partial<Income>) => {
    const { error } = await supabase
      .from("incomes")
      .update(transformIncomeToDB(incomePart as Income))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        incomes: s.incomes.map((x) =>
          x.id === id ? { ...x, ...incomePart } : x
        ),
      }));
    }
  };

  const deleteIncome = async (id: string) => {
    const { error } = await supabase.from("incomes").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        incomes: s.incomes.filter((x) => x.id !== id),
      }));
    }
  };

  const updateCategory = async (
    id: string,
    categoryPart: Partial<Category>
  ) => {
    const { error } = await supabase
      .from("categories")
      .update(transformCategoryToDB(categoryPart as Category))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        categories: s.categories.map((x) =>
          x.id === id ? { ...x, ...categoryPart } : x
        ),
      }));
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        categories: s.categories.filter((x) => x.id !== id),
      }));
    }
  };

  const updateBudget = async (id: string, budgetPart: Partial<Budget>) => {
    const { error } = await supabase
      .from("budgets")
      .update(transformBudgetToDB(budgetPart as Budget))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        budgets: s.budgets.map((x) =>
          x.id === id ? { ...x, ...budgetPart } : x
        ),
      }));
    }
  };

  const deleteBudget = async (id: string) => {
    const { error } = await supabase.from("budgets").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        budgets: s.budgets.filter((x) => x.id !== id),
      }));
    }
  };

  const updateSavingGoal = async (
    id: string,
    goalPart: Partial<SavingGoal>
  ) => {
    const { error } = await supabase
      .from("saving_goals")
      .update(transformSavingGoalToDB(goalPart as SavingGoal))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        savingGoals: s.savingGoals.map((x) =>
          x.id === id ? { ...x, ...goalPart } : x
        ),
      }));
    }
  };

  const deleteSavingGoal = async (id: string) => {
    const { error } = await supabase.from("saving_goals").delete().eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        savingGoals: s.savingGoals.filter((x) => x.id !== id),
      }));
    }
  };

  const updateDebt = async (id: string, debtPart: Partial<Debt>) => {
    const { error } = await supabase
      .from("debts")
      .update(transformDebtToDB(debtPart as Debt))
      .eq("id", id);

    if (!error) {
      setState((s) => ({
        ...s,
        debts: s.debts.map((x) => (x.id === id ? { ...x, ...debtPart } : x)),
      }));
    }
  };

  const deleteDebt = async (id: string) => {
    const { error } = await supabase.from("debts").delete().eq("id", id);

    if (!error) {
      setState((s) => ({ ...s, debts: s.debts.filter((x) => x.id !== id) }));
    }
  };

  const api: FinanceContextType = {
    ...state,
    convertToBase,
    currentPeriod,
    addAccount,
    addExpense,
    addIncome,
    addCategory,
    addBudget,
    addSavingGoal,
    addDebt,
    updateSettings,
    updateAccount,
    deleteAccount,
    updateExpense,
    deleteExpense,
    updateIncome,
    deleteIncome,
    updateCategory,
    deleteCategory,
    updateBudget,
    deleteBudget,
    updateSavingGoal,
    deleteSavingGoal,
    updateDebt,
    deleteDebt,
  };

  return (
    <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>
  );
}
