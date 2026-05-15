import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { roles } from "@/data/mockData";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: Record<string, unknown>) => Promise<void>;
  logout: () => void;
}

const USER_KEY = "ece-pulse-user";
const TOKEN_KEY = "ece-pulse-token";

const AuthContext = createContext<AuthContextValue | null>(null);

function readUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown): Role {
  return roles.includes(value as Role) ? (value as Role) : "Super Admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readUser());
  const loading = false;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email) => {
        const saved = readUser();
        const nextUser: User =
          saved?.email === email
            ? saved
            : {
                id: crypto.randomUUID(),
                fullName: email.toLowerCase().includes("joshua") ? "Joshua Apao" : "ECE Pulse User",
                employeeId: "ECE-0001",
                email,
                role: "Super Admin",
                site: "Noel",
                accountDepartment: "IT Support",
                isActive: true,
              };
        window.localStorage.setItem(TOKEN_KEY, `demo-token-${Date.now()}`);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      signup: async (payload) => {
        const nextUser: User = {
          id: crypto.randomUUID(),
          fullName: String(payload.fullName || payload.name || "ECE Pulse User"),
          employeeId: String(payload.employeeId || "ECE-NEW"),
          email: String(payload.email || "user@ecepulse.local"),
          role: normalizeRole(payload.role),
          site: String(payload.site || "Noel"),
          accountDepartment: String(payload.department || payload.accountDepartment || "Operations"),
          isActive: true,
        };
        window.localStorage.setItem(TOKEN_KEY, `demo-token-${Date.now()}`);
        window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setUser(null);
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
