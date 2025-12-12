// API Types for Finance Tracker

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  account_type: "cash" | "bank" | "e-wallet" | "credit_card";
  balance: number;
  currency: string;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  category_type: "income" | "expense";
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  amount: number;
  transaction_type: "income" | "expense" | "transfer";
  description: string | null;
  transaction_date: string;
  notes: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  account_name?: string;
  category_name?: string;
  category_icon?: string;
}

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface CreateAccountRequest {
  name: string;
  account_type: string;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
}

export interface CreateCategoryRequest {
  name: string;
  category_type: "income" | "expense";
  icon?: string;
  color?: string;
}

export interface CreateTransactionRequest {
  account_id: number;
  category_id?: number;
  amount: number;
  transaction_type: "income" | "expense" | "transfer";
  description?: string;
  transaction_date: string;
  notes?: string;
  tags?: string;
}

export interface TransactionFilter {
  start_date?: string;
  end_date?: string;
  transaction_type?: string;
  category_id?: number;
  account_id?: number;
  limit?: number;
  offset?: number;
}

// Analytics types
export interface FinancialSummary {
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_flow: number;
  transaction_count: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  icon: string | null;
  color: string | null;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: number;
  income: number;
  expense: number;
}
