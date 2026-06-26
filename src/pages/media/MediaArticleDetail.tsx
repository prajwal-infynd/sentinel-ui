import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, ExternalLink, FileText, Globe, Shield, User, Building, AlertTriangle, Gavel, Swords, ShieldCheck, Bot } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { toast } from "@/components/ui/use-toast";
import { fetchMediaArticleDetail } from "@/lib/media-agent-data";

const severityColor = (severity: string) =>
  severity === "critical"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : severity === "high"
      ? "bg-warning/10 text-warning border-warning/20"
      : severity === "medium"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border";

export default function MediaArticleDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data: article } = useQuery({ queryKey: ["media-article", id], queryFn: () => fetchMediaArticleDetail(id), enabled: Boolean(id) });

  if (!article) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/media")} className="mb-3 -ml-2 text-muted-foreground"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Media Stream</Button>
          <div className="text-sm text-muted-foreground">Loading article intelligence…</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/media")} className="mb-3 -ml-2 text-muted-foreground"><ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Media Stream</Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-tight">{article.headline}</h1>
              <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{article.source}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{article.timestamp}</span>
                <span>·</span>
                <span>{article.language}</span>
                <span>·</span>
                <span>Credibility: <span className="font-mono font-bold">{article.credibilityScore}</span></span>
              </div>
            </div>
            <Badge className={`text-xs px-2 py-0.5 uppercase ${severityColor(article.severity)}`}>{article.severity}</Badge>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><FileText className="h-3.5 w-3.5 text-primary" />Article Content</CardTitle></CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                  {article.content.split(new RegExp(`(${article.entities.join("|")})`, "gi")).map((part, index) => {
                    const isEntity = article.entities.some((entity) => entity.toLowerCase() === part.toLowerCase());
                    return isEntity ? <mark key={index} className="rounded bg-primary/15 px-0.5 font-medium text-primary">{part}</mark> : <span key={index}>{part}</span>;
                  })}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast({ title: "Opening Source", description: "Navigating to original article source..." })}><ExternalLink className="h-3 w-3" /> View Source</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-semibold"><Shield className="h-3.5 w-3.5 text-accent" />AI Analysis</CardTitle></CardHeader>
              <CardContent>
                <Tabs defaultValue="debate" className="space-y-4">
                  <TabsList className="grid h-8 grid-cols-5">
                    <TabsTrigger value="debate" className="text-[10px] font-bold text-accent">Debate</TabsTrigger>
                    <TabsTrigger value="entities" className="text-[10px]">Entities</TabsTrigger>
                    <TabsTrigger value="risk" className="text-[10px]">Risk</TabsTrigger>
                    <TabsTrigger value="summary" className="text-[10px]">Summary</TabsTrigger>
                    <TabsTrigger value="trace" className="text-[10px]">Trace</TabsTrigger>
                  </TabsList>

                  <TabsContent value="debate" className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-6 border-b border-border/50">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight">Infyous Consensus Engine</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Live Adversarial Debate Analysis</p>
                    </div>
                    
                    <div className="relative max-h-[600px] overflow-y-auto px-2 pb-8 scrollbar-thin scrollbar-thumb-muted">
                      <div className="space-y-4 relative">
                        {article.debate?.filter(msg => msg.role !== "Judge").map((msg, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}
                            className={`w-full relative`}
                          >
                            <div className={`p-4 rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${msg.role === "Prosecution" ? "border-l-4 border-l-destructive border-t-border border-r-border border-b-border" : "border-l-4 border-l-success border-t-border border-r-border border-b-border"}`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${msg.role === "Prosecution" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                                    {msg.role === "Prosecution" ? <Swords className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                  </div>
                                  <div>
                                    <div className={`text-[11px] font-bold uppercase tracking-wider ${msg.role === "Prosecution" ? "text-destructive" : "text-success"}`}>{msg.role}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium">{msg.agent}</div>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap ml-2 pt-1">{msg.timestamp}</div>
                              </div>
                              <p className="text-xs leading-relaxed text-foreground/90 pl-1">{msg.message}</p>
                            </div>
                          </motion.div>
                        ))}

                        {/* Judge Verdict */}
                        {article.debate?.filter(msg => msg.role === "Judge").map((msg, i) => (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} key={`judge-${i}`} className="mt-8 flex justify-center w-full relative z-10">
                            <div className="w-full p-1 rounded-2xl bg-gradient-to-b from-primary/40 to-primary/5 shadow-lg">
                              <div className="bg-card rounded-xl p-5 text-center h-full border border-primary/20">
                                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                  <Gavel className="h-6 w-6 text-primary" />
                                </div>
                                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Final Consensus Ruling</h4>
                                <p className="text-xs leading-relaxed text-foreground">{msg.message}</p>
                                <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold ring-1 ring-primary/20">
                                  RISK SCORE: {article.riskScore}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="entities" className="space-y-3">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">Extracted Entities</div>
                    {article.entities.map((entity) => (
                      <div key={entity} className="flex items-center justify-between rounded-lg border p-2.5">
                        <div className="flex items-center gap-2">{entity.includes(" ") ? <User className="h-3.5 w-3.5 text-accent" /> : <Building className="h-3.5 w-3.5 text-primary" />}<span className="text-xs font-medium">{entity}</span></div>
                        {entity === article.matchedEntity && <Badge className="border-success/20 bg-success/10 text-[9px] text-success">Matched</Badge>}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="risk" className="space-y-3">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">Detected Risk Signals</div>
                    {article.riskTags.map((tag) => (
                      <div key={tag} className="flex items-center justify-between rounded-lg border p-2.5">
                        <div className="flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5 text-warning" /><span className="text-xs font-medium capitalize">{tag}</span></div>
                        <Badge variant="outline" className="text-[9px] font-mono">{article.severity}</Badge>
                      </div>
                    ))}
                    <div className="rounded-lg bg-muted/50 p-3 text-[11px] text-muted-foreground">Risk score <span className="font-mono font-bold text-foreground">{article.riskScore}</span> with <span className="font-mono font-bold text-foreground">{article.matchConfidence}%</span> match confidence.</div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-3">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">AI Summary</div>
                    <div className="rounded-lg border border-accent/10 bg-accent/5 p-3"><p className="text-xs leading-relaxed">{article.summary}</p></div>
                  </TabsContent>

                  <TabsContent value="trace" className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">Evidence & Traceability</div>
                    {article.trace.map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-0"><span className="text-[11px] text-muted-foreground">{item.label}</span><span className="text-[11px] font-mono">{item.value}</span></div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
