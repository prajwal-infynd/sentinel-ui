import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { fetchAgentOverview, fetchMediaDashboardSummary } from "@/lib/media-agent-data";

export default function MediaAutomation() {
  const { data: agents = [] } = useQuery({ queryKey: ["agent-overview"], queryFn: fetchAgentOverview, refetchInterval: 10000 });
  const { data: summary } = useQuery({ queryKey: ["media-dashboard-summary"], queryFn: fetchMediaDashboardSummary, refetchInterval: 10000 });

  const pipelineSteps = [
    { label: "Crawl", desc: `${summary?.sourcesScanned ?? 0} sources`, active: true },
    { label: "Extract", desc: `${summary?.articlesProcessed ?? 0} articles`, active: true },
    { label: "Match", desc: `${summary?.entitiesImpacted ?? 0} entities`, active: true },
    { label: "Score", desc: `${summary?.riskSignals ?? 0} signals`, active: true },
    { label: "Alert", desc: `${summary?.highRiskAlerts ?? 0} alerts`, active: true },
    { label: "Learn", desc: `${summary?.avgConfidence ?? 0}% avg conf`, active: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight">Agent Automation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Continuous database-backed processing across the adverse media pipeline</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold"><Zap className="h-3.5 w-3.5 text-accent" />Continuous Processing Loop</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-center gap-1 py-4">
                {pipelineSteps.map((step, index) => (
                  <div key={step.label} className="flex items-center gap-1">
                    <div className={`min-w-[100px] rounded-xl border px-4 py-3 text-center transition-[box-shadow] ${step.active ? "border-accent/30 bg-accent/5 shadow-sm" : "border-border bg-muted/20"}`}>
                      <div className="mb-1 flex items-center justify-center gap-1">
                        {step.active ? <Loader2 className="h-3 w-3 animate-spin text-accent" /> : <CheckCircle className="h-3 w-3 text-success" />}
                        <span className="text-xs font-semibold">{step.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground">{step.desc}</span>
                    </div>
                    {index < pipelineSteps.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {agents.map((agent, index) => (
            <motion.div key={agent.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 + index * 0.06 }}>
              <Card className="transition-[box-shadow] hover:shadow-lg">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{agent.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${agent.status === "running" ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                        <span className="text-[10px] capitalize text-muted-foreground">{agent.status}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">Uptime: {agent.uptime}</Badge>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted/30 p-2 text-center"><div className="text-xs font-mono font-bold">{agent.processed}</div><div className="text-[9px] text-muted-foreground">Processed</div></div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center"><div className="text-xs font-mono font-bold">{agent.signals}</div><div className="text-[9px] text-muted-foreground">Signals</div></div>
                    <div className="rounded-lg bg-muted/30 p-2 text-center"><div className="text-xs font-mono font-bold">{agent.accuracy}%</div><div className="text-[9px] text-muted-foreground">Accuracy</div></div>
                  </div>

                  <div>
                    <div className="mb-1 text-[10px] text-muted-foreground">Last Action</div>
                    <p className="rounded-lg bg-muted/30 p-2 text-xs font-mono">{agent.lastAction}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
