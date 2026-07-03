import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Shield, BrainCircuit, Activity, Mail, User, Building2,
  ArrowRight, ArrowLeft, CheckCircle2, Clock, RefreshCw, Loader2, MailCheck, AlertCircle
} from "lucide-react";

// ─── OTP Input Component ─────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newDigits = [...digits];
      if (newDigits[i]) {
        newDigits[i] = "";
        onChange(newDigits.join("").trim());
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        newDigits[i - 1] = "";
        onChange(newDigits.join("").trim());
      }
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[i] = val;
    onChange(newDigits.join("").trim());
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    if (pasted.length === 6) inputs.current[5]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50 shadow-sm"
        />
      ))}
    </div>
  );
}

// ─── Resend Timer ─────────────────────────────────────────────────────────────
function ResendTimer({ onResend }: { onResend: () => void }) {
  const [secs, setSecs] = useState(30);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  return (
    <p className="text-sm text-center text-slate-500 mt-4">
      {secs > 0
        ? <span className="flex items-center justify-center gap-1"><Clock className="w-3.5 h-3.5" /> Resend in {secs}s</span>
        : <button onClick={() => { onResend(); setSecs(30); }} className="text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1 w-full"><RefreshCw className="w-3.5 h-3.5" /> Resend OTP</button>
      }
    </p>
  );
}

// ─── Step Variants ───────────────────────────────────────────────────────────
const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

// ─── Main Component ───────────────────────────────────────────────────────────
type Flow = "login" | "signup";
type LoginStep = "email" | "otp";
type SignupStep = "details" | "otp" | "awaiting";

