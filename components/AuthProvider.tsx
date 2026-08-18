"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
} | null;

type AuthContextValue = {
  user: AuthUser;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setStatus("authenticated");
          return;
        }
      }
      setUser(null);
      setStatus("unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setStatus("unauthenticated");
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ user, status, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
