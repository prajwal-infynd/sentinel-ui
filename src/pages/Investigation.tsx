import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { forceCollide } from "d3-force";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  AlertTriangle, User, Calendar, ExternalLink, UserPlus, CheckCircle2, ArrowUpRight, FileText, Clock, Brain, Shield, Download, FileSignature, Share2, Sparkles, Network, Building, Wallet, Landmark, Activity, ScanFace, Globe, Loader2, XCircle, Lock, Hash, Eye, MessageSquare, Scale, Bot, ShieldAlert, RefreshCw, ArrowLeft, UserMinus, ShieldQuestion, Flag, Building2, ArrowRight, Search, Plus, Minus, ZoomIn, ZoomOut, Maximize2, Minimize2, Expand
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useInvestigations } from "@/context/InvestigationsContext";
import { getInvestigationStatus, getInvestigationData } from "@/lib/dashboard-data";
import klodevData from "@/data/klodev.json";
import mockAgentData from "@/data/mock_agent_res.json";
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

  // Croftz investigation state
  const isCroftzAlert = location.state?.isCroftzAlert === true;
  const croftzInvestigationId = location.state?.investigationId as string | undefined;
  const [liveInvData, setLiveInvData] = useState<any>(null);
  const [invStatus, setInvStatus] = useState<"pending" | "completed" | "error">("pending");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(isCroftzAlert);

  useEffect(() => {
    if (!isCroftzAlert || !croftzInvestigationId) return;
    let stopped = false;

    const poll = async () => {
      while (!stopped) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          const { status } = await getInvestigationStatus(croftzInvestigationId);
          if (stopped) break;
          if (status === "completed") {
            const invData = await getInvestigationData(croftzInvestigationId);
            setLiveInvData(invData.data);
            setInvStatus("completed");
            setShowLoadingOverlay(false);
            break;
          }
          if (status === "error") {
            setInvStatus("error");
            setShowLoadingOverlay(false);
            break;
          }
        } catch {}
      }
    };

    poll();
    return () => { stopped = true; };
  }, [isCroftzAlert, croftzInvestigationId]);

  const caseData = id ? getCaseById(id) : null;
  const isKlodev = id === "ALT-KLODEV";
  const isMockAgent = id === "mock-agent";
  const activeData: any = liveInvData || (isMockAgent ? mockAgentData.result.reply : (isKlodev ? klodevData : null));
  const entity = caseData?.entity || location.state?.entity || {
    name: "Global Tech Inc.",
    entity_type: "company",
    jurisdiction: "UK",
    latest_signal: "Adverse Media Mention",
    risk_score: 95
  };
  const isCompany = entity.entity_type === "company";
  
  // MOCK DATA for Corporate Officers
  const corporateOfficers = [
    { id: "o1", name: "Alaric Vanguard", role: "Chief Executive Officer", status: "Active", appointed: "2018-04-12", resigned: null, isPEP: false },
    { id: "o2", name: "Elena Rostova", role: "Chief Financial Officer", status: "Active", appointed: "2020-11-05", resigned: null, isPEP: true }, // PEP Flagged
    { id: "o3", name: "Marcus Thorne", role: "Director", status: "Resigned", appointed: "2015-02-14", resigned: "2022-08-30", isPEP: false },
    { id: "o4", name: "Sylvia Vance", role: "Head of Compliance", status: "Active", appointed: "2021-01-20", resigned: null, isPEP: false },
  ];

  // MOCK DATA for Timeline History / Elevation Graph
  const timelineHistory = [
    { date: "2010-08-12", event: "Company Incorporated (Jurisdiction: UK)", type: "neutral", y: 10 },
    { date: "2015-02-14", event: "Marcus Thorne Appointed as Director", type: "neutral", y: 20 },
    { date: "2018-04-12", event: "Alaric Vanguard Appointed as CEO", type: "neutral", y: 30 },
    { date: "2020-11-05", event: "Elena Rostova Appointed as CFO (PEP Identified)", type: "warning", y: 50 },
    { date: "2021-03-10", event: "Elena Rostova flagged as High-Risk PEP (Tier 1)", type: "critical", y: 75 },
    { date: "2022-08-30", event: "Marcus Thorne Resigned as Director", type: "warning", y: 65 },
    { date: "2023-11-05", event: "OFAC Watchlist Match (Fuzzy)", type: "critical", y: 90 },
    { date: "2024-03-15", event: "Adverse Media Hit (Fraud Allegation)", type: "critical", y: 95 }
  ];
  
  const [isSarOpen, setIsSarOpen] = useState(false);
  const [graphContainer, setGraphContainer] = useState<HTMLDivElement | null>(null);
  const [graphDimensions, setGraphDimensions] = useState({ width: 800, height: 500 });
  const [selectedGraphNode, setSelectedGraphNode] = useState<any>(null);
  const forceGraphRef = useRef<any>(null);
  const [fgInstance, setFgInstance] = useState<any>(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!graphContainer) return;
    if (!document.fullscreenElement) {
      graphContainer.requestFullscreen().catch((err) => {
        toast({
          title: "Fullscreen Error",
          description: `Could not enter fullscreen: ${err.message}`,
          variant: "destructive",
        });
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => {
    const fg = forceGraphRef.current;
    if (!fg) return;
    const currentZoom = fg.zoom();
    const nextZoom = Math.min(2.5, currentZoom * 1.3);
    fg.zoom(nextZoom, 300);
  };

  const handleZoomOut = () => {
    const fg = forceGraphRef.current;
    if (!fg) return;
    const currentZoom = fg.zoom();
    const nextZoom = Math.max(0.6, currentZoom * 0.7);
    fg.zoom(nextZoom, 300);
  };

  const handleResetZoom = () => {
    const fg = forceGraphRef.current;
    if (!fg) return;
    fg.centerAt(0, 0, 400);
    fg.zoom(1.1, 400);
  };

  const onGraphRef = useCallback((fg: any) => {
    forceGraphRef.current = fg;
    setFgInstance(fg);
  }, []);

  // Configure d3 collision force to prevent node overlap
  useEffect(() => {
    if (!fgInstance) return;
    const allLinks = activeData?.networkGraph?.links || activeData?.networkGraph?.edges || [];
    fgInstance.d3Force('collision', forceCollide((node: any) => {
      const labelLen = (node.label || node.id || "").length;
      return Math.max(60, labelLen * 3.5);
    }).strength(1));
    fgInstance.d3Force('charge')?.strength(-1200)?.distanceMax(800);
    fgInstance.d3Force('link')?.distance(220).strength(0.5);
    fgInstance.d3ReheatSimulation();
  }, [activeData, fgInstance]);

  useEffect(() => {
    if (!graphContainer) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setGraphDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height
        });
      }
    });
    observer.observe(graphContainer);
    
    // Initial size
    setGraphDimensions({
      width: graphContainer.clientWidth,
      height: graphContainer.clientHeight
    });
    
    return () => observer.disconnect();
  }, [graphContainer]);
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

  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(2);
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
      message: <>{customOpinion || "Please review the latest transaction records."}</>,
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
          message: <>{customOpinion || `Analyzing the evidence based on my system instructions: "${p.prompt.substring(0, 80)}..." I conclude that this warrants deeper review but aligns with my specialized parameters.`}</>,
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
        message: <>{"Acknowledged human input. Integrating new context into the evidentiary graph. The human insight highlights a crucial nuance missing from the raw text processing."}</>,
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

  const renderDetailsPanel = (isOverlay: boolean) => {
    if (!selectedGraphNode) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className={
          isOverlay
            ? "absolute right-4 top-16 bottom-4 w-80 md:w-96 bg-white border border-slate-200 rounded-xl p-5 shadow-lg overflow-y-auto flex flex-col z-30"
            : "w-1/3 bg-white border border-border/50 rounded-xl p-5 shadow-sm overflow-y-auto flex flex-col"
        }
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-lg text-slate-800">Node Details</h4>
          <Button variant="ghost" size="icon" onClick={() => setSelectedGraphNode(null)} className="h-6 w-6 rounded-full text-slate-400 hover:text-slate-700">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Entity Label</div>
            <div className="font-semibold text-slate-900 text-base">{selectedGraphNode.label}</div>
          </div>
          
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Entity Type</div>
            <Badge variant="outline" className="bg-slate-50">{selectedGraphNode.type}</Badge>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Internal ID</div>
            <div className="font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">{selectedGraphNode.id}</div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Connected Relationships</div>
            <div className="space-y-2">
              {(activeData?.networkGraph?.links || activeData?.networkGraph?.edges || []).filter((l: any) => 
                (typeof l.source === 'object' ? l.source.id === selectedGraphNode.id : l.source === selectedGraphNode.id) || 
                (typeof l.target === 'object' ? l.target.id === selectedGraphNode.id : l.target === selectedGraphNode.id)
              ).map((link: any, i: number) => {
                const isSource = (typeof link.source === 'object' ? link.source.id === selectedGraphNode.id : link.source === selectedGraphNode.id);
                const otherNodeId = isSource ? 
                  (typeof link.target === 'object' ? link.target.id : link.target) : 
                  (typeof link.source === 'object' ? link.source.id : link.source);
                  
                const otherNode = (activeData?.networkGraph?.nodes || []).find((n: any) => n.id === otherNodeId);
                
                return (
                  <div key={i} className="flex flex-col p-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                    <span className="text-slate-400 font-mono text-[9px] uppercase tracking-wider mb-1">
                      {isSource ? "Outbound" : "Inbound"}
                    </span>
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span className="text-indigo-600 font-bold">{link.relationship}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{otherNode?.label || otherNodeId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
  <DashboardLayout>
    {/* Investigation loading overlay — shown while AI agent processes the case */}
    <AnimatePresence>
      {showLoadingOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)" }}
        >
          <button
            onClick={() => navigate("/alerts")}
            className="absolute top-5 right-5 flex items-center gap-1.5 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-colors"
            title="Cancel and go back to alerts"
          >
            <XCircle className="w-4 h-4" /> Close
          </button>
          <div className="flex flex-col items-center gap-7 max-w-md text-center px-8">
            {/* Animated icon */}
            <div className="relative">
              <div className="w-24 h-24 border-4 border-indigo-100 rounded-full animate-spin border-t-indigo-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-9 w-9 text-indigo-600" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                Building Investigation Report
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Scraping news sources, running multi-agent AI analysis, and assembling the full intelligence profile for this entity.
              </p>
            </div>

            {/* Steps */}
            <div className="w-full space-y-2 text-left">
              {[
                { label: "Extracting company intelligence", done: true },
                { label: "Scraping adverse media sources", done: true },
                { label: "Running AI risk assessment", done: invStatus === "completed" },
                { label: "Generating investigation report", done: invStatus === "completed" }
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  <span className={`text-[13px] font-medium ${step.done ? "text-emerald-700" : "text-indigo-700"}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-indigo-600 h-2 rounded-full"
                animate={{ width: ["20%", "80%"] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
            </div>

            <p className="text-xs text-slate-400">This typically takes 30–90 seconds</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

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
              <Badge className={`${Number(activeData ? activeData.riskScore : entity.risk_score) >= 80 ? 'bg-destructive/10 text-destructive border-destructive/20' : Number(activeData ? activeData.riskScore : entity.risk_score) >= 60 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'} border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
                {Number(activeData ? activeData.riskScore : entity.risk_score) >= 80 ? 'CRITICAL' : Number(activeData ? activeData.riskScore : entity.risk_score) >= 60 ? 'HIGH RISK' : 'ELEVATED'}
              </Badge>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{activeData ? activeData.investigationId : "ALT-4891"}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">{activeData ? activeData.triggerEvent : (entity.latest_signal || "Adverse media hit — suspected fraud exposure")}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5">{isCompany ? <Building className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />} {activeData ? activeData.masterEntityProfile.fullName : entity.name}</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" /> {activeData ? activeData.masterEntityProfile.jurisdiction : entity.jurisdiction}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> {activeData ? activeData.timestamp : "2024-03-15 14:23 UTC"}</span>
              <span className="flex items-center gap-1.5"><ExternalLink className="h-4 w-4 text-primary" /> {activeData ? activeData.source : "Sentinel AI Source"}</span>
            </div>

            {/* Source evidence links from riskExplanation.evidence */}
            {activeData?.riskExplanation?.evidence?.filter((e: any) => e.url)?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeData.riskExplanation.evidence.filter((e: any) => e.url).map((ev: any, i: number) => (
                  <a
                    key={i}
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                    title={ev.indicator}
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {ev.source || new URL(ev.url).hostname.replace("www.", "")}
                    {ev.points != null && (
                      <span className="ml-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                        +{ev.points}pts
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
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
              
              <DialogContent aria-describedby={undefined} className="max-w-md">
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

          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue={isCroftzAlert ? "adverse_media" : "summary"}>
        <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 w-full justify-start overflow-x-auto h-auto gap-4">
          <TabsTrigger value="summary" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Summary</TabsTrigger>
          <TabsTrigger value="network" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Network Graph</TabsTrigger>
          <TabsTrigger value="evidence" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Source Evidence</TabsTrigger>
          <TabsTrigger value="entity" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Entity Profile</TabsTrigger>
          <TabsTrigger value="timeline" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Timeline</TabsTrigger>
          <TabsTrigger value="reasoning" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">AI Reasoning</TabsTrigger>
          <TabsTrigger value="debate" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Sentinel Debate</TabsTrigger>
          <TabsTrigger value="pending_updates" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1 flex items-center gap-1.5">
            Pending Updates
            {pendingUpdatesCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {pendingUpdatesCount}
              </span>
            )}
          </TabsTrigger>
          {isCroftzAlert && (
            <TabsTrigger value="adverse_media" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent data-[state=active]:text-purple-600 data-[state=active]:shadow-none py-3 px-1 flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" /> Adverse Media
            </TabsTrigger>
          )}
          {/* Audit Trail tab hidden from UI — route still exists */}
        </TabsList>

        <TabsContent value="pending_updates">
          <div className="mt-6 relative">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-2xl">
              <div className="bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-sm">
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Coming Soon</h3>
                <p className="text-sm text-slate-500">
                  The Profile Update Approvals module is currently in development. You will soon be able to review and merge external data changes directly.
                </p>
              </div>
            </div>

            {/* Blurred Content */}
            <div className="space-y-6 blur-[4px] pointer-events-none opacity-60 select-none">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Profile Update Approvals</h2>
                <p className="text-sm text-slate-500">Review incoming data changes pushed from external data sources before they are merged into the system of record.</p>
              </div>
            </div>

            {/* Mock Update 1: Address Change */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 text-amber-700 p-2 rounded-lg"><Building className="h-4 w-4" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Registered Address Change Detected</h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[10px]">Source: Companies House API</span>
                      <span>• 2 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => {
                      const el = (e.target as HTMLElement).closest('.bg-white');
                      if (el) el.classList.add('hidden');
                      setPendingUpdatesCount(prev => Math.max(0, prev - 1));
                      toast({ title: "Change Rejected", description: "The address update has been discarded.", variant: "destructive" });
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={(e) => {
                      const el = (e.target as HTMLElement).closest('.bg-white');
                      if (el) el.classList.add('hidden');
                      setPendingUpdatesCount(prev => Math.max(0, prev - 1));
                      toast({ title: "Change Approved", description: "The company profile address has been updated successfully." });
                    }}
                  >
                    Approve Change
                  </Button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-8 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full z-10 shadow-sm">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current System of Record (Old Data)</span>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl line-through text-slate-500 decoration-red-400 decoration-2">
                    124 Baker Street<br />
                    London, W1U 6TZ<br />
                    United Kingdom
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Incoming Update (New Data)</span>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                    15 Canary Wharf Boulevard<br />
                    Suite 400<br />
                    London, E14 5AB<br />
                    United Kingdom
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mock Update 2: New Director */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg"><UserPlus className="h-4 w-4" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">New Director Appointment</h3>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono text-[10px]">Source: Global Premium Data Provider</span>
                      <span>• 5 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={(e) => {
                      const el = (e.target as HTMLElement).closest('.bg-white');
                      if (el) el.classList.add('hidden');
                      setPendingUpdatesCount(prev => Math.max(0, prev - 1));
                      toast({ title: "Change Rejected", description: "The director appointment has been discarded.", variant: "destructive" });
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={(e) => {
                      const el = (e.target as HTMLElement).closest('.bg-white');
                      if (el) el.classList.add('hidden');
                      setPendingUpdatesCount(prev => Math.max(0, prev - 1));
                      toast({ title: "Change Approved", description: "The new director has been added to the corporate structure." });
                    }}
                  >
                    Approve Change
                  </Button>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-8 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200 -translate-x-1/2" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-400 p-1.5 rounded-full z-10 shadow-sm">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current System of Record (Old Data)</span>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
                    <em className="text-xs">No matching director record found.</em>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Incoming Update (New Data)</span>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                    <div className="flex items-center justify-between mb-2">
                      <strong>Vladimir Sokolov</strong>
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[9px] uppercase tracking-wider">Sanctioned Person</Badge>
                    </div>
                    <div className="text-sm">Appointed: Oct 12, 2023</div>
                    <div className="text-sm">Role: Executive Director</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {pendingUpdatesCount === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">All Caught Up!</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">There are no more pending data updates for this entity. The system of record is completely up to date.</p>
              </motion.div>
            )}

            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <div className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-5 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-500" /> AI-Generated Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeData ? activeData.summary.aiGeneratedSummary : (
                  <>
                    Sentinel AI analysis of recent signals for <span className="font-bold text-foreground">{entity.name}</span> indicates a {entity.latest_signal?.toLowerCase() || 'potential risk exposure'}. 
                    {isCompany ? " The corporate entity's recent activities have matched against key regulatory flags, triggering a heightened risk profile." : " The individual has been identified across multiple data points suggesting involvement in monitored activities."}
                  </>
                )}
              </p>
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matched Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {(activeData ? activeData.summary.matchedFields : ["Full name match", "DOB confirmed", "UK jurisdiction", "Known associate"]).map((f: string) => (
                    <Badge key={f} variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-5 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Suggested Actions</h3>
              <div className="space-y-3">
                {(activeData?.summary?.suggestedActions || [
                  { action: "Escalate to Senior Analyst", priority: "Recommended" },
                  { action: "Request enhanced due diligence", priority: "Required" },
                  { action: "File SAR consideration", priority: "Under Review" },
                  { action: "Notify relationship manager", priority: "Optional" },
                ]).map((a: any) => {
                  let color = "bg-muted text-muted-foreground border border-border/50";
                  const p = (a.priority || "").toLowerCase();
                  if (p === "recommended") color = "bg-warning/10 text-warning border border-warning/20";
                  else if (p === "required") color = "bg-destructive/10 text-destructive border border-destructive/20";
                  else if (p === "under review") color = "bg-primary/10 text-primary border border-primary/20";
                  else if (p === "optional") color = "bg-emerald-50 text-emerald-600 border border-emerald-200";
                  
                  return (
                    <div key={a.action} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm hover:border-indigo-500/20 transition-colors">
                      <span className="text-sm font-semibold">{a.action}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${color}`}>{a.priority}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 mt-6 relative overflow-hidden h-[600px] flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-black/5 pointer-events-none mix-blend-overlay"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Network className="h-5 w-5 text-indigo-500" /> Dynamic Knowledge Graph</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white shadow-sm font-mono text-[10px]">Interactive Graph</Badge>
                {selectedGraphNode && (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm font-mono text-[10px]">
                    Selected: {selectedGraphNode.type}
                  </Badge>
                )}
              </div>
            </div>

            <div className={`relative w-full flex-grow flex gap-4 ${isMaximized ? 'z-[100]' : 'z-10'}`}>
              {isMaximized && (
                <div 
                  className="fixed inset-0 bg-white/70 backdrop-blur-md z-[100] transition-all duration-300 animate-in fade-in" 
                  onClick={() => setIsMaximized(false)}
                />
              )}
              <div 
                className={`border border-border/50 rounded-xl overflow-hidden bg-slate-50/50 transition-all duration-300 flex flex-col ${
                  isMaximized 
                    ? 'fixed inset-6 md:inset-12 z-[101] bg-white shadow-2xl border-slate-200 p-4 rounded-2xl' 
                    : isFullscreen
                      ? 'fixed inset-0 z-[101] w-full h-full bg-white p-4'
                      : `relative h-full flex-grow ${selectedGraphNode ? 'w-2/3' : 'w-full'}`
                }`} 
                ref={setGraphContainer}
              >
                {isMaximized && (
                  <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2">
                    <Network className="h-4 w-4 text-indigo-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700">Dynamic Knowledge Graph (Maximized View)</span>
                  </div>
                )}

                {/* Floating Graph Controls */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl p-1.5 shadow-md hover:shadow-lg hover:border-slate-300/80 transition-all">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleResetZoom}
                    title="Fit to Screen"
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMaximized(!isMaximized)}
                    title={isMaximized ? "Minimize Panel" : "Maximize Panel"}
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                    className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </Button>
                </div>

                {(() => {
                  let nodes = activeData?.networkGraph?.nodes || [];
                  let links = activeData?.networkGraph?.links || activeData?.networkGraph?.edges || [];
                  
                  // Fallback data if none exists
                  if (nodes.length === 0) {
                    nodes = [
                      { id: "E-1", label: entity.name, type: isCompany ? "Company" : "Person" },
                      { id: "E-2", label: "Subsidiary Ltd", type: "Company" },
                      { id: "L-1", label: "SEC Investigation", type: "Investigation" },
                      { id: "N-1", label: "Fraud Allegations", type: "News Article" }
                    ];
                    links = [
                      { source: "E-1", target: "E-2", relationship: "HAS_OWNER" },
                      { source: "E-1", target: "L-1", relationship: "SUBJECT_OF" },
                      { source: "N-1", target: "E-1", relationship: "MENTIONS" },
                      { source: "N-1", target: "L-1", relationship: "DESCRIBES" }
                    ];
                  }

                  const getNodeColor = (type: string) => {
                    const t = (type || "").toLowerCase();
                    if (t.includes("company") || t.includes("business")) return { bg: "#EEF2FF", border: "#6366F1", text: "#3730A3" }; 
                    if (t.includes("person") || t.includes("director") || t.includes("owner")) return { bg: "#FFFBEB", border: "#F59E0B", text: "#B45309" }; 
                    if (t.includes("litigation") || t.includes("case") || t.includes("investigation")) return { bg: "#FFF1F2", border: "#E11D48", text: "#9F1239" }; 
                    if (t.includes("news") || t.includes("article")) return { bg: "#F0FDF4", border: "#10B981", text: "#065F46" }; 
                    if (t.includes("bankruptcy") || t.includes("event") || t.includes("change")) return { bg: "#FAF5FF", border: "#A855F7", text: "#6B21A8" }; 
                    return { bg: "#F8FAFC", border: "#94A3B8", text: "#334155" }; 
                  };

                  const getNodeConfig = (type: string, id: string, allLinks: any[]) => {
                    const t = (type || "").toLowerCase();
                    // Count connections to determine node importance
                    const connections = allLinks.filter((l: any) => {
                      const src = typeof l.source === 'object' ? l.source.id : l.source;
                      const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                      return src === id || tgt === id;
                    }).length;
                    
                    // Radius: hub nodes are bigger
                    const baseRadius = connections >= 5 ? 38 : connections >= 3 ? 28 : 22;
                    
                    if (t.includes("company") || t.includes("business")) 
                      return { fill1: "#4F46E5", fill2: "#6366F1", border: "#818CF8", text: "#FFFFFF", radius: baseRadius, glow: "rgba(99,102,241,0.35)" };
                    if (t.includes("person") || t.includes("director") || t.includes("owner")) 
                      return { fill1: "#D97706", fill2: "#F59E0B", border: "#FCD34D", text: "#FFFFFF", radius: baseRadius, glow: "rgba(245,158,11,0.35)" };
                    if (t.includes("country") || t.includes("jurisdiction")) 
                      return { fill1: "#0891B2", fill2: "#06B6D4", border: "#67E8F9", text: "#FFFFFF", radius: baseRadius, glow: "rgba(6,182,212,0.35)" };
                    if (t.includes("industry") || t.includes("service") || t.includes("partner")) 
                      return { fill1: "#059669", fill2: "#10B981", border: "#6EE7B7", text: "#FFFFFF", radius: baseRadius, glow: "rgba(16,185,129,0.35)" };
                    if (t.includes("litigation") || t.includes("case") || t.includes("investigation")) 
                      return { fill1: "#DC2626", fill2: "#EF4444", border: "#FCA5A5", text: "#FFFFFF", radius: baseRadius, glow: "rgba(239,68,68,0.35)" };
                    if (t.includes("news") || t.includes("article") || t.includes("media")) 
                      return { fill1: "#7C3AED", fill2: "#8B5CF6", border: "#C4B5FD", text: "#FFFFFF", radius: baseRadius, glow: "rgba(139,92,246,0.35)" };
                    if (t.includes("event") || t.includes("bankruptcy") || t.includes("dissolution")) 
                      return { fill1: "#BE185D", fill2: "#EC4899", border: "#F9A8D4", text: "#FFFFFF", radius: baseRadius, glow: "rgba(236,72,153,0.35)" };
                    return { fill1: "#475569", fill2: "#64748B", border: "#94A3B8", text: "#FFFFFF", radius: baseRadius, glow: "rgba(100,116,139,0.35)" };
                  };

                  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
                    const words = text.split(' ');
                    const lines: string[] = [];
                    let currentLine = '';
                    for (const word of words) {
                      const testLine = currentLine ? `${currentLine} ${word}` : word;
                      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                      } else {
                        currentLine = testLine;
                      }
                    }
                    if (currentLine) lines.push(currentLine);
                    return lines.slice(0, 3);
                  };

                  return (
                    <ForceGraph2D
                      width={graphDimensions.width}
                      height={graphDimensions.height}
                      graphData={{ nodes, links }}
                      nodeRelSize={1}
                      nodeVal={(node: any) => {
                        const t = (node.type || "").toLowerCase();
                        const allLinks = activeData?.networkGraph?.links || activeData?.networkGraph?.edges || [];
                        const connections = allLinks.filter((l: any) => {
                          const src = typeof l.source === 'object' ? l.source.id : l.source;
                          const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                          return src === node.id || tgt === node.id;
                        }).length;
                        const r = connections >= 5 ? 38 : connections >= 3 ? 28 : 22;
                        return r * r; // nodeVal is proportional to area
                      }}
                      linkDirectionalArrowLength={4}
                      linkDirectionalArrowRelPos={1}
                      linkColor={() => "#CBD5E1"}
                      linkWidth={1.5}
                      minZoom={0.6}
                      maxZoom={2.5}
                      d3AlphaDecay={0.008}
                      d3VelocityDecay={0.2}
                      warmupTicks={200}
                      cooldownTicks={0}
                      ref={onGraphRef}
                      enableZoomInteraction={false}
                      onEngineStop={() => {
                        const fg = forceGraphRef.current;
                        if (!fg) return;
                        
                        if (nodes.length > 0) {
                          let maxConns = -1;
                          let mainNode = nodes[0];
                          nodes.forEach((n: any) => {
                            const conns = links.filter((l: any) => {
                              const src = typeof l.source === 'object' ? l.source.id : l.source;
                              const tgt = typeof l.target === 'object' ? l.target.id : l.target;
                              return src === n.id || tgt === n.id;
                            }).length;
                            if (conns > maxConns) {
                              maxConns = conns;
                              mainNode = n;
                            }
                          });
                          
                          // Focus on the main node instantly when physics stop
                          fg.centerAt(mainNode.x, mainNode.y, 0);
                          fg.zoom(1.1, 0); 
                        } else {
                          fg.zoomToFit(0, 60);
                        }
                      }}
                      onNodeClick={(node) => setSelectedGraphNode(node)}
                      onBackgroundClick={() => setSelectedGraphNode(null)}
                      nodePointerAreaPaint={(node: any, color, ctx) => {
                        const dims = node.__dims || { w: 80, h: 36 };
                        ctx.fillStyle = color;
                        const r = 5;
                        const x = node.x - dims.w / 2, y = node.y - dims.h / 2;
                        ctx.beginPath();
                        ctx.moveTo(x + r, y); ctx.lineTo(x + dims.w - r, y);
                        ctx.quadraticCurveTo(x + dims.w, y, x + dims.w, y + r);
                        ctx.lineTo(x + dims.w, y + dims.h - r);
                        ctx.quadraticCurveTo(x + dims.w, y + dims.h, x + dims.w - r, y + dims.h);
                        ctx.lineTo(x + r, y + dims.h); ctx.quadraticCurveTo(x, y + dims.h, x, y + dims.h - r);
                        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
                        ctx.closePath(); ctx.fill();
                      }}
                      nodeCanvasObject={(node: any, ctx, globalScale) => {
                        const label = node.label || node.id;
                        const type = node.type || "";
                        const isSelected = node === selectedGraphNode;

                        // --- Color scheme per type ---
                        const getChipColors = (t: string) => {
                          const tl = t.toLowerCase();
                          if (tl === "person") return { border: "#F59E0B", text: "#92400E", typeBg: "#FEF3C7", typeText: "#D97706" };
                          if (tl === "country") return { border: "#06B6D4", text: "#164E63", typeBg: "#CFFAFE", typeText: "#0E7490" };
                          if (tl === "state/province" || tl === "city") return { border: "#0EA5E9", text: "#0C4A6E", typeBg: "#E0F2FE", typeText: "#0369A1" };
                          if (tl === "industry") return { border: "#10B981", text: "#064E3B", typeBg: "#D1FAE5", typeText: "#059669" };
                          if (tl === "regulator") return { border: "#EF4444", text: "#7F1D1D", typeBg: "#FEE2E2", typeText: "#DC2626" };
                          if (tl === "social media") return { border: "#EC4899", text: "#831843", typeBg: "#FCE7F3", typeText: "#BE185D" };
                          if (tl === "news article") return { border: "#8B5CF6", text: "#4C1D95", typeBg: "#EDE9FE", typeText: "#7C3AED" };
                          if (tl === "asset") return { border: "#F97316", text: "#7C2D12", typeBg: "#FFEDD5", typeText: "#EA580C" };
                          if (tl === "director") return { border: "#F59E0B", text: "#92400E", typeBg: "#FEF3C7", typeText: "#D97706" };
                          if (tl.includes("litigation") || tl.includes("investigation")) return { border: "#EF4444", text: "#7F1D1D", typeBg: "#FEE2E2", typeText: "#DC2626" };
                          // Company default: blue/indigo
                          return { border: "#6366F1", text: "#1E1B4B", typeBg: "#EEF2FF", typeText: "#4F46E5" };
                        };
                        const colors = getChipColors(type);

                        const nameFontSize = Math.max(9, 11 / globalScale);
                        const typeFontSize = Math.max(7, 8.5 / globalScale);
                        ctx.font = `bold ${nameFontSize}px Inter, system-ui, sans-serif`;
                        const labelWidth = ctx.measureText(label).width;
                        ctx.font = `${typeFontSize}px Inter, system-ui, sans-serif`;
                        const typeWidth = ctx.measureText(type).width;

                        const padX = 12 / globalScale;
                        const padY = 7 / globalScale;
                        const innerGap = 3 / globalScale;
                        const w = Math.max(labelWidth, typeWidth) + padX * 2;
                        const h = nameFontSize + typeFontSize + innerGap + padY * 2;
                        node.__dims = { w, h };

                        const x = node.x - w / 2;
                        const y = node.y - h / 2;
                        const r = 6 / globalScale;

                        // --- Drop shadow ---
                        ctx.shadowColor = "rgba(0,0,0,0.12)";
                        ctx.shadowBlur = 8 / globalScale;
                        ctx.shadowOffsetY = 2 / globalScale;

                        // --- White fill ---
                        ctx.beginPath();
                        ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
                        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                        ctx.lineTo(x + w, y + h - r);
                        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                        ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                        ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
                        ctx.closePath();
                        ctx.fillStyle = "#FFFFFF";
                        ctx.fill();
                        ctx.shadowColor = "transparent";

                        // --- Colored border ---
                        ctx.lineWidth = isSelected ? 2.5 / globalScale : 1.5 / globalScale;
                        ctx.strokeStyle = isSelected ? "#1E40AF" : colors.border;
                        ctx.stroke();

                        // --- Label text ---
                        ctx.textAlign = "center";
                        ctx.textBaseline = "alphabetic";
                        const labelY = node.y - (typeFontSize + innerGap) / 2;
                        ctx.font = `bold ${nameFontSize}px Inter, system-ui, sans-serif`;
                        ctx.fillStyle = colors.text;
                        ctx.fillText(label, node.x, labelY);

                        // --- Type chip ---
                        const typeY = labelY + innerGap + typeFontSize;
                        ctx.font = `${typeFontSize}px Inter, system-ui, sans-serif`;
                        ctx.fillStyle = colors.typeText;
                        ctx.fillText(type, node.x, typeY);
                      }}
                      linkCanvasObjectMode={() => "after"}
                      linkCanvasObject={(link: any, ctx, globalScale) => {
                        if (!link.relationship) return;
                        const start = link.source;
                        const end = link.target;
                        if (typeof start !== "object" || typeof end !== "object") return;

                        const midX = start.x + (end.x - start.x) * 0.5;
                        const midY = start.y + (end.y - start.y) * 0.5;

                        const fontSize = Math.max(7, 8 / globalScale);
                        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";

                        // Simple plain text label like the screenshot
                        const text = link.relationship.replace(/_/g, " ");
                        const tw = ctx.measureText(text).width;
                        // Small semi-transparent white backing
                        ctx.fillStyle = "rgba(255,255,255,0.85)";
                        ctx.fillRect(midX - tw / 2 - 3 / globalScale, midY - fontSize * 0.7, tw + 6 / globalScale, fontSize * 1.4);
                        ctx.fillStyle = "#6B7280";
                        ctx.fillText(text, midX, midY);
                      }}
                    />
                  );
                })()}

                {/* Render Details Panel inside when in Maximized/Fullscreen Overlay mode */}
                <AnimatePresence>
                  {(isMaximized || isFullscreen) && renderDetailsPanel(true)}
                </AnimatePresence>
              </div>

              {/* Render Details Panel as normal side-by-side sibling in normal view */}
              <AnimatePresence>
                {!(isMaximized || isFullscreen) && renderDetailsPanel(false)}
              </AnimatePresence>
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
                {activeData ? (
                  <p>{activeData.sourceEvidence.description}</p>
                ) : (
                  <>
                    <p>Recent sweeps have identified <mark className="bg-warning/20 text-warning-foreground font-semibold px-1 rounded">{entity.name}</mark> ({entity.jurisdiction}) in connection with {entity.latest_signal || "elevated risk activities"}.</p>
                    <p>Analysts are monitoring transaction patterns and relevant network associations to determine full exposure.</p>
                  </>
                )}
              </div>
            </div>
            
            <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 hover:border-indigo-500/30 transition-colors">
              <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-500" /> Sanctions Match</h3>
              <div className="space-y-4 text-sm">
                {activeData ? (
                  activeData.sourceEvidence.sanctionsMatch && activeData.sourceEvidence.sanctionsMatch.length > 0 ? (
                    activeData.sourceEvidence.sanctionsMatch.map((match: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-warning/5 border border-warning/30 shadow-sm relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                        <div className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground/70 mb-1.5">Source: {match.source || "External Database"}</div>
                        <div className="font-bold text-foreground">{match.result || "Fuzzy Match"}</div>
                        {match.details && <div className="text-xs text-muted-foreground mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">{match.details}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Global Sanctions Lists</div>
                      <div className="font-bold text-slate-800">No matches found</div>
                      <div className="text-xs text-emerald-600 mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">Entity cleared across OFAC, EU, UN, and HMT databases.</div>
                    </div>
                  )
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>


          </div>
        </TabsContent>

        <TabsContent value="entity">
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            <div className="md:col-span-2 rounded-2xl border border-border/50 bg-white shadow-sm p-6">
              <h3 className="text-base font-bold tracking-tight mb-6">Master Entity Profile</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {(activeData ? [
                  ["Company Name", activeData.masterEntityProfile.fullName],
                  ["Aliases", activeData.masterEntityProfile.aliases.join(", ")],
                  ["Incorporation Date", activeData.masterEntityProfile.dateOfBirth || "N/A"],
                  ["Jurisdiction", activeData.masterEntityProfile.jurisdiction],
                  ["Identifiers", activeData.masterEntityProfile.identifiers.map((i:any) => `${i.type}: ${i.value}`).join(" | ")],
                  ["Linked Jurisdictions", activeData.masterEntityProfile.linkedJurisdictions.join(", ")]
                ] : [
                  [isCompany ? "Company Name" : "Full Name", entity.name],
                  ["Aliases", isCompany ? "None registered" : "J. Doe, Johan Doe, JMD"],
                  [isCompany ? "Incorporation Date" : "Date of Birth", isCompany ? "12 August 2010" : "22 March 1985"],
                  ["Jurisdiction", entity.jurisdiction],
                  ["Identifiers", isCompany ? "Reg No: 18492048" : "Passport: GB-8842991"],
                  ["Linked Jurisdictions", `${entity.jurisdiction}, BVI, UAE, Switzerland`],
                ]).map(([label, value]) => (
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
                {(activeData ? [
                  { label: "Sanctions Lists", count: activeData.masterEntityProfile.riskIndicators.sanctionsLists || 0, color: "text-success bg-success/10 border-success/20" },
                  { label: "PEP Associations", count: activeData.masterEntityProfile.riskIndicators.pepAssociations || 0, color: "text-success bg-success/10 border-success/20" },
                  { label: "Adverse Media", count: activeData.masterEntityProfile.riskIndicators.adverseMedia || 0, color: "text-destructive bg-destructive/10 border-destructive/20" },
                  { label: "Watchlist Memberships", count: activeData.masterEntityProfile.riskIndicators.watchlistMemberships || 0, color: "text-success bg-success/10 border-success/20" },
                ] : [
                  { label: "Sanctions Lists", count: 0, color: "text-success bg-success/10 border-success/20" },
                  { label: "PEP Associations", count: 1, color: "text-warning bg-warning/10 border-warning/20" },
                  { label: "Adverse Media", count: 3, color: "text-destructive bg-destructive/10 border-destructive/20" },
                  { label: "Watchlist Memberships", count: 2, color: "text-warning bg-warning/10 border-warning/20" },
                ]).map(r => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm">
                    <span className="text-sm font-semibold">{r.label}</span>
                    <span className={`font-mono font-black px-2.5 py-1 rounded-md border ${r.color}`}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Conflicting Data Resolution Panel */}
          {(!activeData && isCompany) && (
            <div className="mt-5 rounded-2xl border border-warning/50 bg-warning/5 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                <ShieldQuestion className="h-32 w-32 text-warning" />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-base font-bold tracking-tight flex items-center gap-2 text-warning-foreground">
                    <ShieldQuestion className="h-5 w-5 text-warning" /> Data Conflict Resolution Required
                  </h3>
                  <p className="text-xs text-warning-foreground/80 mt-1">Multiple sources are reporting conflicting information about this entity.</p>
                </div>
                <Badge variant="outline" className="bg-warning/20 text-warning-foreground border-warning/30 font-mono">1 Unresolved Conflict</Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 relative z-10">
                {/* Conflict Option A */}
                <div className="bg-white rounded-xl border-2 border-indigo-500 shadow-sm p-5 relative overflow-hidden group cursor-pointer hover:bg-indigo-50/30 transition-colors">
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Sentinel Recommended
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Source A</div>
                  <h4 className="font-semibold text-sm mb-3">UK Companies House Registry</h4>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <div className="text-xs font-mono text-slate-500 mb-1">Incorporation Date</div>
                    <div className="text-sm font-bold text-slate-900">12 August 2010</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">99% Trust Score</Badge>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs" onClick={(e) => { e.stopPropagation(); toast({ title: "Conflict Resolved", description: "UK Companies House set as ground truth." }); }}>Accept as Ground Truth</Button>
                  </div>
                </div>

                {/* Conflict Option B */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Source B</div>
                  <h4 className="font-semibold text-sm mb-3">Third-Party Lead DB (Acquired)</h4>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                    <div className="text-xs font-mono text-slate-500 mb-1">Incorporation Date</div>
                    <div className="text-sm font-bold line-through text-slate-400">05 September 2015</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">62% Trust Score</Badge>
                    <Button size="sm" variant="outline" className="h-8 text-xs text-slate-500" onClick={(e) => { e.stopPropagation(); toast({ title: "Source Dismissed", description: "Conflict removed." }); }}>Dismiss</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Risk Velocity Chart */}
          {!activeData && (
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
          )}

          {/* Directors & Officers Panel */}
          {isCompany && (
            <div className="mt-5 rounded-2xl border border-border/50 bg-white shadow-sm p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-indigo-500" /> Corporate Officers & Directors
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Real-time tracking of appointments, resignations, and PEP associations</p>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <Table>
                  {activeData && activeData.masterEntityProfile.keyPersonnel ? (
                    <>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="border-border/50">
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Officer Name</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeData.masterEntityProfile.keyPersonnel.map((person: any, idx: number) => (
                          <TableRow key={idx} className="border-border/50 hover:bg-slate-50/50">
                            <TableCell className="font-semibold text-sm">{person.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{person.role}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </>
                  ) : (
                    <>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="border-border/50">
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Officer Name</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Role</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Status</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Appointed</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Resigned</TableHead>
                          <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold py-3 h-auto">Risk Flags</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {corporateOfficers.map((officer) => (
                        <TableRow key={officer.id} className="border-border/50 hover:bg-slate-50/50">
                          <TableCell className="font-semibold text-sm">{officer.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{officer.role}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${officer.status === 'Active' ? 'text-success border-success/30 bg-success/5' : 'text-muted-foreground border-border bg-muted/10'}`}>
                              {officer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-mono text-muted-foreground">{officer.appointed}</TableCell>
                          <TableCell className="text-sm font-mono text-muted-foreground">{officer.resigned || "-"}</TableCell>
                          <TableCell>
                            {officer.isPEP ? (
                              <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-[10px] uppercase tracking-wider gap-1">
                                <Flag className="h-3 w-3" /> PEP
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Clear</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      </TableBody>
                    </>
                  )}
                </Table>
              </div>
            </div>
          )}

        </TabsContent>

        <TabsContent value="timeline">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 mt-6">
            <h3 className="text-base font-bold tracking-tight mb-8">Corporate History & Event Elevation</h3>
            
            {/* Elevation Graph */}
            {(!activeData && isCompany) && (
              <div className="mb-10 p-4 rounded-xl border border-border/50 bg-slate-50/50">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Event Elevation Graph</h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineHistory} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} dy={10} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded-xl border border-border/50 shadow-lg w-64">
                                <div className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{data.date}</div>
                                <div className="text-xs font-semibold">{data.event}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="y" 
                        stroke="#4F46E5" 
                        strokeWidth={2} 
                        dot={({ cx, cy, payload, index }) => {
                          const color = payload.type === 'critical' ? '#ef4444' : payload.type === 'warning' ? '#f59e0b' : '#3b82f6';
                          return (
                            <circle key={`dot-${index}`} cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
                          );
                        }}
                        activeDot={{ r: 7 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeData ? (
              activeData.immutableLedger && activeData.immutableLedger.length > 0 ? (
                <div className="space-y-6">
                  {activeData.immutableLedger.map((e: any, i: number) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full border-2 border-white shadow-sm z-10 bg-indigo-500 ring-2 ring-indigo-500/30" />
                        {i < activeData.immutableLedger.length - 1 && <div className="w-0.5 flex-1 bg-border/80 group-hover:bg-indigo-500/30 transition-colors mt-2 mb-1" />}
                      </div>
                      <div className="pb-6 pt-0.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{e.timestamp || e.date}</div>
                        <div className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{e.event || e.description || e.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border border-dashed border-border/60 bg-muted/20 mt-4">
                  <div className="text-muted-foreground text-sm font-medium">No historical events recorded on the ledger.</div>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {timelineHistory.slice().reverse().map((e, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm z-10 ${
                        e.type === "critical" ? "bg-destructive ring-2 ring-destructive/30" : e.type === "warning" ? "bg-warning ring-2 ring-warning/30" :
                        e.type === "success" ? "bg-success ring-2 ring-success/30" : "bg-blue-500 ring-2 ring-blue-500/30"
                      }`} />
                      {i < timelineHistory.length - 1 && <div className="w-0.5 flex-1 bg-border/80 group-hover:bg-indigo-500/30 transition-colors mt-2 mb-1" />}
                    </div>
                    <div className="pb-6 pt-0.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{e.date}</div>
                      <div className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{e.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reasoning">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-8 mt-6 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Brain className="h-48 w-48 text-indigo-900" />
            </div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 relative z-10"><Brain className="h-5 w-5 text-indigo-500" /> AI Reasoning Chain</h3>
            <div className="space-y-6 relative z-10">
              {(activeData ? activeData.aiReasoningChain.map((s:any) => ({ step: s.title, detail: s.details })) : [
                { step: "Sources Checked", detail: "OFAC SDN, EU Consolidated, UN Sanctions, UK HMT, 2,847 media sources" },
                { step: "Entities Extracted", detail: "3 named entities from FT article matched against portfolio: John Doe (94%), BVI Holdings (67%), J. Doe Associates (45%)" },
                { step: "Matching Confidence", detail: "Primary entity: 94% confidence based on full name, DOB, and jurisdiction alignment" },
                { step: "Risk Signals Detected", detail: "Fraud investigation, SFO involvement, offshore transaction patterns, shell company structures" },
                { step: "Severity Rationale", detail: "Classified as CRITICAL due to: active law enforcement investigation, high confidence match, and potential SAR obligation" },
              ]).map((s: any, i: number) => (
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
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent pointer-events-none" />

            {/* For Croftz investigations without debate data, show empty state */}
            {isCroftzAlert && !(activeData?.sentinelDebate?.length > 0) ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 mb-1">No Debate Data</h4>
                  <p className="text-sm text-slate-400 max-w-xs">Sentinel Debate runs on cases with structured investigation data. This adverse media alert has not generated debate arguments.</p>
                </div>
              </div>
            ) : (
            <>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                  <MessageSquare className="h-6 w-6 text-indigo-600" /> Sentinel Debate Engine
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">Real-time dialectical reasoning by Sentinel</p>
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
                    
                    <div className="text-sm text-slate-700 leading-relaxed relative z-10">
                      {msg.message}
                    </div>
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
                    <div className="absolute inset-0 bg-black/5 opacity-20 mix-blend-overlay pointer-events-none" />
                    
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
            </>
            )}
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

        {/* Adverse Media Tab — only for Croftz-sourced investigations */}
        <TabsContent value="adverse_media">
          <div className="mt-6 space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-purple-600" /> Adverse Media Screening Results
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Sourced from Croftz real-time adverse media monitoring</p>
              </div>
              {(liveInvData as any)?.riskScore && (
                <div className="text-center px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="text-2xl font-black font-mono text-purple-700">{(liveInvData as any).riskScore}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Risk Score</div>
                </div>
              )}
            </div>

            {/* Show loading state or error */}
            {invStatus === "pending" && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Processing AI investigation report...
              </div>
            )}
            {invStatus === "error" && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4" /> Investigation processing failed. Adverse media articles are shown below from the screening.
              </div>
            )}

            {/* Screening summary from AI data */}
            {liveInvData?.riskExplanation && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Risk Assessment</h4>
                <p className="text-sm text-slate-600">{liveInvData.riskExplanation.why}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(liveInvData.riskExplanation.indicatorsFound || liveInvData.riskExplanation.scoreBreakdown?.indicatorsFound || []).map((ind: string, i: number) => (
                    <span key={i} className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Business intelligence — last 90 days */}
            {liveInvData?.businessIntelligence?.last90DaysChanges?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Recent Events (Last 90 Days)</h4>
                {liveInvData.businessIntelligence.last90DaysChanges.map((ev: any, i: number) => {
                  const evidence: any[] = liveInvData?.riskExplanation?.evidence ?? [];
                  // Match evidence by URL equality or hostname overlap
                  const matched = evidence.find((e: any) => {
                    if (!e.url || !ev.source) return false;
                    try { return e.url === ev.source || ev.source.includes(new URL(e.url).hostname); } catch { return false; }
                  });
                  const sourceLabel = matched?.source ?? (() => {
                    try { return ev.source?.startsWith("http") ? new URL(ev.source).hostname.replace("www.", "") : ev.source; } catch { return "Source"; }
                  })();

                  return (
                    <div key={i} className="border-l-2 border-purple-300 pl-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">{ev.date}</span>
                        <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">Event</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{ev.event}</p>
                      <p className="text-xs text-slate-500">{ev.impact}</p>
                      {ev.source?.startsWith("http") ? (
                        <a
                          href={ev.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          {sourceLabel}
                          {matched?.points != null && (
                            <span className="ml-1 text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                              +{matched.points}pts
                            </span>
                          )}
                        </a>
                      ) : ev.source ? (
                        <span className="text-[11px] text-slate-400">{ev.source}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Key insights */}
            {liveInvData?.businessIntelligence?.keyInsights?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Key Intelligence Insights</h4>
                <ul className="space-y-2">
                  {liveInvData.businessIntelligence.keyInsights.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended actions */}
            {liveInvData?.riskExplanation?.recommendedAction?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                <h4 className="text-sm font-bold text-slate-800">Recommended Actions</h4>
                <ul className="space-y-2">
                  {liveInvData.riskExplanation.recommendedAction.map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Auto-SAR Generator Modal */}
      <Dialog open={isSarOpen} onOpenChange={setIsSarOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-[800px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-[#f8fafc] border-indigo-100 rounded-2xl">
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
