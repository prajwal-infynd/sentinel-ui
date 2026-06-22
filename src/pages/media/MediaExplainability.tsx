import { motion } from "framer-motion";
import { Shield, CheckCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DashboardLayout } from "@/components/DashboardLayout";

const matchBreakdown = [
  { factor: "Name Similarity", score: 95, detail: "Exact match on primary name 'John Doe'" },
  { factor: "Location Match", score: 80, detail: "Jurisdiction overlap: United Kingdom" },
  { factor: "Context Match", score: 90, detail: "Article context matches known risk profile" },
  { factor: "Temporal Proximity", score: 75, detail: "Event within monitoring window" },
  { factor: "Entity Type", score: 100, detail: "Individual entity type confirmed" },
];

const signalBreakdown = [
  { signal: "Fraud", weight: 0.92, source: "NLP classifier detected fraud-related language patterns" },
  { signal: "Securities Violation", weight: 0.84, source: "SEC reference and enforcement terminology detected" },
  { signal: "Regulatory Investigation", weight: 0.78, source: "Investigation-related keywords with regulatory body mention" },
];

const severityFactors = [
  { factor: "Source Credibility", value: "98/100 (Reuters)", impact: "High" },
  { factor: "Risk Signal Strength", value: "0.92 (fraud)", impact: "High" },
  { factor: "Entity Match Confidence", value: "94%", impact: "High" },
  { factor: "Historical Pattern", value: "3 prior mentions", impact: "Medium" },
  { factor: "Jurisdiction Risk", value: "Medium (US)", impact: "Medium" },
];

export default function MediaExplainability() {
  const finalConfidence = 89;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight">AI Explainability</h1>
          <p className="text-sm text-muted-foreground mt-1">Full transparency into how the AI reached its conclusions</p>
        </motion.div>

        {/* Final Confidence */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Overall Match Confidence</p>
                    <p className="text-[10px] text-muted-foreground">Entity: John Doe · Article: SEC fraud investigation</p>
                  </div>
                </div>
                <div className="text-3xl font-bold font-mono text-primary">{finalConfidence}%</div>
              </div>
              <Progress value={finalConfidence} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Match Confidence Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Match Confidence Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchBreakdown.map((item, i) => (
                  <motion.div
                    key={item.factor}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{item.factor}</span>
                      <span className="text-xs font-mono font-bold">{item.score}%</span>
                    </div>
                    <Progress value={item.score} className="h-1.5 mb-1" />
                    <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Signal Detection */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Signal Detection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {signalBreakdown.map((signal, i) => (
                  <motion.div
                    key={signal.signal}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.25 + i * 0.05 }}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{signal.signal}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">weight: {signal.weight}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{signal.source}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Severity Calculation */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-primary" />
                Severity Calculation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Factor</th>
                      <th className="text-left p-2.5 text-xs font-medium text-muted-foreground">Value</th>
                      <th className="text-center p-2.5 text-xs font-medium text-muted-foreground">Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {severityFactors.map(f => (
                      <tr key={f.factor} className="border-b last:border-0">
                        <td className="p-2.5 text-xs">{f.factor}</td>
                        <td className="p-2.5 text-xs font-mono">{f.value}</td>
                        <td className="p-2.5 text-center">
                          <Badge className={`text-[9px] ${f.impact === "High" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                            {f.impact}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg bg-accent/5 border border-accent/10 p-3 mt-4">
                <p className="text-xs leading-relaxed">
                  <strong>Final Assessment:</strong> Based on the weighted combination of all factors, this alert is classified as
                  <span className="font-bold text-destructive"> HIGH severity</span> with an overall risk score of
                  <span className="font-mono font-bold"> 87</span>. The primary drivers are source credibility and risk signal strength.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
