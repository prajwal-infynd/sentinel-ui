import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

// NOTE: Auth methods mirror the Amazon Cognito API contract.
// In production, VITE_API_URL will point to the backend proxy that calls Cognito.
// No frontend code changes needed when switching from mock to production.

export interface User {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role: string;
  roleId?: number;
  tokensUsed?: string;
  cost?: string;
  status?: string;
  computedPermissions?: string[];
}

// Mirrors Cognito challenge response
export interface OtpChallenge {
  session: string;
  otpPending: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  // Login flow — mirrors Cognito InitiateAuth + RespondToAuthChallenge
  initiateLogin: (email: string) => Promise<{ challenge?: OtpChallenge; error?: string }>;
  respondToChallenge: (email: string, otp: string, session: string) => Promise<{ user?: User; awaitingApproval?: boolean; error?: string }>;
  // Signup flow — mirrors Cognito SignUp + ConfirmSignUp + SES
  signUp: (details: { firstName: string; lastName: string; companyName: string; email: string }) => Promise<{ destination?: string; error?: string }>;
  confirmSignUp: (email: string, otp: string) => Promise<{ awaitingApproval?: boolean; error?: string }>;
  resendOtp: (email: string) => Promise<{ error?: string }>;
  notifyAdmin: (email: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sentinel_user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  // --- LOGIN ---
  // Step 1: Mirrors Cognito InitiateAuth — sends OTP via SES
  const initiateLogin = async (email: string) => {
    try {
      const res = await apiClient.post("/auth/initiate-login", { email });
      return { challenge: res.data as OtpChallenge };
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to send OTP.";
      toast({ title: "Login Error", description: msg, variant: "destructive" });
      return { error: msg };
    }
  };

  // Step 2: Mirrors Cognito RespondToAuthChallenge — verifies OTP
  const respondToChallenge = async (email: string, otp: string, session: string) => {
    try {
      const res = await apiClient.post("/auth/respond-to-challenge", { email, otp, session });
      if (res.data.status === "awaiting_approval") {
        return { awaitingApproval: true };
      }
      const userData: User = res.data.user;
      setUser(userData);
      localStorage.setItem("sentinel_user", JSON.stringify(userData));
      // Store Cognito tokens — in production these would be used for API auth
      if (res.data.AuthenticationResult) {
        localStorage.setItem("sentinel_tokens", JSON.stringify(res.data.AuthenticationResult));
      }
      return { user: userData };
    } catch (error: any) {
      const msg = error.response?.data?.message || "OTP verification failed.";
      toast({ title: "Verification Failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  };

  // --- SIGNUP ---
  // Step 1: Mirrors Cognito SignUp — creates UNCONFIRMED user, SES sends OTP
  const signUp = async (details: { firstName: string; lastName: string; companyName: string; email: string }) => {
    try {
      const res = await apiClient.post("/auth/signup", details);
      return { destination: res.data.destination };
    } catch (error: any) {
      const msg = error.response?.data?.message || "Signup failed.";
      toast({ title: "Signup Error", description: msg, variant: "destructive" });
      return { error: msg };
    }
  };

  // Step 2: Mirrors Cognito ConfirmSignUp — verifies OTP, moves to awaiting_approval
  const confirmSignUp = async (email: string, otp: string) => {
    try {
      const res = await apiClient.post("/auth/respond-to-challenge", { email, otp, session: "signup-session" });
      if (res.data.status === "awaiting_approval") {
        return { awaitingApproval: true };
      }
      return {};
    } catch (error: any) {
      const msg = error.response?.data?.message || "OTP verification failed.";
      toast({ title: "Verification Failed", description: msg, variant: "destructive" });
      return { error: msg };
    }
  };

  // Mirrors Cognito ResendConfirmationCode
  const resendOtp = async (email: string) => {
    try {
      await apiClient.post("/auth/resend-otp", { email });
      toast({ title: "OTP Resent", description: "A new code has been sent to your email." });
      return {};
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to resend OTP.";
      toast({ title: "Error", description: msg, variant: "destructive" });
      return { error: msg };
    }
  };

  // Mirrors SES SendEmail via post-confirmation Lambda hook
  const notifyAdmin = async (email: string) => {
    try {
      await apiClient.post("/auth/notify-admin", { email });
    } catch {
      // Non-blocking — admin notification failure shouldn't block the user
      console.warn("[Auth] Admin notification failed, will retry in background.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sentinel_user");
    localStorage.removeItem("sentinel_tokens");
    window.location.href = "/login";
  };

  const hasPermission = (permission: string) => {
    if (!user?.computedPermissions) return false;
    return user.computedPermissions.includes("admin:*") || user.computedPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, initiateLogin, respondToChallenge, signUp, confirmSignUp, resendOtp, notifyAdmin, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
