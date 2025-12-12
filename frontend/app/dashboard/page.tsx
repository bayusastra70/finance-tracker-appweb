"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { MonthlyTrendsChart, CategoryBreakdownChart } from "@/components/charts";
import { useAuth } from "@/lib/auth";
import { analyticsApi, transactionsApi, accountsApi } from "@/lib/api";

interface SummaryData {
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_flow: number;
  transaction_count: number;
}

interface MonthlyTrend {
  month: number;
  income: number;
  expense: number;
}

interface CategoryData {
  category_id: number;
  category_name: string;
  total: number;
  count: number;
}

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string | null;
  transaction_date: string;
  account_name: string;
  category_name: string | null;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      
      try {
        const [summaryRes, trendsRes, categoryRes, txRes] = await Promise.all([
          analyticsApi.getSummary(token),
          analyticsApi.getTrends(token),
          analyticsApi.getByCategory(token, "expense"),
          transactionsApi.getAll(token, { limit: 5 }),
        ]);
        
        setSummary(summaryRes);
        setTrends(trendsRes);
        setCategoryData(categoryRes);
        setRecentTransactions(txRes);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  };

  const summaryCards = [
    {
      title: "Total Balance",
      value: formatCurrency(summary?.total_balance || 0),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
    },
    {
      title: "Total Income",
      value: formatCurrency(summary?.total_income || 0),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500",
      textColor: "text-green-400",
    },
    {
      title: "Total Expense",
      value: formatCurrency(summary?.total_expense || 0),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      ),
      color: "from-red-500 to-rose-500",
      textColor: "text-red-400",
    },
    {
      title: "Net Flow",
      value: formatCurrency(summary?.net_flow || 0),
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: (summary?.net_flow || 0) >= 0 ? "from-emerald-500 to-teal-500" : "from-red-500 to-rose-500",
      textColor: (summary?.net_flow || 0) >= 0 ? "text-emerald-400" : "text-red-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.full_name?.split(" ")[0] || "User"} 👋
          </h1>
          <p className="mt-2 text-zinc-400">
            Here&apos;s an overview of your finances
          </p>
        </div>
        <Link href="/dashboard/transactions">
          <Button>
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, index) => (
          <Card key={index} variant="gradient" className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {card.title}
              </CardTitle>
              <div className={`${card.textColor}`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent className="relative">
              {isLoading ? (
                <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />
              ) : (
                <div className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trends Chart */}
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] animate-pulse rounded-lg bg-zinc-800" />
            ) : trends.length > 0 && trends.some(t => t.income > 0 || t.expense > 0) ? (
              <MonthlyTrendsChart data={trends} />
            ) : (
              <div className="flex h-[300px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                  <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-zinc-400">No data yet</p>
                <p className="mt-1 text-sm text-zinc-500">Add transactions to see trends</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card variant="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Spending by Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[250px] animate-pulse rounded-lg bg-zinc-800" />
            ) : categoryData.length > 0 ? (
              <>
                <CategoryBreakdownChart data={categoryData} />
                <div className="mt-4 space-y-2">
                  {categoryData.slice(0, 4).map((cat, index) => (
                    <div key={cat.category_id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"][index] }}
                        />
                        <span className="text-zinc-400">{cat.category_name}</span>
                      </div>
                      <span className="font-medium text-white">{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                  <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
                <p className="text-zinc-400">No data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <Link href="/dashboard/transactions" className="text-sm text-emerald-400 hover:text-emerald-300">
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-800" />
              ))}
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.transaction_type === "income"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {tx.transaction_type === "income" ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {tx.description || tx.category_name || "No description"}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>{tx.account_name}</span>
                        <span>•</span>
                        <span>{formatDate(tx.transaction_date)}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-lg font-semibold ${
                      tx.transaction_type === "income" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tx.transaction_type === "income" ? "+" : "-"}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-zinc-400">No transactions yet</p>
              <Link href="/dashboard/transactions">
                <Button className="mt-4" size="sm">
                  Add your first transaction
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {!isLoading && summary && (
        <div className="text-center text-sm text-zinc-500">
          {summary.transaction_count} total transactions
        </div>
      )}
    </div>
  );
}
