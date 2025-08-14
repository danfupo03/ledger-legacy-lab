import { createClient } from "@supabase/supabase-js";

// Obtener credenciales de variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos para las tablas
export interface DatabaseAccount {
  id: string;
  name: string;
  type: string;
  currency: string;
  initial_amount?: number;
  note?: string;
  created_at?: string;
}

export interface DatabaseExpense {
  id: string;
  name: string;
  category_id: string;
  amount: number;
  account_id: string;
  date: string;
  budget_id?: string;
  created_at?: string;
}

export interface DatabaseIncome {
  id: string;
  name: string;
  amount: number;
  date: string;
  account_id: string;
  category_id?: string;
  created_at?: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  type: string;
  budgeted_amount?: number;
  created_at?: string;
}

export interface DatabaseBudget {
  id: string;
  name: string;
  account_id?: string;
  category_id?: string;
  amount: number;
  recurrence: string;
  start_date: string;
  end_date?: string;
  created_at?: string;
}

export interface DatabaseSavingGoal {
  id: string;
  name: string;
  total_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
  created_at?: string;
}

export interface DatabaseDebt {
  id: string;
  name: string;
  current_balance: number;
  total_amount: number;
  interest_rate?: number;
  due_date?: string;
  created_at?: string;
}

export interface DatabaseSettings {
  id: number;
  base_currency: string;
  month_start_day: number;
  exchange_rates: Record<string, number>;
  updated_at?: string;
}
