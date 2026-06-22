import type { LucideIcon } from "lucide-react";
import { Activity, AlertTriangle, Newspaper, Target, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaDashboardSummary } from "@/lib/media-agent-data";

type KpiItem = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  color: string;
};

export function MediaKpiGrid({ summary }: { summary?: MediaDashboardSummary }) {
  const kpis: KpiItem[] = [
    { label: "Articles Ingested (24h)", value: String(summary?.articlesProcessed ?? 0), delta: "live", icon: Newspaper, color: "text-primary" },
    { label: "Risk Signals Detected", value: String(summary?.riskSignals ?? 0), delta: "scored", icon: Target, color: "text-destructive" },
    { label: "High-Risk Alerts", value: String(summary?.highRiskAlerts ?? 0), delta: "escalated", icon: AlertTriangle, color: "text-warning" },
    { label: "Entities Impacted", value: String(summary?.entitiesImpacted ?? 0), delta: "matched", icon: Users, color: "text-accent" },
    { label: "False Positive Rate", value: `${summary?.falsePositiveRate ?? 0}%`, delta: "resolved", icon: TrendingUp, color: "text-success" },
    { label: "Avg Confidence", value: `${summary?.avgConfidence ?? 0}%`, delta: "agent output", icon: Activity, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl border bg-card shadow-sm group-hover:scale-110 transition-all duration-300 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">{kpi.delta}</span>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tighter mb-1">{kpi.value}</div>
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-tight">{kpi.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
