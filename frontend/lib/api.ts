const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Merge existing headers if any
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.assign(headers, existingHeaders);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.detail || "An error occurred",
      response.status,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    ),

  register: (email: string, password: string, full_name: string) =>
    fetchApi<{ id: number; email: string; full_name: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, full_name }),
      }
    ),

  getMe: (token: string) =>
    fetchApi<{ id: number; email: string; full_name: string; is_active: boolean }>(
      "/auth/me",
      { token }
    ),

  refresh: (refreshToken: string) =>
    fetchApi<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify(refreshToken),
      }
    ),
};

// Accounts API
export const accountsApi = {
  getAll: (token: string) =>
    fetchApi<Array<{
      id: number;
      name: string;
      account_type: string;
      balance: number;
      currency: string;
      is_active: boolean;
    }>>("/accounts/", { token }),

  getOne: (token: string, id: number) =>
    fetchApi<{
      id: number;
      name: string;
      account_type: string;
      balance: number;
      currency: string;
    }>(`/accounts/${id}`, { token }),

  create: (
    token: string,
    data: { name: string; account_type: string; balance?: number; currency?: string }
  ) =>
    fetchApi("/accounts/", {
      token,
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (token: string, id: number, data: Partial<{ name: string; balance: number }>) =>
    fetchApi(`/accounts/${id}`, {
      token,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: number) =>
    fetchApi(`/accounts/${id}`, { token, method: "DELETE" }),
};

// Categories API
export const categoriesApi = {
  getAll: (token: string, type?: "income" | "expense") => {
    const query = type ? `?category_type=${type}` : "";
    return fetchApi<Array<{
      id: number;
      name: string;
      category_type: string;
      icon: string | null;
      color: string | null;
    }>>(`/categories/${query}`, { token });
  },

  create: (
    token: string,
    data: { name: string; category_type: string; icon?: string; color?: string }
  ) =>
    fetchApi("/categories/", {
      token,
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (token: string, id: number, data: Partial<{ name: string; icon: string }>) =>
    fetchApi(`/categories/${id}`, {
      token,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: number) =>
    fetchApi(`/categories/${id}`, { token, method: "DELETE" }),
};

// Transactions API
export const transactionsApi = {
  getAll: (
    token: string,
    filters?: {
      start_date?: string;
      end_date?: string;
      transaction_type?: string;
      category_id?: number;
      account_id?: number;
      limit?: number;
      offset?: number;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchApi<Array<{
      id: number;
      amount: number;
      transaction_type: string;
      description: string | null;
      transaction_date: string;
      account_name: string;
      category_name: string | null;
    }>>(`/transactions/${query}`, { token });
  },

  getOne: (token: string, id: number) =>
    fetchApi(`/transactions/${id}`, { token }),

  create: (
    token: string,
    data: {
      account_id: number;
      category_id?: number;
      amount: number;
      transaction_type: string;
      description?: string;
      transaction_date: string;
    }
  ) =>
    fetchApi("/transactions/", {
      token,
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (token: string, id: number, data: Partial<{ amount: number; description: string }>) =>
    fetchApi(`/transactions/${id}`, {
      token,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (token: string, id: number) =>
    fetchApi(`/transactions/${id}`, { token, method: "DELETE" }),
};

// Analytics API
export const analyticsApi = {
  getSummary: (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return fetchApi<{
      total_balance: number;
      total_income: number;
      total_expense: number;
      net_flow: number;
      transaction_count: number;
    }>(`/analytics/summary${query}`, { token });
  },

  getByCategory: (
    token: string,
    transactionType: "income" | "expense" = "expense",
    startDate?: string,
    endDate?: string
  ) => {
    const params = new URLSearchParams({ transaction_type: transactionType });
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return fetchApi<Array<{
      category_id: number;
      category_name: string;
      total: number;
      count: number;
    }>>(`/analytics/by-category?${params.toString()}`, { token });
  },

  getTrends: (token: string, year?: number) => {
    const query = year ? `?year=${year}` : "";
    return fetchApi<Array<{ month: number; income: number; expense: number }>>(
      `/analytics/trends${query}`,
      { token }
    );
  },
};

export { ApiError };
