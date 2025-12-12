"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { transactionsApi, accountsApi, categoriesApi } from "@/lib/api";

interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string | null;
  transaction_date: string;
  account_name: string;
  category_name: string | null;
}

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: number;
}

interface Category {
  id: number;
  name: string;
  category_type: string;
}

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState({
    type: "",
    startDate: "",
    endDate: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    account_id: 0,
    category_id: 0,
    amount: "",
    transaction_type: "expense",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    
    try {
      const [txData, accData, catData] = await Promise.all([
        transactionsApi.getAll(token, {
          transaction_type: filter.type || undefined,
          start_date: filter.startDate || undefined,
          end_date: filter.endDate || undefined,
        }),
        accountsApi.getAll(token),
        categoriesApi.getAll(token),
      ]);
      setTransactions(txData);
      setAccounts(accData);
      setCategories(catData);
      
      // Set default account if available
      if (accData.length > 0 && formData.account_id === 0) {
        setFormData(prev => ({ ...prev, account_id: accData[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await transactionsApi.create(token, {
        account_id: formData.account_id,
        category_id: formData.category_id || undefined,
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        description: formData.description || undefined,
        transaction_date: formData.transaction_date,
      });
      
      setShowAddModal(false);
      setFormData({
        account_id: accounts[0]?.id || 0,
        category_id: 0,
        amount: "",
        transaction_type: "expense",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this transaction?")) return;
    
    try {
      await transactionsApi.delete(token, id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCategories = categories.filter(
    (c) => c.category_type === formData.transaction_type
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <p className="mt-1 text-zinc-400">Manage your income and expenses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card variant="glass">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <label className="mb-1.5 block text-sm text-zinc-400">Type</label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">Start Date</label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-zinc-400">End Date</label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                className="rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {(filter.type || filter.startDate || filter.endDate) && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter({ type: "", startDate: "", endDate: "" })}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card variant="gradient">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-800" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                <svg className="h-8 w-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-zinc-400">No transactions found</p>
              <p className="mt-1 text-sm text-zinc-500">
                {accounts.length === 0 
                  ? "Create an account first to add transactions"
                  : "Click the button above to add your first transaction"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
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
                        {tx.category_name && (
                          <>
                            <span>•</span>
                            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                              {tx.category_name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-semibold ${
                        tx.transaction_type === "income" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.transaction_type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add Transaction</CardTitle>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-zinc-400">You need to create an account first</p>
                    <Button className="mt-4" onClick={() => window.location.href = "/dashboard/accounts"}>
                      Create Account
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Transaction Type Toggle */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, transaction_type: "expense", category_id: 0 })}
                        className={`flex-1 rounded-lg py-2.5 font-medium transition-all ${
                          formData.transaction_type === "expense"
                            ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, transaction_type: "income", category_id: 0 })}
                        className={`flex-1 rounded-lg py-2.5 font-medium transition-all ${
                          formData.transaction_type === "income"
                            ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/50"
                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        Income
                      </button>
                    </div>

                    <Input
                      type="number"
                      label="Amount"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-300">Account</label>
                      <select
                        value={formData.account_id}
                        onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                        required
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({formatCurrency(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                      >
                        <option value={0}>No category</option>
                        {filteredCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      type="text"
                      label="Description"
                      placeholder="What's this for?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <Input
                      type="date"
                      label="Date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                      required
                    />

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        isLoading={isSubmitting}
                      >
                        Add Transaction
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
