import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Clock, Globe, Shield, TrendingDown, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";

const stats = [
  { value: "50M+", label: "Monitored Signals", icon: Activity },
  { value: "10,000+", label: "Sources Crawled Daily", icon: Globe },
  { value: "<15 min", label: "Detection Target", icon: Clock },
  { value: "70%", label: "Reduction in Manual Review", icon: TrendingDown },
];

const flowNodes = [
  { label: "Sanctions Feeds", x: 5, y: 20 },
  { label: "Global News", x: 5, y: 45 },
  { label: "Watchlists", x: 5, y: 70 },
  { label: "AI Extraction", x: 30, y: 32 },
  { label: "Entity Matching", x: 50, y: 32 },
  { label: "Risk Scoring", x: 50, y: 60 },
  { label: "Alert Engine", x: 72, y: 45 },
  { label: "Analyst Review", x: 90, y: 45 },
];

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithPassword, signUpWithPassword, signInWithGoogle, user, loading } = useAuth();
  const [signInEmail, setSignInEmail] = useState("testuser@example.com");
  const [signInPassword, setSignInPassword] = useState("Sentinel_Test_Password_2026!@#");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const target = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(target, { replace: true });
    } else if (!loading) {
      // Auto-login with hardcoded credentials
      const autoSignIn = async () => {
        setSubmitting(true);
        await signInWithPassword("testuser@example.com", "Sentinel_Test_Password_2026!@#");
        setSubmitting(false);
      };
      autoSignIn();
    }
  }, [location.state, navigate, user, loading, signInWithPassword]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await signInWithPassword(signInEmail, signInPassword);
    setSubmitting(false);

    if (result.error) {
      toast({ title: "Sign-in failed", description: result.error, variant: "destructive" });
      return;
    }

    navigate("/dashboard");
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const result = await signUpWithPassword(signUpEmail, signUpPassword, signUpName);
    setSubmitting(false);

    if (result.error) {
      toast({ title: "Sign-up failed", description: result.error, variant: "destructive" });
      return;
    }

    toast({
      title: "Workspace created",
      description: "Your secure monitoring workspace is ready. Sign in to continue if email confirmation is required.",
    });
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    const result = await signInWithGoogle();
    setSubmitting(false);

    if (result.error) {
      toast({ title: "Google sign-in failed", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-navy text-navy-foreground overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Sentinel</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-navy-foreground/70 hover:text-navy-foreground hover:bg-white/5" onClick={() => toast({ title: "Coming Soon", description: "The About page is under construction." })}>
            About
          </Button>
          <Button variant="ghost" className="text-navy-foreground/70 hover:text-navy-foreground hover:bg-white/5" onClick={() => toast({ title: "Coming Soon", description: "The Contact page is under construction." })}>
            Contact
          </Button>
          <Button size="sm" onClick={() => navigate(user ? "/dashboard" : "/")}>
            {user ? "Open Workspace" : "Secure Sign In"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative px-8 pt-16 pb-24 max-w-7xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid gap-10 xl:grid-cols-[1.1fr_0.9fr] items-start relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm mb-8">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-navy-foreground/70">Operational compliance intelligence for bank teams</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              Continuous KYB Monitoring, <span className="text-primary">Powered by AI Agents</span>
            </h2>
            <p className="text-lg md:text-xl text-navy-foreground/60 max-w-2xl mb-10 leading-relaxed">
              Sign in to a live workspace backed by Lovable Cloud for monitored entities, adverse media ingestion,
              alerts, investigations, analyst notes, and autonomous agent runs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="w-full max-w-md justify-self-end"
          >
            <Card className="border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-xl text-navy-foreground">Access your secure workspace</CardTitle>
                <CardDescription className="text-navy-foreground/60">
                  Email/password and Google sign-in are ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sign-in" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5">
                    <TabsTrigger value="sign-in">Sign in</TabsTrigger>
                    <TabsTrigger value="sign-up">Create account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sign-in" className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-3">
                      <Input value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} type="email" placeholder="Work email" required className="bg-white/5 border-white/10 text-navy-foreground placeholder:text-navy-foreground/40" />
                      <Input value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} type="password" placeholder="Password" required className="bg-white/5 border-white/10 text-navy-foreground placeholder:text-navy-foreground/40" />
                      <Button type="submit" className="w-full" disabled={submitting || loading}>
                        Open workspace
                      </Button>
                    </form>
                    <Button type="button" variant="outline" className="w-full border-white/10 bg-transparent text-navy-foreground hover:bg-white/5" onClick={handleGoogleSignIn} disabled={submitting || loading}>
                      Continue with Google
                    </Button>
                  </TabsContent>

                  <TabsContent value="sign-up" className="space-y-4">
                    <form onSubmit={handleSignUp} className="space-y-3">
                      <Input value={signUpName} onChange={(e) => setSignUpName(e.target.value)} placeholder="Full name" required className="bg-white/5 border-white/10 text-navy-foreground placeholder:text-navy-foreground/40" />
                      <Input value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} type="email" placeholder="Work email" required className="bg-white/5 border-white/10 text-navy-foreground placeholder:text-navy-foreground/40" />
                      <Input value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} type="password" placeholder="Create password" required className="bg-white/5 border-white/10 text-navy-foreground placeholder:text-navy-foreground/40" />
                      <Button type="submit" className="w-full" disabled={submitting || loading}>
                        Create secure workspace
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-20 relative"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 md:p-12">
            <div className="relative h-[280px] w-full">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Connection lines */}
                {[
                  [10, 22, 28, 34], [10, 47, 28, 34], [10, 72, 28, 38],
                  [38, 34, 48, 34], [38, 34, 48, 62],
                  [58, 34, 70, 47], [58, 62, 70, 47],
                  [80, 47, 88, 47],
                ].map(([x1, y1, x2, y2], i) => (
                  <motion.line
                    key={i}
                    x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                    stroke="hsl(221 83% 53% / 0.3)"
                    strokeWidth="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1 }}
                  />
                ))}
              </svg>
              {flowNodes.map((node, i) => (
                <motion.div
                  key={node.label}
                  className="absolute"
                  style={{ left: `${node.x}%`, top: `${node.y}%`, transform: "translate(-50%, -50%)" }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`h-3 w-3 rounded-full ${i >= 3 && i <= 6 ? "bg-primary" : i === 7 ? "bg-success" : "bg-accent"} shadow-lg`}>
                      <div className={`h-3 w-3 rounded-full ${i >= 3 && i <= 6 ? "bg-primary" : i === 7 ? "bg-success" : "bg-accent"} animate-pulse-glow`} />
                    </div>
                    <span className="text-[10px] md:text-xs text-navy-foreground/50 whitespace-nowrap font-medium">{node.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center"
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold font-mono tracking-tight mb-1">{stat.value}</div>
              <div className="text-xs text-navy-foreground/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
