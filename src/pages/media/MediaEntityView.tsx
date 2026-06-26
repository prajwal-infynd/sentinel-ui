import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Newspaper, AlertTriangle, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { entityMediaTimeline, mediaArticles } from "../../lib/mock-api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const riskEvolution = [
  { month: "Oct", risk: 22 }, { month: "Nov", risk: 28 }, { month: "Dec", risk: 35 },
  { month: "Jan", risk: 42 }, { month: "Feb", risk: 61 }, { month: "Mar", risk: 87 },
];

const severityColor = (s: string) =>
  s === "critical" ? "border-l-destructive bg-destructive/5" :
  s === "high" ? "border-l-warning bg-warning/5" :
  s === "medium" ? "border-l-primary bg-primary/5" :
  "border-l-muted-foreground bg-muted/30";

export default function MediaEntityView() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/media")} className="mb-3 -ml-2 text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Entity Media Intelligence — John Doe</h1>
          <p className="text-sm text-muted-foreground mt-1">All adverse media signals linked to this entity</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Media Hits", value: "24", icon: Newspaper, color: "text-primary" },
            { label: "High-Risk Hits", value: "8", icon: AlertTriangle, color: "text-destructive" },
            { label: "Last Detected", value: "2 min ago", icon: Clock, color: "text-warning" },
            { label: "Risk Trend", value: "Increasing", icon: TrendingUp, color: "text-destructive" },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4">
                  <card.icon className={`h-4 w-4 ${card.color} mb-2`} />
                  <div className="text-xl font-bold font-mono">{card.value}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{card.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Evolution */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Risk Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={riskEvolution}>
                      <defs>
                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="risk" stroke="hsl(0 72% 51%)" fill="url(#riskGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Media Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entityMediaTimeline.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.25 + i * 0.05 }}
                      className={`border-l-[3px] ${severityColor(event.severity)} rounded-lg border p-3`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">{event.event}</p>
                        <Badge variant="outline" className="text-[9px] uppercase">{event.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>{event.source}</span>
                        <span>·</span>
                        <span className="font-mono">{event.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Related Articles */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Related Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mediaArticles.filter(a => a.entities.includes("John Doe")).map(article => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:shadow-sm cursor-pointer transition-all hover:bg-muted/20"
                    onClick={() => navigate(`/media/article/${article.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{article.headline}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>{article.source}</span><span>·</span><span>{article.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {article.riskTags.map(t => <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}


