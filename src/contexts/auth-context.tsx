import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi } from "@/services/api";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("auth.token");
    const u = localStorage.getItem("auth.user");
    if (t && u) {
      setToken(t);
      try { setUser(JSON.parse(u)); } catch { /* noop */ }
    }
    setLoading(false);
  }, []);

  const persist = (session: { token: string; user: User }, remember = true) => {
    setToken(session.token);
    setUser(session.user);
    if (remember) {
      localStorage.setItem("auth.token", session.token);
      localStorage.setItem("auth.user", JSON.stringify(session.user));
    } else {
      sessionStorage.setItem("auth.token", session.token);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    async login(email, password, remember = true) {
      const session = await authApi.login(email, password);
      persist(session, remember);
    },
    async register(name, email, password) {
      const session = await authApi.register(name, email, password);
      persist(session, true);
    },
    async logout() {
      await authApi.logout();
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth.token");
      localStorage.removeItem("auth.user");
      sessionStorage.removeItem("auth.token");
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
