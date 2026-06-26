import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, BrainCircuit, Activity, Lock, Mail, User, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to dashboard
  if (user && !isLoading) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await signup(name, email, password);
    }
    setIsSubmitting(false);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex w-full relative bg-[#0F172A] overflow-hidden">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '15s' }} />
      </div>

      <div className="relative z-10 w-full flex">
        {/* Left Section - Branding & Value Prop */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 lg:p-20 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">Sentinel</span>
          </div>

          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              The Next-Gen <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Agentic Risk</span> Platform
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-300 leading-relaxed mb-12"
            >
              Automate KYB, transaction monitoring, and adverse media screening with state-of-the-art AI agents.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 text-slate-200">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <BrainCircuit className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold">Autonomous Agents</h3>
                  <p className="text-sm text-slate-400">Intelligent web crawling and reasoning.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-200">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold">Real-time Monitoring</h3>
                  <p className="text-sm text-slate-400">24/7 continuous screening pipeline.</p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-sm text-slate-500 font-medium">
            © 2026 Sentinel Inc. All rights reserved.
          </div>
        </div>

        {/* Right Section - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                  {isLogin ? "Welcome back" : "Create an account"}
                </h2>
                <p className="text-slate-500 font-medium">
                  {isLogin ? "Sign in to access your workspace" : "Join Sentinel as a new team member"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label className="text-slate-700 font-bold">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input 
                          required={!isLogin}
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Jane Doe" 
                          className="pl-10 bg-slate-50 border-slate-200 h-12 rounded-xl"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      required
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com" 
                      className="pl-10 bg-slate-50 border-slate-200 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-700 font-bold">Password</Label>
                    {isLogin && <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="pl-10 pr-10 bg-slate-50 border-slate-200 h-12 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                </AnimatePresence>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 mt-2"
                >
                  {isSubmitting ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm font-medium text-slate-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-indigo-600 hover:text-indigo-700 font-bold"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
              
              {isLogin && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 text-center">
                  <strong>Demo Accounts:</strong><br/>
                  Admin: admin@sentinel.com / password<br/>
                  Analyst: analyst@sentinel.com / password
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
