import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, Clock, Play, Pause, Database, FileSearch, Network, Activity, ShieldCheck, Bell, FileSignature, Sparkles, Settings as SettingsIcon, Shield, Webhook, ChevronDown, Cpu, Globe, FileText, Search, RefreshCw, Copy, TerminalSquare, SlidersHorizontal, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { fetchAgentOverview } from "@/lib/media-agent-data";

const pipelineSteps = [
  { name: "Sources", icon: Database },
  { name: "Extraction", icon: FileSearch },
  { name: "Matching", icon: Network },
  { name: "Scoring", icon: Activity },
  { name: "Policy Rules", icon: ShieldCheck },
  { name: "Alert", icon: Bell },
  { name: "Case Generation", icon: FileSignature }
];

const getAgentConfig = (name: string) => {
  switch (name) {
    case "News Crawler": return { icon: Globe, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", hover: "group-hover:bg-blue-100" };
    case "NLP Extractor": return { icon: FileText, color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-100", hover: "group-hover:bg-fuchsia-100" };
    case "Entity Matcher": return { icon: Network, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", hover: "group-hover:bg-emerald-100" };
    case "Risk Scorer": return { icon: Activity, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", hover: "group-hover:bg-rose-100" };
    case "Policy Engine": return { icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", hover: "group-hover:bg-amber-100" };
    case "Alert Generator": return { icon: Bell, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", hover: "group-hover:bg-indigo-100" };
    default: return { icon: Bot, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100", hover: "group-hover:bg-slate-100" };
  }
};

const AIAgents = () => {
  const { data: agents = [] } = useQuery({ queryKey: ["agent-overview"], queryFn: fetchAgentOverview, refetchInterval: 10000 });
  const [pausedAgents, setPausedAgents] = useState<Set<string>>(new Set());
  const [editingAgent, setEditingAgent] = useState<string | null>(null);

  const togglePause = (agentName: string) => {
    setPausedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentName)) next.delete(agentName);
      else next.add(agentName);
      return next;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">AI Agent Orchestration</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Live run history, throughput, and confidence across the monitoring agent chain</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
          <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden">
            <h3 className="mb-6 text-base font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Live Orchestration Pipeline
            </h3>
            
            <div className="relative flex justify-between items-start w-full max-w-5xl mx-auto pb-4 pt-2">
              <div className="absolute top-8 left-8 right-8 h-0.5 bg-border/80 z-0" />
              
              {pipelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index < 4; // Mocking active state
                return (
                  <div key={step.name} className="flex flex-col items-center gap-3 z-10">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all shadow-sm ${
                        isActive 
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                          : "bg-white text-muted-foreground border border-border/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-indigo-900" : "text-muted-foreground"}`}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => {
            const isPaused = pausedAgents.has(agent.name);
            const displayStatus = isPaused ? "paused" : agent.status;
            const config = getAgentConfig(agent.name);
            const AgentIcon = config.icon;
            
            return (
            <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + index * 0.08 }} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br from-${config.color.split('-')[1]}-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none`} />
              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.color} border ${config.border} shadow-sm ${config.hover} transition-colors duration-300`}>
                      <AgentIcon className="h-5 w-5 relative z-10" />
                    </div>
                    <div>
                      <div className="text-base font-bold tracking-tight text-slate-900">{agent.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${displayStatus === "running" ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : displayStatus === "paused" ? "bg-amber-500" : displayStatus === "completed" ? "bg-indigo-500" : "bg-slate-400"}`} />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{displayStatus}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors" onClick={() => setEditingAgent(agent.name)}>
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 rounded-full transition-colors" onClick={() => togglePause(agent.name)}>
                      {isPaused ? <Play className="h-4 w-4" fill="currentColor" /> : <Pause className="h-4 w-4" fill="currentColor" />}
                    </Button>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 shadow-sm">
                    <div className="text-2xl font-black font-mono tracking-tighter text-slate-800">{agent.processed.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Items Processed</div>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 shadow-sm">
                    <div className="text-2xl font-black font-mono tracking-tighter text-slate-800">{agent.signals.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Signals Found</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`text-[11px] font-medium ${config.color} truncate ${config.bg} px-3 py-2 rounded-lg border ${config.border} flex items-center shadow-sm`}><Clock className="mr-2 h-3.5 w-3.5 opacity-80" />{agent.lastAction}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Uptime {agent.uptime}</div>
                  <div className="flex items-center gap-3 pt-2">
                    <Progress value={agent.accuracy} className="h-2 flex-1 bg-slate-100" indicatorClassName={`bg-${config.color.split('-')[1]}-500`} />
                    <span className={`text-xs font-black font-mono ${config.color}`}>{agent.accuracy}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent className="max-w-5xl bg-white/95 backdrop-blur-md shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-0 overflow-hidden border-slate-200">
          <DialogHeader className="p-6 pb-0 border-b border-slate-100 bg-white">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Edit Root Agent: {editingAgent}</DialogTitle>
            <DialogDescription className="mt-1">Define your agent's identity, privacy boundaries, and core LLM engine.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="config" className="w-full">
            <div className="px-6 pt-4 bg-white border-b border-slate-100">
              <TabsList className="bg-transparent space-x-2 p-0 h-auto">
                <TabsTrigger value="config" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-indigo-100 rounded-lg py-2 px-4 transition-all">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Profile & Model
                </TabsTrigger>
                <TabsTrigger value="logs" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 data-[state=active]:shadow-none border border-transparent data-[state=active]:border-indigo-100 rounded-lg py-2 px-4 transition-all">
                  <TerminalSquare className="h-4 w-4 mr-2" />
                  AI Logs
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="config" className="m-0">
              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Agent Profile Section */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
                      <Bot className="h-5 w-5 text-indigo-600" /> Agent Profile
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Define the core identity and objective of your outreach agent.</p>
                    
                    <div className="space-y-5">
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Agent Name</Label>
                        <Input defaultValue={editingAgent || ""} className="font-semibold bg-white border-slate-200 focus-visible:ring-indigo-500 shadow-sm h-11" />
                      </div>
                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">Description & System Prompt</Label>
                        <Textarea 
                          defaultValue="Researches leads and drafts personalized sales emails for buildicy.com. Identifies target companies, finds key decision-makers, and creates tailored outreach messages based on company research, recent news, and industry trends." 
                          className="min-h-[140px] resize-y bg-white border-slate-200 focus-visible:ring-indigo-500 text-sm shadow-sm leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Language Model Settings Section */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
                      <Cpu className="h-5 w-5 text-indigo-600" /> Language Model Settings
                    </h3>
                    <p className="text-sm text-slate-500 mb-6">Configure the underlying LLM powering this agent's reasoning.</p>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-50 bg-indigo-50/30">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-600" />
                            <h4 className="text-sm font-bold text-indigo-950">PII Protection</h4>
                          </div>
                          <p className="text-[11px] text-indigo-900/70 leading-relaxed pr-6">
                            Sensitive values are swapped for typed placeholders like <Badge variant="outline" className="font-mono text-[9px] bg-white text-indigo-600 border-indigo-200 px-1 py-0">&lt;EMAIL_ADDRESS_1&gt;</Badge> before reaching the AI.
                          </p>
                        </div>
                        <Switch defaultChecked={false} className="data-[state=checked]:bg-indigo-600" />
                      </div>

                      <div>
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <Webhook className="h-3.5 w-3.5" /> Model Provider (OpenAdapter)
                        </Label>
                        <div className="relative group">
                          <select className="appearance-none flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors group-hover:border-indigo-200 cursor-pointer">
                            <option value="0g">0G-Qwen3.7-max</option>
                            <option value="gpt4o">GPT-4o (OpenAI)</option>
                            <option value="claude">Claude 3.5 Sonnet (Anthropic)</option>
                            <option value="llama3">Llama-3-70B (Meta)</option>
                            <option value="mistral">Mistral-Large (Mistral AI)</option>
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PIL Enablement Section */}
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-1">
                    <Sparkles className="h-5 w-5 text-indigo-600" /> PIL Enablement (Powered by 27x.ai)
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">Configure Policy-In-Loop (PIL) self-improvement models and agent telemetry.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <Label className="text-sm font-bold text-slate-800">27x.ai Model Self-Improvement</Label>
                        <p className="text-xs text-slate-500 leading-relaxed">Allow the model to learn from human-in-the-loop resolutions and overrides automatically.</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-indigo-600 mt-1" />
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 pr-6">
                        <Label className="text-sm font-bold text-slate-800">Agent Telemetry & AI Logs</Label>
                        <p className="text-xs text-slate-500 leading-relaxed">Send detailed thought-process logs for external auditing and compliance checks.</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-indigo-600 mt-1" />
                    </div>

                    <div className="md:col-span-2 max-w-xl">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">27x.ai Endpoint Configuration</Label>
                      <Input defaultValue="https://api.27x.ai/v1/models/pil-tune" className="bg-white border-slate-200 shadow-sm h-11 text-slate-600 font-mono text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="m-0">
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search logs by model, query, status..." className="pl-9 bg-white border-slate-200 shadow-sm" />
                  </div>
                  <Button variant="outline" className="bg-white border-slate-200 shadow-sm gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh Logs
                  </Button>
                </div>

                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 flex flex-row items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-indigo-600">
                        <Cpu className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900">{editingAgent}</h3>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px]">Success</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-500">
                          <span>openadapter/0G-Qwen3.7-max</span>
                          <span className="text-slate-300">•</span>
                          <span>Latency: 9.72s</span>
                          <span className="text-slate-300">•</span>
                          <span>{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-700 mb-1">2950 Tokens</div>
                      <Progress value={75} className="h-1.5 w-24 bg-slate-100" indicatorClassName="bg-indigo-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div className="p-6 bg-slate-50/30">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-4">
                          <MessageSquare className="h-4 w-4" /> User Prompt
                        </Label>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 shadow-sm font-mono min-h-[200px]">
                          ho who are u
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                            <Bot className="h-4 w-4" /> Model Response
                          </Label>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-slate-400 hover:text-slate-900" onClick={() => toast({ title: "Copied", description: "Response copied to clipboard." })}>
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 text-sm text-slate-800 shadow-sm min-h-[200px] leading-relaxed">
                          <p className="mb-4">Hey there! 👋</p>
                          <p className="mb-4">I'm your <strong>Sales Researcher & Email Writer</strong> for <strong>buildicy.com</strong>. Here's what I can do for you:</p>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                              <Search className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                              <span><strong>Lead Research</strong> - Give me a company name or industry, and I'll dig up key details: size, recent news, decision-makers, pain points, and more.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <FileSignature className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
                              <span><strong>Personalized Email Drafts</strong> - I'll craft short, high-converting sales emails (under 150 words) tailored to each lead, with compelling subject lines and clear CTAs.</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingAgent(null)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setEditingAgent(null); toast({ title: "Changes Saved", description: "Agent configuration updated successfully." }); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AIAgents;
