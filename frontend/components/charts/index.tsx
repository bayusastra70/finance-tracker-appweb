"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface MonthlyTrendsChartProps {
  data: Array<{ month: number; income: number; expense: number }>;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartData = data.map((item) => ({
    month: monthNames[item.month - 1],
    income: item.income,
    expense: item.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value: number) =>
            new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
          }
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#incomeGradient)"
          name="Income"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#expenseGradient)"
          name="Expense"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface CategoryBreakdownChartProps {
  data: Array<{ category_name: string; total: number; color?: string }>;
}

const defaultColors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.category_name,
    value: item.total,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value: number) => [
            new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value),
            "Amount",
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface IncomeExpenseBarChartProps {
  data: Array<{ month: number; income: number; expense: number }>;
}

export function IncomeExpenseBarChart({ data }: IncomeExpenseBarChartProps) {
  const chartData = data.map((item) => ({
    month: monthNames[item.month - 1],
    income: item.income,
    expense: item.expense,
    net: item.income - item.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value: number) =>
            new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)
          }
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
