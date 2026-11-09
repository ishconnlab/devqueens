/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";

export interface SessionUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: "member" | "admin";
  memberId?: string;
  status?: "active" | "suspended";
  joinedAt?: string;
  profile?: {
    bio?: string;
    photoUrl?: string;
    country?: string;
    interests?: string[];
    visibility?: "public" | "private";
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<SessionUser>;
  adminLogin: (email: string, password: string) => Promise<SessionUser>;
  register: (name: string, email: string, password: string, memberDetails: {
    country: string;
    institutionType: "school" | "other";
    institutionName: string;
    district: string;
    ageRange: "13-15" | "16-17" | "18-24" | "25+";
  }) => Promise<SessionUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setError("");
    try {
      const result = await api<{ user: SessionUser }>("/auth/me");
      setUser(result.user);
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        setUser(null);
      } else {
        setError(cause instanceof Error ? cause.message : "The account service is unavailable.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api<{ user: SessionUser }>("/auth/login", { method: "POST", body: { email, password } });
    setUser(result.user);
    setError("");
    return result.user;
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const result = await api<{ user: SessionUser }>("/auth/admin-login", { method: "POST", body: { email, password } });
    setUser(result.user);
    setError("");
    return result.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, memberDetails: {
    country: string;
    institutionType: "school" | "other";
    institutionName: string;
    district: string;
    ageRange: "13-15" | "16-17" | "18-24" | "25+";
  }) => {
    const result = await api<{ user: SessionUser }>("/auth/register", { method: "POST", body: { name, email, password, memberDetails } });
    setUser(result.user);
    setError("");
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, error, login, adminLogin, register, logout, refresh }), [user, loading, error, login, adminLogin, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
