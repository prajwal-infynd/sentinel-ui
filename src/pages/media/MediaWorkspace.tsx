import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X, TrendingUp, MessageSquare, ChevronRight, Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DashboardLayout } from "@/components/DashboardLayout";
import { mediaArticles } from "@/lib/media-sample-data";

const severityBorder = (s: string) =>
  s === "critical" ? "border-l-destructive" : s === "high" ? "border-l-warning" : s === "medium" ? "border-l-primary" : "border-l-muted-foreground";

export default function MediaWorkspace() {
  const [selectedArticle, setSelectedArticle] = useState(mediaArticles[0]);
  const [note, setNote] = useState("");

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analyst Workspace</h1>
              <p className="text-sm text-muted-foreground mt-1">Review and action adverse media articles</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] gap-1"><Keyboard className="h-3 w-3" /> Shortcuts: A=Approve R=Reject E=Escalate</Badge>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-4" style={{ height: "calc(100vh - 180px)" }}>
          {/* Queue */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="col-span-3 overflow-y-auto">
            <Card className="h-full">
              <CardHeader className="pb-2 sticky top-0 bg-card z-10">
                <CardTitle className="text-sm font-semibold">Review Queue <span className="text-muted-foreground font-normal">({mediaArticles.length})</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 p-3">
                {mediaArticles.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.15 + i * 0.04 }}
                    className={`border-l-[3px] ${severityBorder(article.severity)} rounded-lg border p-2.5 cursor-pointer transition-all hover:bg-muted/30 active:scale-[0.98] ${
                      selectedArticle.id === article.id ? "bg-primary/5 border-primary/30" : ""
                    }`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <p className="text-[11px] font-medium leading-tight line-clamp-2">{article.headline}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] text-muted-foreground">{article.source}</span>
                      <span className="text-[9px] text-muted-foreground">·</span>
                      <span className="text-[9px] font-mono text-muted-foreground">{article.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Article + Highlights */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="col-span-6 overflow-y-auto">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{selectedArticle.headline}</CardTitle>
                  <Badge className={`text-[9px] uppercase ${
                    selectedArticle.severity === "critical" ? "bg-destructive/10 text-destructive" :
                    selectedArticle.severity === "high" ? "bg-warning/10 text-warning" :
                    "bg-primary/10 text-primary"
                  }`}>{selectedArticle.severity}</Badge>
                </div>
                <div className="text-[10px] text-muted-foreground">{selectedArticle.source} · {selectedArticle.timestamp} · Credibility: {selectedArticle.credibilityScore}</div>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed mb-4">
                  {selectedArticle.content.split(/(\b(?:John Doe|Al Noor Trading LLC|Ahmed Hassan|Eastern Capital Partners|Maria Petrov|Viktor Volkov|Banco del Sur SA|Carlos Mendez|Global Meridian Holdings)\b)/gi).map((part, i) => {
                    const isEntity = selectedArticle.entities.some(e => part.toLowerCase().includes(e.toLowerCase()));
                    return isEntity ? (
                      <mark key={i} className="bg-primary/15 text-primary font-medium px-0.5 rounded">{part}</mark>
                    ) : (
                      <span key={i}>{part}</span>
                    );
                  })}
                </div>

                <div className="rounded-lg bg-muted/50 p-3 mb-4">
                  <div className="text-[10px] font-semibold mb-1">AI Summary</div>
                  <p className="text-xs text-muted-foreground">{selectedArticle.summary}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selectedArticle.riskTags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[10px] capitalize">{tag}</Badge>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <div className="text-[9px] text-muted-foreground">Match</div>
                    <div className="text-xs font-mono font-bold">{selectedArticle.matchConfidence}%</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <div className="text-[9px] text-muted-foreground">Risk</div>
                    <div className="text-xs font-mono font-bold">{selectedArticle.riskScore}</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <div className="text-[9px] text-muted-foreground">Entity</div>
                    <div className="text-xs font-medium truncate">{selectedArticle.matchedEntity}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="col-span-3 overflow-y-auto">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full text-xs gap-1.5 bg-success hover:bg-success/90 text-success-foreground" size="sm">
                  <CheckCircle className="h-3.5 w-3.5" /> Confirm Risk
                </Button>
                <Button variant="outline" className="w-full text-xs gap-1.5" size="sm">
                  <X className="h-3.5 w-3.5" /> Reject / False Positive
                </Button>
                <Button variant="outline" className="w-full text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5" size="sm">
                  <TrendingUp className="h-3.5 w-3.5" /> Escalate
                </Button>

                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Notes</div>
                  <Textarea
                    placeholder="Add analyst notes..."
                    className="text-xs min-h-[80px] resize-none"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                  <Button size="sm" variant="outline" className="w-full mt-2 text-xs">Save Note</Button>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-xs font-semibold mb-2">Tags</div>
                  <div className="flex flex-wrap gap-1">
                    {["needs-review", "high-priority", "false-positive", "escalated", "SAR-consideration"].map(tag => (
                      <Badge key={tag} variant="outline" className="text-[9px] cursor-pointer hover:bg-primary/10">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
