import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

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
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Always redirect — Index is no longer the auth page
      navigate(user ? "/dashboard" : "/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

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
            <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              The Next-Gen <br/><span className="text-primary">Agentic Risk Platform</span>
            </h2>
            <p className="text-lg md:text-xl text-navy-foreground/60 max-w-2xl mb-12 leading-relaxed">
              Automate KYB, Continuous monitoring, and adverse media screening with state-of-the-art AI agents.
            </p>
            
            <div className="flex flex-col gap-8 mt-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">Autonomous Agents</h3>
                  <p className="text-navy-foreground/60 text-lg">Intelligent web crawling and reasoning.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">Real-time Monitoring</h3>
                  <p className="text-navy-foreground/60 text-lg">24/7 continuous screening pipeline.</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-navy-foreground/40 mt-16">
              © 2026 Sentinel Inc. All rights reserved.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="w-full max-w-md justify-self-end mt-10 xl:mt-0"
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
      </div>
    </div>
  );
};

export default Index;
