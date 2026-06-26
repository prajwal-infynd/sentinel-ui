import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Bot, AlertTriangle, Eye, ArrowLeft, Scale, Building, FileText, ShieldAlert, Filter, Brain, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, fetchAgentRuns } from "@/lib/dashboard-data";
import { ArticlePreviewModal } from "@/components/media/ArticlePreviewModal";

const severityStyle = (s: string) =>
  s === "critical" ? "shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)] border-destructive/20" :
  s === "high" ? "shadow-[0_0_15px_-3px_rgba(245,158,11,0.1)] border-warning/20" : "shadow-[0_0_15px_-3px_rgba(99,102,241,0.1)] border-primary/20";

const severityBadge = (s: string) =>
  s === "critical" ? "bg-destructive/10 text-destructive" :
  s === "high" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";


const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Legal": return <Scale className="h-4 w-4 text-indigo-500" />;
    case "Corporate Event": return <Building className="h-4 w-4 text-blue-500" />;
    case "Adverse Media": return <FileText className="h-4 w-4 text-amber-500" />;
    case "Sanctions": return <ShieldAlert className="h-4 w-4 text-red-500" />;
    default: return <AlertTriangle className="h-4 w-4 text-warning" />;
  }
};

const LiveAlerts = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ["live-alerts"], queryFn: fetchAlerts });
  const { data: agentRuns = [] } = useQuery({ queryKey: ["agent-runs"], queryFn: fetchAgentRuns, refetchInterval: 15000 });
  const [previewAlert, setPreviewAlert] = useState<any | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Corporate Event", "Legal", "Sanctions", "Adverse Media"];

  const filteredAlerts = useMemo(() => {
    if (activeCategory === "All") return alerts;
    return alerts.filter((a: any) => a.category === activeCategory);
  }, [alerts, activeCategory]);

  const [analyzingAlertId, setAnalyzingAlertId] = useState<string | null>(null);
  const [analyzedAlerts, setAnalyzedAlerts] = useState<Record<string, boolean>>({});
  const [thinkingStep, setThinkingStep] = useState(0);

  const thinkingSteps = [
    "Extracting event entities...",
    "Cross-referencing global sanctions...",
    "Analyzing behavioral intent...",
    "Generating Infyous Consensus..."
  ];

  const handleAIAnalyze = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzingAlertId(id);
    setThinkingStep(0);
  };

  useMemo(() => {
    if (analyzingAlertId) {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setThinkingStep(step);
        if (step >= 4) {
          clearInterval(interval);
          setAnalyzedAlerts(prev => ({ ...prev, [analyzingAlertId]: true }));
          setAnalyzingAlertId(null);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [analyzingAlertId]);

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Live Alert Stream</h1>
          <p className="text-sm text-muted-foreground">Real-time risk event detection and AI agent activity</p>
        </div>
        <div className="flex gap-1 items-center bg-slate-100/50 p-1 rounded-lg border border-slate-200/50 backdrop-blur">
          <Filter className="h-3.5 w-3.5 text-slate-400 ml-2 mr-1" />
          {categories.map(cat => (
            <button 
              key={cat}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeCategory === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* Alert Feed */}
        <div className="lg:col-span-3 overflow-y-auto space-y-4 pr-2 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold">Alert Feed</h2>
            <Badge variant="outline" className="text-xs font-mono ml-auto">{filteredAlerts.length} active</Badge>
          </div>
          
          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed bg-slate-50/50">
              No alerts found for category: {activeCategory}
            </div>
          )}

          {filteredAlerts.map((alert: any, i: number) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative group rounded-xl border bg-white hover:-translate-y-0.5 transition-all p-5 ${severityStyle(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(alert.category)}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${severityBadge(alert.severity)}`}>
                    {String(alert.severity).toUpperCase()}
                  </span>
                  {alert.category && (
                    <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {alert.category}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{new Date(alert.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <h3 className="text-sm font-semibold mb-1 pr-8 text-slate-900">{alert.title}</h3>
              <p className="text-xs text-slate-600 mb-3 pr-8 leading-relaxed">{alert.summary}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="flex items-center gap-1">Entity: <span className="font-semibold text-slate-700">{(alert.monitored_entities as { name?: string } | null)?.name ?? "Linked entity"}</span></span>
                <span className="flex items-center gap-1">Status: <span className="font-medium text-slate-700">{alert.status}</span></span>
                <span className="flex items-center gap-1">Conf: <span className="font-mono text-indigo-600 font-medium">{Number(alert.confidence_score).toFixed(0)}%</span></span>
              </div>
              
              <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between items-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => handleAIAnalyze(alert.id, e)}
                  disabled={analyzingAlertId === alert.id || analyzedAlerts[alert.id]}
                  className={`h-8 text-[10px] uppercase tracking-wider font-bold gap-1.5 transition-all
                    ${analyzedAlerts[alert.id] ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-600 border-indigo-200'}
                  `}
                >
                  {analyzingAlertId === alert.id ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Analyzing...</>
                  ) : analyzedAlerts[alert.id] ? (
                    <><CheckCircle2 className="h-3 w-3" /> Infyous Analyzed</>
                  ) : (
                    <><Sparkles className="h-3 w-3" /> Run AI Analysis</>
                  )}
                </Button>
                
                {(alert.category === "Corporate Event" || alert.title.includes("Change") || alert.title.includes("Update")) && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-8 text-[10px] uppercase font-bold text-red-600 border-red-200 hover:bg-red-50 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = (e.target as HTMLElement).closest('.group');
                        if (el) el.classList.add('hidden');
                        toast({ title: "Change Rejected", description: "This data update has been discarded.", variant: "destructive" });
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-[10px] uppercase font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const el = (e.target as HTMLElement).closest('.group');
                        if (el) el.classList.add('hidden');
                        toast({ title: "Change Approved", description: "The system of record has been updated." });
                      }}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </div>

              {/* AI Reasoning Expansion */}
              {analyzingAlertId === alert.id && (
                <div className="mt-3 bg-slate-900 text-slate-200 rounded-lg p-3 text-xs font-mono flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                  <span className="text-indigo-200">{thinkingSteps[Math.min(thinkingStep, 3)]}</span>
                </div>
              )}

              {analyzedAlerts[alert.id] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 mb-3 flex items-center gap-1.5">
                    <Brain className="h-3 w-3" /> Infyous Consensus
                  </h4>
                  <div className="space-y-3">
                    <div className="flex gap-2 items-start">
                      <div className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">1</div>
                      <p className="text-xs text-slate-700 leading-relaxed"><span className="font-semibold text-slate-900">Entity Resolved:</span> High confidence match (94%) with monitored portfolio entity. No conflicting aliases found.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="h-4 w-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">2</div>
                      <p className="text-xs text-slate-700 leading-relaxed"><span className="font-semibold text-slate-900">Risk Vectors:</span> Triggers Policy KYB-402 (Adverse Media). Cross-referencing shows 2 active warnings in related jurisdictions.</p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="h-4 w-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">3</div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">Recommendation: Escalate severity and tag for immediate manual review by Lead Investigator.</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewAlert({
                    ...alert,
                    generatedAt: alert.generated_at, // Map to match MediaAlert schema
                    confidenceScore: alert.confidence_score,
                  });
                }}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 shadow-sm transition-all scale-95 group-hover:scale-100"
                title="Preview Source"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Agent Activity */}
        <div className="lg:col-span-2 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
          <div className="relative p-5 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur z-10 flex items-center gap-2">
            <Bot className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-semibold">AI Agent Activity</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-[10px] text-slate-400 font-medium">{agentRuns.filter((run: any) => run.status === "running").length} agents active</span>
            </div>
          </div>
          <div className="relative p-5 space-y-2 overflow-y-auto flex-1">
            {agentRuns.map((act: any, i: number) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-800 transition-all group"
              >
                <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${act.status === "running" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-600"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 group-hover:text-indigo-200 transition-colors">{act.agent_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(act.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className={`text-[11px] ${act.status === "running" ? "text-slate-300" : "text-slate-500"} mt-0.5`}>{act.stage ?? "Workflow stage active"}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Article Preview Modal */}
      <ArticlePreviewModal 
        open={!!previewAlert} 
        onOpenChange={(open) => !open && setPreviewAlert(null)} 
        alert={previewAlert} 
      />
    </div>
  </DashboardLayout>
  );
};

export default LiveAlerts;
