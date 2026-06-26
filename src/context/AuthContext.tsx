import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

export type UserRole = "Admin" | "Analyst";

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  tokensUsed?: string;
  cost?: string;
  status?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem("sentinel_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("sentinel_user", JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.response?.data?.message || "Invalid credentials", variant: "destructive" });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await apiClient.post("/auth/signup", { name, email, password, role });
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("sentinel_user", JSON.stringify(res.data.user));
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.response?.data?.message || "Error creating account", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sentinel_user");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
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
