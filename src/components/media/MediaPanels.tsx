import { CheckCircle, Loader2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MediaActivityItem, MediaFeedItem } from "@/lib/media-agent-data";

const severityColor = (severity: string) =>
  severity === "critical"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : severity === "high"
      ? "bg-warning/10 text-warning border-warning/20"
      : severity === "medium"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border";

const severityBorder = (severity: string) =>
  severity === "critical"
    ? "border-l-destructive"
    : severity === "high"
      ? "border-l-warning"
      : severity === "medium"
        ? "border-l-primary"
        : "border-l-muted-foreground";

export function MediaPanels({ articles, activities }: { articles: MediaFeedItem[]; activities: MediaActivityItem[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-indigo-500/20 hover:shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-bold tracking-tight">Live Media Stream</h3>
            <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 border border-success/20">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-success">Real-time</span>
            </div>
          </div>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className={`group cursor-pointer rounded-xl border border-l-4 bg-gradient-to-br from-card to-muted/10 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${severityBorder(article.severity)}`}
                onClick={() => navigate(`/media/article/${article.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight group-hover:text-indigo-600 transition-colors">{article.headline}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{article.source}</span>
                      <span className="text-[10px] text-muted-foreground/40">•</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{article.timestamp}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge className={`h-5 px-2 py-0 text-[9px] font-bold uppercase tracking-wider ${severityColor(article.severity)}`}>{article.severity}</Badge>
                      {article.riskTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="h-5 px-2 py-0 text-[9px] font-bold uppercase tracking-wider bg-white">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right bg-muted/30 p-2 rounded-lg border">
                    <div className="text-sm font-black font-mono">{article.riskScore}</div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">risk</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-white w-fit px-2 py-1 rounded-md border">
                  <span className="font-bold uppercase tracking-wider text-muted-foreground">Entities:</span>
                  {article.entities.slice(0, 2).map((entity) => (
                    <span key={entity} className="font-bold text-indigo-600">{entity}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-indigo-500/20 hover:shadow-md h-full">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold tracking-tight">
              <Zap className="h-4 w-4 text-indigo-500" />
              Agent Activity Log
            </h3>
            <span className="text-[10px] font-mono font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Media Agent v1</span>
          </div>
          <div className="space-y-2 font-mono text-[11px]">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 rounded-xl border border-transparent p-2 transition-colors hover:bg-muted/50 hover:border-border/50">
                {activity.status === "active" ? (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
                    <Loader2 className="h-3 w-3 animate-spin" />
                  </div>
                ) : (
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success ring-1 ring-success/20">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                )}
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={`text-[11px] font-bold leading-tight ${activity.status === "active" ? "text-foreground" : "text-muted-foreground"}`}>
                    {activity.action}
                  </p>
                  <p className="mt-1 text-[9.5px] font-medium text-muted-foreground/80 leading-relaxed">{activity.detail}</p>
                </div>
                <span className="shrink-0 text-[9px] font-bold text-muted-foreground pt-0.5">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
