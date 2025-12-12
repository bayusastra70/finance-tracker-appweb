"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { categoriesApi } from "@/lib/api";

interface Category {
  id: number;
  name: string;
  category_type: string;
  icon: string | null;
  color: string | null;
  user_id: number | null;
  is_default: boolean;
}

const categoryIcons = ["🍔", "🛒", "🚗", "🏠", "💡", "📱", "🎮", "👕", "💊", "✈️", "🎓", "💼", "🎁", "💰", "📈", "🏦"];
const categoryColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export default function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [formData, setFormData] = useState({
    name: "",
    category_type: "expense",
    icon: "🛒",
    color: "#10b981",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    if (!token) return;
    try {
      const data = await categoriesApi.getAll(token);
      setCategories(data as Category[]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSubmitting(true);
    try {
      await categoriesApi.create(token, {
        name: formData.name,
        category_type: formData.category_type,
        icon: formData.icon,
        color: formData.color,
      });
      setShowAddModal(false);
      setFormData({ name: "", category_type: "expense", icon: "🛒", color: "#10b981" });
      fetchCategories();
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Delete this category?")) return;
    try {
      await categoriesApi.delete(token, id);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const filteredCategories = categories.filter((c) => c.category_type === activeTab);
  const expenseCount = categories.filter((c) => c.category_type === "expense").length;
  const incomeCount = categories.filter((c) => c.category_type === "income").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Categories</h1>
          <p className="mt-1 text-zinc-400">Organize your transactions</p>
        </div>
        <Button onClick={() => { setFormData({ ...formData, category_type: activeTab }); setShowAddModal(true); }}>
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
            activeTab === "expense"
              ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          <span>Expense</span>
          <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs">{expenseCount}</span>
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all ${
            activeTab === "income"
              ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/50"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          <span>Income</span>
          <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-xs">{incomeCount}</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-zinc-800" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-3xl">
              🏷️
            </div>
            <p className="text-zinc-400">No {activeTab} categories yet</p>
            <p className="mt-1 text-sm text-zinc-500">Create categories to organize your transactions</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filteredCategories.map((category) => (
            <Card key={category.id} variant="glass" className="group relative">
              <CardContent className="flex items-center gap-4 pt-6">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${category.color || "#10b981"}20` }}
                >
                  {category.icon || "📁"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{category.name}</h3>
                  {category.is_default && (
                    <span className="text-xs text-zinc-500">Default</span>
                  )}
                </div>
                {!category.is_default && (
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-lg p-2 text-zinc-500 opacity-0 transition-all hover:bg-zinc-800 hover:text-red-400 group-hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Add Category</CardTitle>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type Toggle */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category_type: "expense" })}
                      className={`flex-1 rounded-lg py-2.5 font-medium transition-all ${
                        formData.category_type === "expense"
                          ? "bg-red-500/20 text-red-400 ring-2 ring-red-500/50"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, category_type: "income" })}
                      className={`flex-1 rounded-lg py-2.5 font-medium transition-all ${
                        formData.category_type === "income"
                          ? "bg-green-500/20 text-green-400 ring-2 ring-green-500/50"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      Income
                    </button>
                  </div>

                  <Input
                    label="Category Name"
                    placeholder="e.g., Food & Drinks"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />

                  {/* Icon Picker */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {categoryIcons.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all ${
                            formData.icon === icon
                              ? "bg-emerald-500/20 ring-2 ring-emerald-500"
                              : "bg-zinc-800 hover:bg-zinc-700"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-zinc-300">Color</label>
                    <div className="flex gap-2">
                      {categoryColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className={`h-8 w-8 rounded-full transition-all ${
                            formData.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                      Add Category
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
