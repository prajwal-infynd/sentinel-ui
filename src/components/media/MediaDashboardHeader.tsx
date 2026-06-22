import { Activity, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaDashboardSummary } from "@/lib/media-agent-data";

type MediaDashboardHeaderProps = {
  summary?: MediaDashboardSummary;
  onRun: () => void;
  isRunning: boolean;
};

export function MediaDashboardHeader({ summary, onRun, isRunning }: MediaDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between pb-2">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Adverse Media Engine</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/15 px-2 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-success">
                {summary?.activeAgents ? `${summary.activeAgents} Swarm Active` : "Standby"}
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Autonomous pipeline for ingestion & scoring</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border shadow-sm">
        <div className="px-3 py-1 flex flex-col items-end border-r pr-4">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sources</span>
          <span className="font-mono text-sm font-bold text-foreground">{summary?.sourcesScanned ?? 0}</span>
        </div>
        <div className="px-1 flex flex-col items-end pr-3">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Processed</span>
          <span className="font-mono text-sm font-bold text-foreground">{summary?.articlesProcessed ?? 0}</span>
        </div>
        <Button onClick={onRun} disabled={isRunning} className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 h-10 px-6">
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Force Scan
        </Button>
      </div>
    </div>
  );
}