export default function Landing() {
  const { user, isLoading, initiateLogin, respondToChallenge, signUp, confirmSignUp, resendOtp, notifyAdmin } = useAuth();
  const navigate = useNavigate();

  const [flow, setFlow] = useState<Flow>("login");
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [signupStep, setSignupStep] = useState<SignupStep>("details");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSession, setLoginSession] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpPendingBanner, setLoginOtpPendingBanner] = useState("");

  // Signup state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [otpDestination, setOtpDestination] = useState("");
  const [sesNotified, setSesNotified] = useState<boolean | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) navigate("/dashboard");
  }, [user, isLoading, navigate]);

  if (user && !isLoading) return null;

  // ── LOGIN HANDLERS ──────────────────────────────────────────────────────────
  const handleLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await initiateLogin(loginEmail);
    setSubmitting(false);
    if (res.error) return;
    setLoginSession(res.challenge?.session || "");
    if (res.challenge?.otpPending) {
      setLoginOtpPendingBanner(res.challenge.message || "Please verify your email first.");
    } else {
      setLoginOtpPendingBanner("");
    }
    setLoginStep("otp");
  };

  const handleLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await respondToChallenge(loginEmail, loginOtp, loginSession);
    setSubmitting(false);
    if (res.awaitingApproval) {
      // Edge case: completed OTP from login page — move to awaiting state
      setFlow("signup");
      setSignupEmail(loginEmail);
      setSignupStep("awaiting");
      return;
    }
    if (res.user) navigate("/dashboard");
  };

  // ── SIGNUP HANDLERS ─────────────────────────────────────────────────────────
  const handleSignupDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await signUp({ firstName, lastName, companyName, email: signupEmail });
    setSubmitting(false);
    if (res.error) return;
    setOtpDestination(res.destination || signupEmail);
    setSignupStep("otp");
  };

  const handleSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await confirmSignUp(signupEmail, signupOtp);
    setSubmitting(false);
    if (res.error) return;
    if (res.awaitingApproval) {
      // Admin notification + user awaiting email are sent automatically by the backend
      setSignupStep("awaiting");
    }
  };

  const handleSesResponse = async (received: boolean) => {
    setSesNotified(received);
    if (!received) {
      // Trigger SES resend
      await notifyAdmin(signupEmail);
    }
  };

  const handleResendLoginOtp = () => resendOtp(loginEmail);
  const handleResendSignupOtp = () => resendOtp(signupEmail);

  // ── SHARED UI ───────────────────────────────────────────────────────────────
  const switchFlow = (f: Flow) => {
    setFlow(f);
    setLoginStep("email"); setLoginEmail(""); setLoginOtp(""); setLoginOtpPendingBanner("");
    setSignupStep("details"); setFirstName(""); setLastName(""); setCompanyName(""); setSignupEmail(""); setSignupOtp("");
    setSesNotified(null);
  };

  return (
    <div className="min-h-screen flex w-full relative bg-[#0F172A] overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[130px] animate-pulse" style={{ animationDuration: "15s" }} />
      </div>

      <div className="relative z-10 w-full flex">
        {/* Left branding */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Sentinel</span>
          </div>

          <div className="max-w-xl">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl lg:text-6xl font-black leading-tight mb-6">
              The Next-Gen <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Agentic Risk</span> Platform
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-lg text-slate-300 leading-relaxed mb-12">
              Automate KYB, continuous monitoring, and adverse media screening with state-of-the-art AI agents.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
              <div className="flex items-center gap-4 text-slate-200">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <BrainCircuit className="h-5 w-5 text-indigo-400" />
                </div>
                <div><h3 className="font-bold">Autonomous Agents</h3><p className="text-sm text-slate-400">Intelligent web crawling and reasoning.</p></div>
              </div>
              <div className="flex items-center gap-4 text-slate-200">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <div><h3 className="font-bold">Real-time Monitoring</h3><p className="text-sm text-slate-400">24/7 continuous screening pipeline.</p></div>
              </div>
            </motion.div>
          </div>

          <div className="text-sm text-slate-500 font-medium">© 2026 Sentinel Inc. All rights reserved.</div>
        </div>

        {/* Right — auth wizard */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Tab switcher */}
            {signupStep !== "awaiting" && !(flow === "signup" && signupStep === "otp") && (
              <div className="flex border-b border-slate-100">
                <button onClick={() => switchFlow("login")} className={`flex-1 py-4 text-sm font-bold transition-colors ${flow === "login" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}`}>
                  Sign In
                </button>
                <button onClick={() => switchFlow("signup")} className={`flex-1 py-4 text-sm font-bold transition-colors ${flow === "signup" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}`}>
                  Create Account
                </button>
              </div>
            )}

            <div className="p-8 sm:p-10">
              <AnimatePresence mode="wait">

                {/* ── LOGIN: Email ── */}
                {flow === "login" && loginStep === "email" && (
                  <motion.div key="login-email" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                    <div className="mb-8">
                      <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h2>
                      <p className="text-slate-500 text-sm">Enter your work email to receive a sign-in code.</p>
                    </div>
                    <form onSubmit={handleLoginEmail} className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-bold text-sm">Work Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@company.com" className="pl-9 bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-indigo-500" />
                        </div>
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4 ml-1" /></>}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* ── LOGIN: OTP ── */}
                {flow === "login" && loginStep === "otp" && (
                  <motion.div key="login-otp" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                    <button onClick={() => { setLoginStep("email"); setLoginOtp(""); setLoginOtpPendingBanner(""); }} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="mb-8">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <MailCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">Check your email</h2>
                      <p className="text-slate-500 text-sm">We sent a 6-digit code to <span className="font-bold text-slate-700">{loginEmail}</span></p>
                    </div>

                    {/* Edge case banner: OTP was pending from incomplete signup */}
                    {loginOtpPendingBanner && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 text-sm text-amber-800">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <span>{loginOtpPendingBanner}</span>
                      </div>
                    )}

                    <form onSubmit={handleLoginOtp} className="space-y-6">
                      <OtpInput value={loginOtp} onChange={setLoginOtp} disabled={submitting} />
                      <Button type="submit" disabled={submitting || loginOtp.length < 6} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                      </Button>
                    </form>
                    <ResendTimer onResend={handleResendLoginOtp} />
                  </motion.div>
                )}

                {/* ── SIGNUP: Details ── */}
                {flow === "signup" && signupStep === "details" && (
                  <motion.div key="signup-details" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                    <div className="mb-7">
                      <h2 className="text-2xl font-black text-slate-900 mb-1">Create an account</h2>
                      <p className="text-slate-500 text-sm">Join Sentinel as a new team member.</p>
                    </div>
                    <form onSubmit={handleSignupDetails} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-bold text-sm">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" className="pl-9 bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-indigo-500" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-slate-700 font-bold text-sm">Last Name</Label>
                          <Input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-bold text-sm">Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp" className="pl-9 bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-indigo-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-700 font-bold text-sm">Work Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input required type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="name@company.com" className="pl-9 bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-indigo-500" />
                        </div>
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 mt-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-1" /></>}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {/* ── SIGNUP: OTP ── */}
                {flow === "signup" && signupStep === "otp" && (
                  <motion.div key="signup-otp" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                    <button onClick={() => { setSignupStep("details"); setSignupOtp(""); }} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium mb-6">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="mb-8">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                        <MailCheck className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-1">Verify your email</h2>
                      <p className="text-slate-500 text-sm">Enter the 6-digit code sent to <span className="font-bold text-slate-700">{otpDestination || signupEmail}</span></p>
                    </div>
                    <form onSubmit={handleSignupOtp} className="space-y-6">
                      <OtpInput value={signupOtp} onChange={setSignupOtp} disabled={submitting} />
                      <Button type="submit" disabled={submitting || signupOtp.length < 6} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Email"}
                      </Button>
                    </form>
                    <ResendTimer onResend={handleResendSignupOtp} />
                  </motion.div>
                )}

                {/* ── SIGNUP: Awaiting Approval ── */}
                {flow === "signup" && signupStep === "awaiting" && (
                  <motion.div key="signup-awaiting" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                        <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Email Verified!</h2>
                      <p className="text-slate-500 text-sm leading-relaxed">Your account is now <span className="font-bold text-blue-600">awaiting admin approval</span>. You'll receive an email once your access is granted.</p>
                    </div>

                    {sesNotified === null && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                        <p className="text-sm font-bold text-slate-700 text-center mb-4">
                          Did you receive the admin notification email?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Button onClick={() => handleSesResponse(true)} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold">
                            Yes, received
                          </Button>
                          <Button onClick={() => handleSesResponse(false)} variant="outline" className="border-slate-300 text-slate-600 hover:bg-slate-100 font-bold">
                            No, resend
                          </Button>
                        </div>
                      </div>
                    )}

                    {sesNotified === true && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-emerald-800">All set!</p>
                        <p className="text-xs text-emerald-700 mt-1">Admin has been notified. You'll get an approval email soon.</p>
                      </motion.div>
                    )}

                    {sesNotified === false && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 text-center">
                        <MailCheck className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-indigo-800">Notification resent!</p>
                        <p className="text-xs text-indigo-700 mt-1">We've triggered another email to the admin. Please check again in a few minutes.</p>
                      </motion.div>
                    )}

                    <p className="text-xs text-slate-400 text-center mt-6">
                      Already approved?{" "}
                      <button onClick={() => switchFlow("login")} className="text-indigo-600 font-bold hover:underline">Sign in</button>
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
