import { motion } from "framer-motion";
import { TrendingUp, Globe, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { riskCategories, mediaSignalsOverTime } from "../../lib/mock-api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const geoData = [
  { country: "United States", mentions: 87, risk: "medium" },
  { country: "United Kingdom", mentions: 64, risk: "high" },
  { country: "UAE", mentions: 52, risk: "critical" },
  { country: "Russia", mentions: 41, risk: "critical" },
  { country: "Singapore", mentions: 38, risk: "medium" },
  { country: "Argentina", mentions: 29, risk: "high" },
  { country: "Hong Kong", mentions: 24, risk: "medium" },
  { country: "Germany", mentions: 18, risk: "low" },
];

const trendingRisks = [
  { topic: "Sanctions evasion via crypto", trend: "+340%", severity: "critical" as const },
  { topic: "Shell company fraud in Gulf states", trend: "+180%", severity: "high" as const },
  { topic: "PEP networks in Eastern Europe", trend: "+120%", severity: "high" as const },
  { topic: "Trade-based money laundering", trend: "+85%", severity: "medium" as const },
  { topic: "Ransomware-linked entities", trend: "+67%", severity: "medium" as const },
];

const networkNodes = [
  { entity: "John Doe", connections: ["Al Noor Trading LLC", "Meridian Capital"], risk: 87 },
  { entity: "Al Noor Trading LLC", connections: ["Ahmed Hassan", "John Doe"], risk: 92 },
  { entity: "Maria Petrov", connections: ["Eastern Capital Partners", "Viktor Volkov"], risk: 78 },
  { entity: "Eastern Capital Partners", connections: ["Maria Petrov", "Global Meridian Holdings"], risk: 64 },
];

const riskColor = (s: string) =>
  s === "critical" ? "text-destructive" : s === "high" ? "text-warning" : s === "medium" ? "text-primary" : "text-muted-foreground";

export default function MediaSignals() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight">Risk Signal Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">Patterns, trends, and clusters across all adverse media signals</p>
        </motion.div>

        {/* Top Risk Topics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {riskCategories.map((cat, i) => (
              <Card key={cat.category} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="h-3.5 w-3.5" style={{ color: cat.color }} />
                    <span className={`text-[10px] font-mono ${cat.trend.startsWith("+") ? "text-destructive" : "text-success"}`}>{cat.trend}</span>
                  </div>
                  <div className="text-lg font-bold font-mono">{cat.count}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{cat.category}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trending Risks */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-destructive" />
                  Trending Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingRisks.map((risk, i) => (
                  <motion.div
                    key={risk.topic}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        risk.severity === "critical" ? "bg-destructive" :
                        risk.severity === "high" ? "bg-warning" : "bg-primary"
                      }`} />
                      <span className="text-xs">{risk.topic}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-destructive">{risk.trend}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Geographic Heatmap (as table) */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Geographic Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {geoData.map((geo, i) => (
                    <div key={geo.country} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-28 shrink-0">{geo.country}</span>
                      <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            geo.risk === "critical" ? "bg-destructive/60" :
                            geo.risk === "high" ? "bg-warning/60" : "bg-primary/40"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(geo.mentions / 87) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.25 + i * 0.04 }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">{geo.mentions}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Network Graph (simplified as connections) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-accent" />
                Entity Co-mention Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {networkNodes.map(node => (
                  <div key={node.entity} className="rounded-xl border p-3 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">{node.entity}</span>
                      <span className="text-xs font-mono font-bold">{node.risk}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mb-1.5">Co-mentioned with:</div>
                    <div className="flex flex-wrap gap-1">
                      {node.connections.map(c => (
                        <Badge key={c} variant="outline" className="text-[9px] px-1.5 py-0 h-4">{c}</Badge>
                      ))}
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


