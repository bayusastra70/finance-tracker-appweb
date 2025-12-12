"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { authApi, ApiError } from "./api";

interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "finance_tracker_token";
const REFRESH_TOKEN_KEY = "finance_tracker_refresh_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const userData = await authApi.getMe(accessToken);
      setUser(userData);
      setToken(accessToken);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
      }
      throw err;
    }
  }, [logout]);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          await fetchUser(storedToken);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser, logout]);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
      await fetchUser(response.access_token);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await authApi.register(email, password, fullName);
      // Auto login after registration
      await login(email, password);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login (will be handled by middleware or useEffect)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
