import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  AlertTriangle, User, Calendar, ExternalLink, UserPlus, CheckCircle2, ArrowUpRight, FileText, Clock, Brain, Shield, Download, FileSignature, Share2, Sparkles, Network, Building, Wallet, Landmark, Activity, ScanFace, Globe, Loader2, XCircle, Lock, Hash, Eye, MessageSquare, Scale, Bot, ShieldAlert, RefreshCw, ArrowLeft
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInvestigations } from "@/context/InvestigationsContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import ForceGraph2D from 'react-force-graph-2d';

const defaultDebate = [
  { 
    agent: "Investigator Agent", role: "Prosecution", 
    colorStyles: "border-indigo-100 hover:border-indigo-300", 
    bgGlow: "bg-indigo-50",
    iconBg: "bg-indigo-50 text-indigo-600",
    roleColor: "text-indigo-600",
    dotColor: "bg-indigo-500",
    icon: ShieldAlert, 
    message: <>This article explicitly links 'John Doe' to a <span className="font-bold border-b border-dashed border-indigo-400 cursor-help" title="Identified via semantic search">fraud investigation</span> and mentions offshore transactions. This warrants a Critical risk score (90+) for immediate EDD. <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"><FileText className="h-3 w-3 mr-1" /> Q3 Financial Audit [View]</Badge></>,  
    timestamp: "14:23:41" 
  },
  { 
    agent: "Skeptic Agent", role: "Defense", 
    colorStyles: "border-amber-200 hover:border-amber-400", 
    bgGlow: "bg-amber-100",
    iconBg: "bg-amber-100 text-amber-700",
    roleColor: "text-amber-700",
    dotColor: "bg-amber-500",
    icon: Shield, 
    message: <>I disagree. The article states he is a 'person of interest' but there are no formal charges or indictments yet. We should not trigger a Critical alert on rumor or early investigation. <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-amber-50 border-amber-200 text-amber-700 shadow-sm"><Scale className="h-3 w-3 mr-1" /> Internal Policy: KYB-402</Badge></>,  
    timestamp: "14:23:45" 
  },
  { 
    agent: "Investigator Agent", role: "Prosecution", 
    colorStyles: "border-indigo-100 hover:border-indigo-300", 
    bgGlow: "bg-indigo-50",
    iconBg: "bg-indigo-50 text-indigo-600",
    roleColor: "text-indigo-600",
    dotColor: "bg-indigo-500",
    icon: ShieldAlert, 
    message: <>But the credibility score of the source (Financial Times) is 95, and the SFO is directly cited. The likelihood of this risk materializing is very high. <Badge variant="outline" className="ml-2 cursor-pointer hover:bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm"><Building className="h-3 w-3 mr-1" /> SFO Press Release 24A</Badge></>,  
    timestamp: "14:23:48" 
  },
];

