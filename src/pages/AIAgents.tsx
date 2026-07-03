import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, CheckCircle2, Clock, Play, Pause, Database, FileSearch, Network, Activity, ShieldCheck, Bell, FileSignature, Sparkles, Settings as SettingsIcon, Shield, Webhook, ChevronDown, Cpu, Globe, FileText, Search, RefreshCw, Copy, TerminalSquare, SlidersHorizontal, MessageSquare, User, Zap, Wrench, Plus } from "lucide-react";
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
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

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
      <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-800">
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">AI Agent Orchestration</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Live run history, throughput, and confidence across the monitoring agent chain</p>
            </div>
          </div>
          <div>
            <Button onClick={() => setIsCreatingAgent(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Sparkles className="h-4 w-4" /> Build Custom Agent
            </Button>
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
                    <div className="text-2xl font-black font-mono tracking-tighter text-slate-800">{(agent.processed || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Items Processed</div>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 shadow-sm">
                    <div className="text-2xl font-black font-mono tracking-tighter text-slate-800">{(agent.signals || 0).toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">Signals Found</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`text-[11px] font-medium ${config.color} truncate ${config.bg} px-3 py-2 rounded-lg border ${config.border} flex items-center shadow-sm`}><Clock className="mr-2 h-3.5 w-3.5 opacity-80" />{agent.lastAction || "Unknown"}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" />Uptime {agent.uptime || "N/A"}</div>
                  <div className="flex items-center gap-3 pt-2">
                    <Progress value={agent.accuracy || 0} className="h-2 flex-1 bg-slate-100" />
                    <span className={`text-xs font-black font-mono ${config.color}`}>{agent.accuracy || 0}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={!!editingAgent} onOpenChange={(open) => !open && setEditingAgent(null)}>
        <DialogContent aria-describedby={undefined} className="max-w-6xl bg-[#FAFAFA] shadow-2xl p-0 overflow-hidden border-slate-200 h-[85vh] flex flex-col">
          
          <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-6 bg-white border-b border-slate-100 flex-shrink-0 flex justify-center">
              <TabsList className="bg-slate-50 p-1.5 rounded-full flex gap-1 mb-4 border border-slate-200">
                <TabsTrigger value="profile" className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <User className="w-4 h-4" /> Profile & Model
                </TabsTrigger>
                <TabsTrigger value="instructions" className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Instructions
                </TabsTrigger>
                <TabsTrigger value="tools" className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Tools & Integrations
                </TabsTrigger>
                <TabsTrigger value="capabilities" className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <Database className="w-4 h-4" /> Capabilities
                </TabsTrigger>
                <TabsTrigger value="workflow" className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Workflow & Triggers
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8">
              <TabsContent value="profile" className="m-0 max-w-4xl mx-auto space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Profile & Model</h2>
                  <p className="text-slate-500 mt-2">Define your agent's identity, privacy boundaries, and core LLM engine.</p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                    <User className="h-5 w-5 text-indigo-500" /> Agent Identity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Agent Name</Label>
                      <Input defaultValue={editingAgent || "Company Intelligence Analyst"} className="h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</Label>
                      <Input defaultValue="Comprehensive company analysis agent that researches and..." className="h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                    <Cpu className="h-5 w-5 text-indigo-500" /> Model Configuration
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start justify-between p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-slate-700" />
                          <h4 className="font-bold text-slate-900">PII Protection</h4>
                          <Badge variant="outline" className="bg-slate-200 text-slate-600 border-transparent text-[10px]">Off</Badge>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                          Sensitive values are swapped for typed placeholders like <code className="bg-slate-200 px-1 py-0.5 rounded text-indigo-600 font-mono">&lt;EMAIL_ADDRESS_1&gt;</code> before reaching the AI.
                        </p>
                      </div>
                      <Switch defaultChecked={false} className="data-[state=checked]:bg-indigo-600" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select LLM Engine</Label>
                      <div className="relative group max-w-md">
                        <select className="appearance-none flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer">
                          <option>Amazon Bedrock GLM 5</option>
                          <option>OpenAI GPT-4o</option>
                          <option>Anthropic Claude 3.5 Sonnet</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                      <Label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> Generative UI</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="m-0 max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Instructions</h2>
                    <p className="text-slate-500 mt-2">Shape your agent's persona, goals, and core system prompt.</p>
                  </div>
                  <Button variant="outline" className="gap-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
                    <Sparkles className="w-4 h-4" /> Optimize Prompt
                  </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Agent Role (Persona)</Label>
                    <Textarea defaultValue="You are a senior business intelligence analyst specializing in comprehensive company research and analysis." className="min-h-[80px] bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 resize-y" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Agent Goal</Label>
                    <Textarea defaultValue="Conduct thorough company analysis by gathering data from multiple sources (web, financial databases, news) and synthesize findings into a structured, actionable intelligence report." className="min-h-[100px] bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 resize-y" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">System Instructions</Label>
                    <Textarea defaultValue="When analyzing a company, follow this efficient, systematic approach:&#10;&#10;## Efficiency Rules (CRITICAL)&#10;- **Tool call budget**: Limit to 6-8 tool calls for a standard company analysis. Only exceed this for complex multi-company comparisons.&#10;- **No redundant searches**: If a search returns useful results, do NOT run similar searches with slightly different wording.&#10;- **Cache your findings**: Do not re-fetch or re-search for information you already obtained earlier in this session.&#10;- **Skip bot-protected sites**: Trustpilot, G2, and similar review sites often block automated scraping. Rely on search snippets for these instead of direct scraping.&#10;- **Prioritize authoritative sources**: Check these sources first (in order): company website, LinkedIn, getlatka.com, Crunchbase." className="min-h-[250px] bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 font-mono text-sm leading-relaxed" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-64">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">Examples (Few-Shot)</Label>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 overflow-y-auto">
                      <div className="space-y-4 text-sm">
                        <div>
                          <span className="font-bold text-slate-700">User:</span> Analyze Stripe
                        </div>
                        <div>
                          <span className="font-bold text-slate-700">Agent:</span> I'll conduct a comprehensive analysis of Stripe using targeted research.
                          <br /><br />
                          <span className="text-slate-500 italic">[Uses web search for "Stripe company overview"]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-64">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Structured Output</Label>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"><Plus className="w-3 h-3"/> Add Schema</Button>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 mb-3" />
                      <h4 className="font-bold text-slate-700">No JSON Schema</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Agent will return free-form markdown text.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tools" className="m-0 max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-8 text-center md:text-left md:flex-row flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Tools & Integrations</h2>
                    <p className="text-slate-500 mt-2">Equip your agent with MCP tools and external platform APIs.</p>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Add Tool
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tool 1 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">ai-studio-utils</h3>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">4 active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">mcp search</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">mcp search mcp</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">scrape workflow</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">scrape extract</Badge>
                    </div>
                  </div>

                  {/* Tool 2 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">yahoo_finance</h3>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">3 active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">yfinance get ticker info</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">yfinance get ticker news</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">yfinance search</Badge>
                    </div>
                  </div>

                  {/* Tool 3 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">selenium</h3>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">4 active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">start browser</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">navigate</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">take screenshot</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">get element text</Badge>
                    </div>
                  </div>

                  {/* Tool 4 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">current_time</h3>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">2 active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">get current time</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal">convert time</Badge>
                    </div>
                  </div>

                  {/* Tool 5 */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">Composio Tools</h3>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100">3 active</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal uppercase text-[10px]">Gmail Send Email</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal uppercase text-[10px]">Gmail Create Email Draft</Badge>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal uppercase text-[10px]">Gmail Get Profile</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="capabilities" className="m-0 max-w-4xl mx-auto space-y-8">
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">Capabilities</h2>
                  <p className="text-slate-500 mt-2">Configure autonomous capabilities and guardrails for this agent.</p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Human approval</h3>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                      Agent will pause and wait for your explicit approval before taking any action. You will receive an email notification when approval is needed.
                    </p>
                  </div>
                  <Switch defaultChecked={true} className="data-[state=checked]:bg-indigo-600 mt-1" />
                </div>
              </TabsContent>
              <TabsContent value="workflow" className="m-0">
                <div className="text-center">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Workflow & Triggers are not available in this mockup.</p>
                </div>
              </TabsContent>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 flex-shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] z-10">
              <Button variant="ghost" onClick={() => setEditingAgent(null)} className="text-slate-500">Discard Changes</Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-8" onClick={() => { setEditingAgent(null); toast({ title: "Changes Saved", description: "Agent configuration updated successfully." }); }}>Save Changes</Button>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      <Dialog open={isCreatingAgent} onOpenChange={setIsCreatingAgent}>
        <DialogContent aria-describedby={undefined} className="max-w-2xl bg-white shadow-xl p-0 overflow-hidden border-slate-200">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Bot className="h-5 w-5 text-indigo-600" /> Build Custom AI Agent
            </DialogTitle>
            <DialogDescription className="mt-1">Design a new autonomous agent to join your orchestration pipeline.</DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Agent Name</Label>
              <Input placeholder="e.g. Sanctions Evaluator" className="h-11 bg-white border-slate-200 focus-visible:ring-indigo-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Specialized Role</Label>
              <div className="relative group">
                <select className="appearance-none flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors group-hover:border-indigo-200 cursor-pointer">
                  <option>Data Extraction</option>
                  <option>Risk Scoring</option>
                  <option>Entity Matching</option>
                  <option>Compliance Analyst</option>
                  <option>Adverse Media Crawler</option>
                  <option>Custom Role</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">System Prompt</Label>
              <Textarea placeholder="Define the agent's core instructions, parameters, and outputs..." className="min-h-[120px] bg-white border-slate-200 focus-visible:ring-indigo-500" />
            </div>
          </div>
          <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreatingAgent(false)}>Cancel</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setIsCreatingAgent(false); toast({ title: "Agent Provisioned", description: "Your custom agent is now spinning up." }); }}>Deploy Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAgents;
