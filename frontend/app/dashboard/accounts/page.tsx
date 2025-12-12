"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { accountsApi } from "@/lib/api";

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: number;
  currency: string;
}

const accountTypeIcons: Record<string, string> = {
  cash: "💵",
  bank: "🏦",
  "e-wallet": "📱",
  credit_card: "💳",
};

export default function AccountsPage() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    account_type: "bank",
    balance: 0,
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) return;
      try {
        const data = await accountsApi.getAll(token);
        setAccounts(data);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccounts();
  }, [token]);

  const handleAddAccount = async () => {
    if (!token || !newAccount.name) return;
    try {
      const created = await accountsApi.create(token, newAccount);
      setAccounts([...accounts, created]);
      setShowAddModal(false);
      setNewAccount({ name: "", account_type: "bank", balance: 0 });
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!token) return;
    try {
      await accountsApi.delete(token, id);
      setAccounts(accounts.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Accounts</h1>
          <p className="mt-1 text-zinc-400">Manage your accounts and wallets</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Account
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card variant="gradient">
        <CardContent className="p-6">
          <p className="text-sm text-zinc-400">Total Balance</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{formatCurrency(totalBalance)}</p>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-zinc-400">No accounts yet</p>
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              Add your first account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <Card key={account.id} variant="glass" className="group relative">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{accountTypeIcons[account.account_type] || "💰"}</span>
                  <div>
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <p className="text-sm capitalize text-zinc-500">{account.account_type.replace("_", " ")}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAccount(account.id)}
                  className="rounded p-1 text-zinc-500 opacity-0 hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{formatCurrency(account.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card variant="glass" className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Account Name"
                placeholder="e.g., Main Savings"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">Account Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(accountTypeIcons).map(([type, icon]) => (
                    <button
                      key={type}
                      onClick={() => setNewAccount({ ...newAccount, account_type: type })}
                      className={`flex flex-col items-center gap-1 rounded-lg p-3 transition-colors ${
                        newAccount.account_type === type
                          ? "bg-emerald-500/20 ring-2 ring-emerald-500"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      <span className="text-xs capitalize text-zinc-400">{type.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Initial Balance"
                type="number"
                placeholder="0"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
              />
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddAccount}>
                  Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