const Investigation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { getCaseById, updateCaseStatus, assignUser } = useInvestigations();
  
  const caseData = id ? getCaseById(id) : null;
  const entity = caseData?.entity || location.state?.entity || {
    name: "John Doe",
    entity_type: "individual",
    jurisdiction: "UK",
    latest_signal: "Adverse Media Mention",
    risk_score: 95
  };
  const isCompany = entity.entity_type === "company";
  
  const [isSarOpen, setIsSarOpen] = useState(false);
  const [caseStatus, setCaseStatus] = useState<"pending" | "approving" | "approved" | "dismissed">(
    caseData?.status === "Approved" || caseData?.status === "Resolved" ? "approved" : 
    caseData?.status === "Dismissed" ? "dismissed" : "pending"
  );
  const [isExplainableOpen, setIsExplainableOpen] = useState(false);

  // Dynamic Debate State
  const [debateMessages, setDebateMessages] = useState(defaultDebate);
  const [isJudgeDeciding, setIsJudgeDeciding] = useState(false);
  const [hasJudgeDecided, setHasJudgeDecided] = useState(true);
  const [customOpinion, setCustomOpinion] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("human");
  const [availablePersonas, setAvailablePersonas] = useState<any[]>([]);
  const [judgeVerdict, setJudgeVerdict] = useState("While the source is highly credible, formal charges have not been filed. However, SFO involvement in a multi-jurisdictional fraud context is a material risk. I am setting the Risk Score to 95 (Critical) given the confirmed matching criteria and tagging it for immediate review.");

  const [thinkingStep, setThinkingStep] = useState(0);
  const thinkingSteps = [
    "Scanning SEC database...",
    "Extracting entity correlations...",
    "Analyzing semantic intent...",
    "Formulating argument..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isJudgeDeciding) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => (prev < thinkingSteps.length - 1 ? prev + 1 : prev));
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isJudgeDeciding]);

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_personas');
    if (saved) {
      try {
        setAvailablePersonas(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleCustomOpinion = () => {
    if (isJudgeDeciding) return;
    
    let newMsg = {
      agent: "Human Analyst", role: "Input",
      colorStyles: "border-slate-300 hover:border-slate-500",
      bgGlow: "bg-slate-100",
      iconBg: "bg-slate-800 text-white",
      roleColor: "text-slate-800",
      dotColor: "bg-slate-800",
      icon: User,
      message: customOpinion || "Please review the latest transaction records.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    if (selectedPersonaId !== "human") {
      const p = availablePersonas.find(x => x.id.toString() === selectedPersonaId);
      if (p) {
        newMsg = {
          agent: p.role, role: "Invoked Persona",
          colorStyles: "border-indigo-200 hover:border-indigo-400",
          bgGlow: "bg-indigo-50",
          iconBg: "bg-indigo-100 text-indigo-700",
          roleColor: "text-indigo-700",
          dotColor: "bg-indigo-500",
          icon: Bot,
          message: customOpinion || `Analyzing the evidence based on my system instructions: "${p.prompt.substring(0, 80)}..." I conclude that this warrants deeper review but aligns with my specialized parameters.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
    }
    
    setDebateMessages(prev => [...prev, newMsg]);
    setCustomOpinion("");
    setHasJudgeDecided(false);
    setIsJudgeDeciding(true);
    
    // Simulate API processing delay
    setTimeout(() => {
      setDebateMessages(prev => [...prev, {
        agent: "Appellate Agent", role: "Review",
        colorStyles: "border-blue-200 hover:border-blue-400",
        bgGlow: "bg-blue-100",
        iconBg: "bg-blue-100 text-blue-700",
        roleColor: "text-blue-700",
        dotColor: "bg-blue-500",
        icon: Brain,
        message: "Acknowledged human input. Integrating new context into the evidentiary graph. The human insight highlights a crucial nuance missing from the raw text processing.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }]);
      
      setTimeout(() => {
        setIsJudgeDeciding(false);
        setHasJudgeDecided(true);
        setJudgeVerdict("Re-evaluated based on new human analyst inputs. The added context warrants a revision. I am adjusting the Risk Score to 85 (High) instead of Critical, to allow for further manual documentation gathering without triggering automatic regulatory filing.");
      }, 2500);
    }, 1500);
  };
  
  const reevaluateRisk = () => {
    setDebateMessages([]);
    setHasJudgeDecided(false);
    setIsJudgeDeciding(true);
    toast({ title: "Re-evaluating Risk", description: "Agents are debating the new context..." });
    
    // Staggered dropping of default messages to simulate real-time processing
    defaultDebate.forEach((msg, idx) => {
      setTimeout(() => {
        setDebateMessages(prev => [...prev, msg]);
      }, (idx + 1) * 1200);
    });
    
    setTimeout(() => {
      setIsJudgeDeciding(false);
      setHasJudgeDecided(true);
      setJudgeVerdict("While the source is highly credible, formal charges have not been filed. However, SFO involvement in a multi-jurisdictional fraud context is a material risk. I am setting the Risk Score to 95 (Critical) given the confirmed matching criteria and tagging it for immediate review.");
    }, (defaultDebate.length + 1) * 1200);
  };

  return (
  <DashboardLayout>
    <div className="p-6 space-y-5">
      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground pl-0 -ml-2" onClick={() => navigate('/investigations')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Inbox
      </Button>

      {/* Case Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`${Number(entity.risk_score) >= 80 ? 'bg-destructive/10 text-destructive border-destructive/20' : Number(entity.risk_score) >= 60 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'} border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
                {Number(entity.risk_score) >= 80 ? 'CRITICAL' : Number(entity.risk_score) >= 60 ? 'HIGH RISK' : 'ELEVATED'}
              </Badge>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ALT-4891</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">{entity.latest_signal || "Adverse media hit — suspected fraud exposure"}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">{isCompany ? <Building className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />} {entity.name}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" /> {entity.jurisdiction}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> 2024-03-15 14:23 UTC</span>
              <span className="flex items-center gap-1.5"><ExternalLink className="h-4 w-4 text-primary" /> Sentinel AI Source</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Dialog open={isExplainableOpen} onOpenChange={setIsExplainableOpen}>
              <div 
                className="text-center px-4 bg-muted/30 rounded-xl py-2 border border-border/50 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
                onClick={() => setIsExplainableOpen(true)}
              >
                <div className={`text-3xl font-black font-mono tracking-tighter ${Number(entity.risk_score) >= 80 ? 'text-destructive' : 'text-warning'} group-hover:scale-105 transition-transform`}>{entity.risk_score}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5 group-hover:text-indigo-600 transition-colors">Risk Score</div>
              </div>
              
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-500" />
                    Explainable AI Math
                  </DialogTitle>
                  <DialogDescription>
                    Transparent breakdown of the 95/100 Risk Score.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-destructive/20 bg-destructive/5">
                    <span className="text-sm text-foreground font-bold">+40 pts</span>
                    <span className="text-sm text-muted-foreground font-medium text-right">IP address does not match home address</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-warning/20 bg-warning/5">
                    <span className="text-sm text-foreground font-bold">+30 pts</span>
                    <span className="text-sm text-muted-foreground font-medium text-right">Velocity of transactions spiked 300% in 24 hrs</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <span className="text-sm text-foreground font-bold">+25 pts</span>
                    <span className="text-sm text-muted-foreground font-medium text-right">2 hops from sanctioned entity on Graph</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex justify-between items-center px-3">
                    <span className="font-bold text-foreground">Total Risk Score</span>
                    <span className={`text-xl font-black font-mono ${Number(entity.risk_score) >= 80 ? 'text-destructive' : 'text-warning'}`}>{entity.risk_score}/100</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setCaseStatus("approving");
                    setTimeout(() => {
                      setCaseStatus("approved");
                      if (id) updateCaseStatus(id, "Approved");
                      toast({ title: "Case Approved", description: "This case has been marked as approved." });
                    }, 1200);
                  }}
                  disabled={caseStatus !== "pending"}
                  className={`h-9 gap-2 text-xs font-bold rounded-xl shadow-md transition-all duration-300 w-full ${
                    caseStatus === "approved" ? "bg-success hover:bg-success text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {caseStatus === "pending" && (
                      <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Approve Case
                      </motion.div>
                    )}
                    {caseStatus === "approving" && (
                      <motion.div key="approving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </motion.div>
                    )}
                    {caseStatus === "approved" && (
                      <motion.div key="approved" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Approved
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                {caseStatus === "pending" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setCaseStatus("dismissed");
                      if (id) updateCaseStatus(id, "Dismissed");
                      toast({ title: "Case Dismissed", description: "This case has been dismissed.", variant: "destructive" });
                    }}
                    className="h-9 px-2 border-destructive/20 text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <Select onValueChange={(val) => {
                    if (id) assignUser(id, val);
                    toast({ title: "Assigned", description: `Case assigned to ${val}` });
                  }}>
                    <SelectTrigger className="h-9 rounded-xl text-xs font-bold bg-white hover:bg-muted">
                      <SelectValue placeholder={<div className="flex items-center gap-2"><UserPlus className="h-4 w-4" /> Assign</div>} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin (You)</SelectItem>
                      <SelectItem value="Sarah K.">Sarah K.</SelectItem>
                      <SelectItem value="Michael R.">Michael R.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsSarOpen(true)} className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 border-indigo-200 text-indigo-700 w-1/2 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileSignature className="h-4 w-4" /> Auto-SAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 w-full justify-start overflow-x-auto h-auto gap-4">
          <TabsTrigger value="summary" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Summary</TabsTrigger>
          <TabsTrigger value="network" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Network Graph</TabsTrigger>
          <TabsTrigger value="evidence" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Source Evidence</TabsTrigger>
          <TabsTrigger value="entity" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Entity Profile</TabsTrigger>
          <TabsTrigger value="timeline" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Timeline</TabsTrigger>
          <TabsTrigger value="reasoning" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">AI Reasoning</TabsTrigger>
          <TabsTrigger value="debate" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Agent Debate</TabsTrigger>
          <TabsTrigger value="audit" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <div className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-5 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-500" /> AI-Generated Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sentinel AI analysis of recent signals for <span className="font-bold text-foreground">{entity.name}</span> indicates a {entity.latest_signal?.toLowerCase() || 'potential risk exposure'}. 
                {isCompany ? " The corporate entity's recent activities have matched against key regulatory flags, triggering a heightened risk profile." : " The individual has been identified across multiple data points suggesting involvement in monitored activities."}
              </p>
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matched Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {["Full name match", "DOB confirmed", "UK jurisdiction", "Known associate"].map(f => (
                    <Badge key={f} variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-5 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Suggested Actions</h3>
              <div className="space-y-3">
                {[
                  { action: "Escalate to Senior Analyst", priority: "Recommended", color: "bg-warning/10 text-warning border border-warning/20" },
                  { action: "Request enhanced due diligence", priority: "Required", color: "bg-destructive/10 text-destructive border border-destructive/20" },
                  { action: "File SAR consideration", priority: "Under Review", color: "bg-primary/10 text-primary border border-primary/20" },
                  { action: "Notify relationship manager", priority: "Optional", color: "bg-muted text-muted-foreground border border-border/50" },
                ].map(a => (
                  <div key={a.action} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm hover:border-indigo-500/20 transition-colors">
                    <span className="text-sm font-semibold">{a.action}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${a.color}`}>{a.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 mt-6 relative overflow-hidden h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Network className="h-5 w-5 text-indigo-500" /> Dynamic Knowledge Graph</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white shadow-sm font-mono text-[10px]">Depth: 3 Hops</Badge>
                <Badge variant="outline" className="bg-white shadow-sm font-mono text-[10px] text-destructive border-destructive/20">7 High-Risk Nodes</Badge>
              </div>
            </div>

            {/* Mock Graph Visual */}
            <div className="relative w-full h-[400px] flex items-center justify-center z-10">
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 400 200 L 250 100" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                <path d="M 400 200 L 250 300" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 400 200 L 550 100" stroke="#ef4444" strokeWidth="3" fill="none" />
                <path d="M 400 200 L 550 300" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 250 300 L 150 250" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 550 100 L 700 150" stroke="#ef4444" strokeWidth="3" fill="none" />
              </svg>

              {/* Central Node */}
              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '200px', left: '400px' }}>
                <div className="h-20 w-20 rounded-full bg-indigo-100 border-4 border-indigo-500 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {isCompany ? <Building className="h-8 w-8 text-indigo-700" /> : <User className="h-8 w-8 text-indigo-700" />}
                </div>
                <div className="mt-3 bg-white px-3 py-1.5 rounded-lg shadow-md border border-border/50 text-center w-max">
                  <div className="text-xs font-bold text-foreground">{entity.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">Primary Subject</div>
                </div>
              </motion.div>

              {/* Connected Nodes */}
              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.1 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '100px', left: '250px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center w-max">
                  <div className="text-[10px] font-bold">Doe Consulting Ltd</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.2 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '300px', left: '250px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center w-max">
                  <div className="text-[10px] font-bold">Acct: *4912</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.3 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '100px', left: '550px' }}>
                <div className="h-16 w-16 rounded-full bg-destructive/10 border-4 border-destructive shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                  <Globe className="h-7 w-7 text-destructive" />
                </div>
                <div className="mt-2 bg-white px-2 py-1 rounded shadow-sm border border-destructive/30 text-center w-max">
                  <div className="text-[10px] font-bold text-destructive">BVI Holdings Ltd</div>
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Shell Company</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.4 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '300px', left: '550px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center w-max">
                  <div className="text-[10px] font-bold">Jane Smith</div>
                </div>
              </motion.div>
              
              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.5 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '150px', left: '700px' }}>
                <div className="h-14 w-14 rounded-full bg-destructive/10 border-2 border-destructive/50 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark className="h-6 w-6 text-destructive/80" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center w-max">
                  <div className="text-[10px] font-bold text-destructive">Swiss Bank Acct</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0, x: "-50%", y: "-50%" }} animate={{ scale: 1, x: "-50%", y: "-50%" }} transition={{ delay: 0.6 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '250px', left: '150px' }}>
                <div className="h-14 w-14 rounded-full bg-warning/10 border-2 border-warning/50 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Hash className="h-6 w-6 text-warning/80" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center w-max">
                  <div className="text-[10px] font-bold text-warning-foreground">Crypto Wallet</div>
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">BTC Network</div>
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="flex items-center justify-between mt-6 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Evidentiary Artifacts</h2>
            <Button size="sm" onClick={() => window.print()} className="h-9 gap-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Download className="h-4 w-4" /> Export Evidence (PDF)
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-32 w-32 text-indigo-900" />
              </div>
              <h3 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2 relative z-10"><FileText className="h-5 w-5 text-indigo-500" /> Source Evidence</h3>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 relative z-10">Sentinel Intelligence Network</div>
              <div className="prose prose-sm text-sm text-muted-foreground max-w-none space-y-4 relative z-10">
                <p>Recent sweeps have identified <mark className="bg-warning/20 text-warning-foreground font-semibold px-1 rounded">{entity.name}</mark> ({entity.jurisdiction}) in connection with {entity.latest_signal || "elevated risk activities"}.</p>
                <p>Analysts are monitoring transaction patterns and relevant network associations to determine full exposure.</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 hover:border-indigo-500/30 transition-colors">
              <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-500" /> Sanctions Match</h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Source: OFAC SDN List</div>
                  <div className="font-semibold text-foreground/80">No direct match found</div>
                </div>
                <div className="p-4 rounded-xl bg-warning/5 border border-warning/30 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground/70 mb-1.5">Source: EU Consolidated List</div>
                  <div className="font-bold text-foreground">Fuzzy match — 72% similarity</div>
                  <div className="text-xs text-muted-foreground mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">Entity: "Johan Doe" — ref. EU-2024-1847</div>
                </div>
              </div>
            </div>


          </div>
        </TabsContent>

        <TabsContent value="entity">
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            <div className="md:col-span-2 rounded-2xl border border-border/50 bg-white shadow-sm p-6">
              <h3 className="text-base font-bold tracking-tight mb-6">Master Entity Profile</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  [isCompany ? "Company Name" : "Full Name", entity.name],
                  ["Aliases", isCompany ? "None registered" : "J. Doe, Johan Doe, JMD"],
                  [isCompany ? "Incorporation Date" : "Date of Birth", isCompany ? "12 August 2010" : "22 March 1985"],
                  ["Jurisdiction", entity.jurisdiction],
                  ["Identifiers", isCompany ? "Reg No: 18492048" : "Passport: GB-8842991"],
                  ["Linked Jurisdictions", `${entity.jurisdiction}, BVI, UAE, Switzerland`],
                ].map(([label, value]) => (
                  <div key={label} className="group">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
                    <div className="text-sm font-semibold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50 group-hover:border-indigo-500/30 transition-colors">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm p-6">
              <h3 className="text-base font-bold tracking-tight mb-6">Risk Indicators</h3>
              <div className="space-y-4">
                {[
                  { label: "Sanctions Lists", count: 0, color: "text-success bg-success/10 border-success/20" },
                  { label: "PEP Associations", count: 1, color: "text-warning bg-warning/10 border-warning/20" },
                  { label: "Adverse Media", count: 3, color: "text-destructive bg-destructive/10 border-destructive/20" },
                  { label: "Watchlist Memberships", count: 2, color: "text-warning bg-warning/10 border-warning/20" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm">
                    <span className="text-sm font-semibold">{r.label}</span>
                    <span className={`font-mono font-black px-2.5 py-1 rounded-md border ${r.color}`}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Risk Velocity Chart */}
          <div className="mt-5 rounded-2xl border border-border/50 bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" /> Perpetual KYB: Risk Velocity
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Real-time risk score decay and escalation over 30 days</p>
              </div>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">+42% Velocity Spike</Badge>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: "Day 1", score: 25 }, { day: "Day 5", score: 24 }, { day: "Day 10", score: 22 },
                  { day: "Day 15", score: 28 }, { day: "Day 20", score: 45 }, { day: "Day 25", score: 55 },
                  { day: "Day 28", score: 89 }, { day: "Day 29", score: 92 }, { day: "Day 30", score: 94 }
                ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#4F46E5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 mt-6">
            <h3 className="text-base font-bold tracking-tight mb-8">Entity Event Timeline</h3>
            <div className="space-y-6">
              {[
                { date: "15 Mar 2024, 14:23", event: "Adverse media hit detected — Financial Times fraud article", severity: "critical" },
                { date: "12 Mar 2024, 09:15", event: "EU sanctions list update — fuzzy match identified", severity: "high" },
                { date: "28 Feb 2024, 11:42", event: "PEP association discovered — linked political figure", severity: "high" },
                { date: "15 Feb 2024, 16:30", event: "Routine screening completed — no new signals", severity: "low" },
                { date: "01 Feb 2024, 08:00", event: "Entity onboarded for continuous monitoring", severity: "info" },
              ].map((e, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center">
                    <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm z-10 ${
                      e.severity === "critical" ? "bg-destructive ring-2 ring-destructive/30" : e.severity === "high" ? "bg-warning ring-2 ring-warning/30" :
                      e.severity === "low" ? "bg-success ring-2 ring-success/30" : "bg-muted-foreground ring-2 ring-muted-foreground/30"
                    }`} />
                    {i < 4 && <div className="w-0.5 flex-1 bg-border/80 group-hover:bg-indigo-500/30 transition-colors mt-2 mb-1" />}
                  </div>
                  <div className="pb-6 pt-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{e.date}</div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{e.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reasoning">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-8 mt-6 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Brain className="h-48 w-48 text-indigo-900" />
            </div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 relative z-10"><Brain className="h-5 w-5 text-indigo-500" /> AI Reasoning Chain</h3>
            <div className="space-y-6 relative z-10">
              {[
                { step: "Sources Checked", detail: "OFAC SDN, EU Consolidated, UN Sanctions, UK HMT, 2,847 media sources" },
                { step: "Entities Extracted", detail: "3 named entities from FT article matched against portfolio: John Doe (94%), BVI Holdings (67%), J. Doe Associates (45%)" },
                { step: "Matching Confidence", detail: "Primary entity: 94% confidence based on full name, DOB, and jurisdiction alignment" },
                { step: "Risk Signals Detected", detail: "Fraud investigation, SFO involvement, offshore transaction patterns, shell company structures" },
                { step: "Severity Rationale", detail: "Classified as CRITICAL due to: active law enforcement investigation, high confidence match, and potential SAR obligation" },
              ].map((s, i) => (
                <div key={i} className="flex gap-5 items-start group p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 font-black shadow-sm shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">{i + 1}</div>
                  <div className="pt-1.5">
                    <div className="text-sm font-bold tracking-tight text-foreground group-hover:text-indigo-600 transition-colors mb-1">{s.step}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="debate">
          <div className="rounded-2xl border border-border/50 bg-slate-50 shadow-inner p-8 mt-6 relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                  <MessageSquare className="h-6 w-6 text-indigo-600" /> Multi-Agent Adversarial Debate
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Real-time dialectical reasoning engine</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={reevaluateRisk} disabled={isJudgeDeciding} className="text-xs shadow-sm bg-white hover:bg-slate-50">
                  <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isJudgeDeciding ? 'animate-spin' : ''}`} />
                  Re-evaluate Risk
                </Button>
                <Badge variant="outline" className={`bg-white shadow-sm border-indigo-200 text-indigo-700 gap-2 px-3 py-1.5 ${isJudgeDeciding ? 'animate-pulse bg-indigo-50' : ''}`}>
                  <div className={`h-2 w-2 rounded-full ${isJudgeDeciding ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                  {hasJudgeDecided ? 'Debate Concluded' : 'Processing...'}
                </Badge>
              </div>
            </div>
            
            <div className="relative pl-8 space-y-8 z-10">
              {/* Connecting vertical line */}
              <div className="absolute left-[1.15rem] top-4 bottom-10 w-0.5 bg-gradient-to-b from-indigo-300 via-slate-300 to-emerald-300 rounded-full" />

              {debateMessages.map((msg, i) => (
                <motion.div 
                  key={msg.timestamp + i} 
                  initial={{ opacity: 0, x: msg.role === 'Defense' ? 20 : -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className={`relative ${msg.role === 'Defense' ? 'ml-12' : ''}`}
                >
                  {/* Node dot on the line */}
                  <div className={`absolute ${msg.role === 'Defense' ? '-left-[5.15rem]' : '-left-[2.15rem]'} top-5 h-4 w-4 rounded-full border-4 border-slate-50 shadow-sm z-10 ${msg.dotColor}`} />
                  
                  {/* Connector line for Defense */}
                  {msg.role === 'Defense' && (
                    <div className={`absolute -left-[4.15rem] top-7 h-0.5 w-16 bg-gradient-to-r from-amber-300 to-amber-100 z-0`} />
                  )}
                  
                  <div className={`bg-white rounded-2xl p-5 shadow-lg border ${msg.colorStyles} transition-colors relative overflow-hidden group`}>
                    {/* Subtle corner glow */}
                    <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${msg.bgGlow} opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out`} />
                    
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg ${msg.iconBg} flex items-center justify-center`}>
                          <msg.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{msg.agent}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.roleColor}`}>{msg.role}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{msg.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-slate-700 leading-relaxed relative z-10">
                      {msg.message}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isJudgeDeciding && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative pt-4 pb-2 pl-4">
                  <div className="absolute -left-[2.35rem] top-6 h-6 w-6 rounded-full border-4 border-slate-50 bg-indigo-100 shadow-sm z-10 flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-indigo-500 animate-spin" />
                  </div>
                  <div className="flex items-center gap-3 text-indigo-500 text-sm font-semibold bg-indigo-50/50 inline-flex px-4 py-2 rounded-full border border-indigo-100">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={thinkingStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {thinkingSteps[thinkingStep]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {hasJudgeDecided && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="relative pt-6"
                >
                  {/* Node dot for Judge */}
                  <div className="absolute -left-[2.35rem] top-12 h-6 w-6 rounded-full border-4 border-slate-50 bg-emerald-500 shadow-md z-10 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-5 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/30 shadow-inner">
                          <Scale className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <span className="text-lg font-black tracking-tight block drop-shadow-sm">Compliance Agent</span>
                          <Badge className="bg-emerald-900/40 text-emerald-100 border-emerald-400/30 text-[10px] uppercase tracking-widest mt-1">Judge • Final Verdict</Badge>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-100/70">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 relative z-10 shadow-inner">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Consensus Reached
                      </h4>
                      <p className="text-sm leading-relaxed text-emerald-50" dangerouslySetInnerHTML={{ __html: judgeVerdict.replace('95 (Critical)', '<mark class="bg-destructive text-white font-bold px-1.5 py-0.5 rounded shadow-sm inline-block mx-1">95 (Critical)</mark>').replace('85 (High)', '<mark class="bg-warning text-warning-foreground font-bold px-1.5 py-0.5 rounded shadow-sm inline-block mx-1">85 (High)</mark>') }} />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {hasJudgeDecided && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8 border-t border-slate-200 mt-8 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-3">
                    <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                      <SelectTrigger className="w-full md:w-[250px] bg-white">
                        <SelectValue placeholder="Select Persona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="human">
                          <div className="flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4" /> Human Analyst
                          </div>
                        </SelectItem>
                        {availablePersonas.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Bot className={`h-4 w-4 ${p.color}`} /> {p.role}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="flex-1 relative w-full">
                      <Input 
                        placeholder={selectedPersonaId === "human" ? "Inject human opinion..." : "Optional: Add specific instruction for this agent..."}
                        className="w-full bg-white border-slate-200 pr-24 shadow-sm"
                        value={customOpinion}
                        onChange={(e) => setCustomOpinion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomOpinion()}
                      />
                      <Button size="sm" onClick={handleCustomOpinion} className="absolute right-1 top-1 h-7 text-[10px] font-bold uppercase tracking-wider">
                        Invoke
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="rounded-2xl border border-border/50 bg-slate-900 shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2 text-white">
                <Lock className="h-4 w-4 text-emerald-400" /> Immutable Ledger
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">VERIFIED SECURE</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6 text-slate-400">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6 text-slate-400">Actor / Component</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6 text-slate-400">Action</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6 text-slate-400 text-right">Cryptographic Hash</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ts: "2024-03-15 14:30:12", actor: "Jane Smith (Compliance)", icon: <Eye className="h-3.5 w-3.5 text-blue-400" />, action: "Viewed case profile", hash: "0x8f4a2b91c7...", isUser: true },
                  { ts: "2024-03-15 14:28:05", actor: "System Alert Engine", icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />, action: "Alert ALT-4891 escalated to CRITICAL", hash: "0x1a9c3d82e4...", isUser: false },
                  { ts: "2024-03-15 14:24:02", actor: "Case Generator", icon: <FileSignature className="h-3.5 w-3.5 text-indigo-400" />, action: "Case summary auto-generated", hash: "0x3b8d1f76a9...", isUser: false },
                  { ts: "2024-03-15 14:23:49", actor: "Risk Scorer", icon: <Hash className="h-3.5 w-3.5 text-purple-400" />, action: "Risk score calculated: 87 → 94", hash: "0x9c2e4a15b8...", isUser: false },
                  { ts: "2024-03-15 14:23:47", actor: "Matching Engine", icon: <Brain className="h-3.5 w-3.5 text-emerald-400" />, action: "Entity resolved against portfolio", hash: "0x7d5f2c94e1...", isUser: false },
                  { ts: "2024-03-15 14:23:41", actor: "Media Crawler", icon: <Globe className="h-3.5 w-3.5 text-slate-400" />, action: "Article ingested from FT RSS feed", hash: "0x2a1b9c8d7e...", isUser: false },
                ].map((r, i) => (
                  <TableRow key={i} className="border-slate-800 transition-colors hover:bg-slate-800/50">
                    <TableCell className="font-mono text-xs font-medium text-slate-400 px-6 py-4">{r.ts}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {r.icon}
                        <span className={`text-sm font-semibold ${r.isUser ? "text-blue-300" : "text-slate-300"}`}>{r.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-300 px-6 py-4">{r.action}</TableCell>
                    <TableCell className="text-right px-6 py-4">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">{r.hash}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Auto-SAR Generator Modal */}
      <Dialog open={isSarOpen} onOpenChange={setIsSarOpen}>
        <DialogContent className="max-w-[800px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-[#f8fafc] border-indigo-100 rounded-2xl">
          <div className="bg-white border-b px-8 py-5 shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-r from-transparent to-indigo-50/50" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-indigo-500" /> Auto-Generated SAR
                </DialogTitle>
                <DialogDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  FINCEN FORMATTED NARRATIVE • CONFIDENCE: 94%
                </DialogDescription>
              </div>
              <Button size="sm" onClick={() => { setIsSarOpen(false); toast({ title: "SAR Filed", description: "The Suspicious Activity Report has been submitted successfully." }); }} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm">
                <FileSignature className="h-4 w-4" /> File Report
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none text-muted-foreground leading-relaxed custom-scrollbar">
            <p><strong>SUBJECT:</strong> Suspicious activity involving structured offshore transfers and potential evasion of sanctions, associated with JOHN DOE.</p>
            <p><strong>DATE OF PREPARATION:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>REPORTING INSTITUTION:</strong> Sentinel Bank N.A.</p>
            <hr className="my-6 border-border/50" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mt-0">1. Introduction</h4>
            <p>This Suspicious Activity Report (SAR) is being filed by Sentinel Bank N.A. to report suspected illicit financial activity involving <strong>JOHN MICHAEL DOE</strong> (DOB: 22-Mar-1985), a British national holding accounts at our institution. The activity came to our attention on 15 March 2024 following an alert generated by our automated screening system identifying adverse media.</p>
            
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">2. Account Information</h4>
            <p>JOHN DOE has maintained a primary checking account (Acct #: 8842-XXXX-9912) and a wealth management portfolio with Sentinel Bank since February 2024. The account was established with typical retail banking expected behavior, listing "Management Consultant" as the occupation.</p>

            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">3. Description of Suspicious Activity</h4>
            <p>On 15 March 2024, adverse media published by the Financial Times indicated that JOHN DOE is a subject of interest in an ongoing investigation by the UK Serious Fraud Office (SFO). The investigation allegedly involves the use of shell companies in the British Virgin Islands (BVI).</p>
            <p>A subsequent review of account activity revealed the following concerning patterns:</p>
            <ul>
              <li>Between 01-Mar-2024 and 10-Mar-2024, four incoming wire transfers totaling £4.2 million were received from "BVI Holdings Ltd," an entity previously unknown to the account profile.</li>
              <li>The funds were rapidly moved (velocity: less than 48 hours) to multiple destination accounts in Switzerland and the UAE, maintaining balances below standard regulatory reporting thresholds.</li>
              <li>Entity resolution analysis shows a 72% fuzzy match to a sanctioned individual ("Johan Doe", Ref: EU-2024-1847) on the EU Consolidated List. While not definitively confirmed, the proximity of the adverse media and the transaction behavior elevates the risk profile significantly.</li>
            </ul>

            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">4. Conclusion & Actions Taken</h4>
            <p>Due to the combination of high-profile adverse media (fraud investigation), complex offshore transactional patterns, and a potential fuzzy sanctions match, Sentinel Bank has flagged these transactions as highly suspicious. We are filing this SAR in accordance with regulatory requirements.</p>
            <p>The subject's accounts have been temporarily restricted pending further internal review, and a request for Enhanced Due Diligence (EDD) has been issued.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </DashboardLayout>
  );
};

export default Investigation;
