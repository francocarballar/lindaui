"use client";
import { createContext, useContext, type ReactNode } from "react";

export interface AuthUser {
  name?: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({
  user,
  children,
}: {
  user: AuthUser | null;
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): { user: AuthUser | null } {
  return useContext(AuthContext);
}
