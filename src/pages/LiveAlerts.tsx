import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, AlertTriangle, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, fetchAgentRuns } from "@/lib/dashboard-data";
import { ArticlePreviewModal } from "@/components/media/ArticlePreviewModal";

const severityStyle = (s: string) =>
  s === "critical" ? "border-l-destructive bg-destructive/5 hover:border-l-destructive" :
  s === "high" ? "border-l-warning bg-warning/5 hover:border-l-warning" : "border-l-primary bg-primary/5 hover:border-l-primary";

const severityBadge = (s: string) =>
  s === "critical" ? "bg-destructive/10 text-destructive" :
  s === "high" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";

const agentColor = (status: string) =>
  status === "active" ? "text-success" : "text-muted-foreground";

const LiveAlerts = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ["live-alerts"], queryFn: fetchAlerts });
  const { data: agentRuns = [] } = useQuery({ queryKey: ["agent-runs"], queryFn: fetchAgentRuns, refetchInterval: 15000 });
  const [previewAlert, setPreviewAlert] = useState<any | null>(null);

  return (
    <DashboardLayout>
      <div className="p-6 h-[calc(100vh-3.5rem)] flex flex-col">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">

        <h1 className="text-2xl font-bold tracking-tight mb-1">Live Alert Stream</h1>
        <p className="text-sm text-muted-foreground">Real-time risk event detection and AI agent activity</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* Alert Feed */}
        <div className="lg:col-span-2 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h2 className="text-sm font-semibold">Alert Feed</h2>
            <Badge variant="outline" className="text-xs font-mono ml-auto">{alerts.length} active</Badge>
          </div>
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative group rounded-lg border-l-4 p-4 cursor-pointer hover:shadow-md transition-all ${severityStyle(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-1.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${severityBadge(alert.severity)}`}>
                  {String(alert.severity).toUpperCase()}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{new Date(alert.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <h3 className="text-sm font-semibold mb-0.5 pr-8">{alert.title}</h3>
              <p className="text-xs text-muted-foreground mb-2 pr-8">{alert.summary}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Entity: <span className="font-medium text-foreground">{(alert.monitored_entities as { name?: string } | null)?.name ?? "Linked entity"}</span></span>
                <span>Status: {alert.status}</span>
                <span>Conf: <span className="font-mono">{Number(alert.confidence_score).toFixed(0)}%</span></span>
              </div>
              
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
                title="Preview Article"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Agent Activity */}
        <div className="lg:col-span-3 rounded-xl bg-navy text-navy-foreground p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Bot className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold">AI Agent Activity</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-navy-foreground/60">{agentRuns.filter((run) => run.status === "running").length} agents active</span>
            </div>
          </div>
          <div className="space-y-1">
            {agentRuns.map((act, i) => (
              <motion.div
                key={act.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`mt-1 h-1.5 w-1.5 rounded-full ${act.status === "running" ? "bg-success animate-pulse" : "bg-navy-foreground/30"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-accent">{act.agent_name}</span>
                    <span className="text-[10px] text-navy-foreground/40 font-mono">{new Date(act.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className={`text-xs ${agentColor(act.status === "running" ? "active" : "completed")} mt-0.5`}>{act.stage ?? "Workflow stage active"}</p>
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
