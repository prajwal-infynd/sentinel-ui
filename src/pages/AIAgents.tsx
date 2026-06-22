import { motion } from "framer-motion";
import { Bot, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { fetchAgentOverview } from "@/lib/media-agent-data";

const pipelineSteps = ["Sources", "Extraction", "Matching", "Scoring", "Policy Rules", "Alert", "Case Generation"];

const AIAgents = () => {
  const { data: agents = [] } = useQuery({ queryKey: ["agent-overview"], queryFn: fetchAgentOverview, refetchInterval: 10000 });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">AI Agent Orchestration</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Live run history, throughput, and confidence across the monitoring agent chain</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
            <h3 className="mb-6 text-base font-bold tracking-tight">Orchestration Pipeline</h3>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {pipelineSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black shadow-sm transition-transform hover:scale-110 ${index < 4 ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20" : "bg-success/10 text-success border border-success/20"}`}>
                      {index + 1}
                    </div>
                    <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{step}</span>
                  </div>
                  {index < pipelineSteps.length - 1 && <div className="h-px w-10 flex-shrink-0 bg-border/80" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => (
            <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.08 }} className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-bold tracking-tight">{agent.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${agent.status === "running" ? "bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : agent.status === "completed" ? "bg-indigo-500" : "bg-muted-foreground"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white border border-border/50 p-3 shadow-sm">
                    <div className="text-2xl font-black font-mono tracking-tighter text-indigo-600">{agent.processed.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Items processed</div>
                  </div>
                  <div className="rounded-xl bg-white border border-border/50 p-3 shadow-sm">
                    <div className="text-2xl font-black font-mono tracking-tighter text-indigo-600">{agent.signals.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Signals generated</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground truncate bg-muted/30 px-3 py-1.5 rounded-md border"><Clock className="mr-1.5 inline h-3.5 w-3.5 text-indigo-500" />{agent.lastAction}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1"><CheckCircle2 className="h-4 w-4 text-success" />Uptime {agent.uptime}</div>
                  <div className="flex items-center gap-3 pt-2">
                    <Progress value={agent.accuracy} className="h-2 flex-1" indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <span className="text-xs font-black font-mono text-indigo-600">{agent.accuracy}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAgents;
