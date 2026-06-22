import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { pipelineStages } from "@/lib/media-sample-data";

export default function MediaPipeline() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold tracking-tight">Article Processing Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Transparent view of how AI processes adverse media data</p>
        </motion.div>

        {/* Pipeline Flow */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Processing Pipeline</CardTitle>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowTechnical(!showTechnical)}>
                  {showTechnical ? "Hide" : "Show"} Technical Detail
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Horizontal Flow */}
              <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-6">
                {pipelineStages.map((stage, i) => (
                  <div key={stage.name} className="flex items-center shrink-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.15 + i * 0.08 }}
                      className={`rounded-lg border px-3 py-2 cursor-pointer transition-all hover:shadow-md active:scale-[0.97] ${
                        stage.status === "active" ? "border-accent/40 bg-accent/5" : "border-success/20 bg-success/5"
                      } ${expandedStage === i ? "ring-2 ring-primary/30" : ""}`}
                      onClick={() => setExpandedStage(expandedStage === i ? null : i)}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {stage.status === "active" ? (
                          <Loader2 className="h-3 w-3 text-accent animate-spin" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                        <span className="text-[10px] font-semibold whitespace-nowrap">{stage.name}</span>
                      </div>
                      <div className="text-[9px] text-muted-foreground font-mono">{stage.confidence}% conf.</div>
                    </motion.div>
                    {i < pipelineStages.length - 1 && (
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 mx-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Stage Cards */}
              <div className="space-y-3">
                {pipelineStages.map((stage, i) => (
                  <motion.div
                    key={stage.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                  >
                    <div
                      className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm ${
                        expandedStage === i ? "border-primary/30 shadow-md" : ""
                      }`}
                      onClick={() => setExpandedStage(expandedStage === i ? null : i)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                            stage.status === "active" ? "bg-accent/10 text-accent" : "bg-success/10 text-success"
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{stage.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Confidence: <span className="font-mono font-bold">{stage.confidence}%</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {stage.status === "active" ? (
                            <Badge className="bg-accent/10 text-accent border-accent/20 text-[9px]">Processing</Badge>
                          ) : (
                            <Badge className="bg-success/10 text-success border-success/20 text-[9px]">Complete</Badge>
                          )}
                          {expandedStage === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>

                      {expandedStage === i && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3">
                              <div className="text-[10px] font-semibold text-muted-foreground mb-1">INPUT</div>
                              <p className="text-xs">{stage.input}</p>
                            </div>
                            <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
                              <div className="text-[10px] font-semibold text-primary mb-1">OUTPUT</div>
                              <p className="text-xs">{stage.output}</p>
                            </div>
                          </div>
                          {showTechnical && (
                            <div className="rounded-lg bg-navy/5 border border-navy/10 p-3 space-y-1.5">
                              <div className="text-[10px] font-semibold text-muted-foreground">TECHNICAL DETAIL</div>
                              <div className="grid grid-cols-3 gap-2 text-[11px]">
                                <div><span className="text-muted-foreground">Model:</span> <span className="font-mono text-[10px]">{stage.model}</span></div>
                                <div><span className="text-muted-foreground">Processing:</span> <span className="font-mono">{stage.processingTime}</span></div>
                                <div><span className="text-muted-foreground">Confidence:</span> <span className="font-mono font-bold">{stage.confidence}%</span></div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
