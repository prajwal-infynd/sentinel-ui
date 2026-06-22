import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, User, Calendar, ExternalLink, UserPlus, CheckCircle2, ArrowUpRight, FileText, Clock, Brain, Shield, Download, FileSignature, Share2, Sparkles, Network, Building, Wallet, Landmark, Activity, ScanFace, Globe } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Investigation = () => {
  const [isSarOpen, setIsSarOpen] = useState(false);
  
  return (
  <DashboardLayout>
    <div className="p-6 space-y-6">
      {/* Case Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm">CRITICAL</Badge>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">ALT-4891</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Adverse media hit — suspected fraud exposure</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-primary" /> John Doe</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" /> 2024-03-15 14:23 UTC</span>
              <span className="flex items-center gap-1.5"><ExternalLink className="h-4 w-4 text-primary" /> Financial Times</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center px-4 bg-muted/30 rounded-xl py-2 border border-border/50">
              <div className="text-3xl font-black font-mono tracking-tighter text-destructive">94%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Confidence</div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" className="h-9 gap-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"><CheckCircle2 className="h-4 w-4" /> Review Case</Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-muted w-1/2"><UserPlus className="h-4 w-4" /> Assign</Button>
                <Button variant="outline" size="sm" onClick={() => setIsSarOpen(true)} className="h-9 gap-2 text-xs font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 border-indigo-200 text-indigo-700 w-1/2 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FileSignature className="h-4 w-4" /> Auto-SAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="bg-card border border-border/50 rounded-xl p-1 shadow-sm w-full justify-start overflow-x-auto h-auto">
          <TabsTrigger value="summary" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Summary</TabsTrigger>
          <TabsTrigger value="network" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Network Graph</TabsTrigger>
          <TabsTrigger value="evidence" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Source Evidence</TabsTrigger>
          <TabsTrigger value="entity" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Entity Profile</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Timeline</TabsTrigger>
          <TabsTrigger value="reasoning" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">AI Reasoning</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm p-6 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Brain className="h-5 w-5 text-indigo-500" /> AI-Generated Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A Financial Times investigative report published on 15 March 2024 identifies <span className="font-bold text-foreground">John Doe</span> as a person
                of interest in a multi-jurisdictional fraud investigation. The article cites sources within the UK Serious Fraud Office and references
                suspicious transaction patterns involving offshore shell companies in the British Virgin Islands.
              </p>
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Matched Fields</h4>
                <div className="flex flex-wrap gap-2">
                  {["Full name match", "DOB confirmed", "UK jurisdiction", "Known associate"].map(f => (
                    <Badge key={f} variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm p-6 space-y-5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Suggested Actions</h3>
              <div className="space-y-3">
                {[
                  { action: "Escalate to Senior Analyst", priority: "Recommended", color: "bg-warning/10 text-warning border border-warning/20" },
                  { action: "Request enhanced due diligence", priority: "Required", color: "bg-destructive/10 text-destructive border border-destructive/20" },
                  { action: "File SAR consideration", priority: "Under Review", color: "bg-primary/10 text-primary border border-primary/20" },
                  { action: "Notify relationship manager", priority: "Optional", color: "bg-muted text-muted-foreground border border-border/50" },
                ].map(a => (
                  <div key={a.action} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm hover:border-indigo-500/20 transition-colors">
                    <span className="text-sm font-semibold">{a.action}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${a.color}`}>{a.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="network">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6 mt-6 relative overflow-hidden h-[500px]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><Network className="h-5 w-5 text-indigo-500" /> Dynamic Knowledge Graph</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-white shadow-sm font-mono text-[10px]">Depth: 3 Hops</Badge>
                <Badge variant="outline" className="bg-white shadow-sm font-mono text-[10px] text-destructive border-destructive/20">7 High-Risk Nodes</Badge>
              </div>
            </div>

            {/* Mock Graph Visual */}
            <div className="relative w-full h-[400px] flex items-center justify-center z-10">
              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 400 200 L 250 100" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                <path d="M 400 200 L 250 300" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 400 200 L 550 100" stroke="#ef4444" strokeWidth="3" fill="none" />
                <path d="M 400 200 L 550 300" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 250 300 L 150 250" stroke="#CBD5E1" strokeWidth="2" fill="none" />
                <path d="M 550 100 L 700 150" stroke="#ef4444" strokeWidth="3" fill="none" />
              </svg>

              {/* Central Node */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '160px', left: '360px' }}>
                <div className="h-20 w-20 rounded-full bg-indigo-100 border-4 border-indigo-500 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8 text-indigo-700" />
                </div>
                <div className="mt-3 bg-white px-3 py-1.5 rounded-lg shadow-md border border-border/50 text-center">
                  <div className="text-xs font-bold text-foreground">John Doe</div>
                  <div className="text-[10px] font-mono text-muted-foreground">Primary Subject</div>
                </div>
              </motion.div>

              {/* Connected Nodes */}
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '60px', left: '210px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center">
                  <div className="text-[10px] font-bold">Doe Consulting Ltd</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '260px', left: '210px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center">
                  <div className="text-[10px] font-bold">Acct: *4912</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '60px', left: '510px' }}>
                <div className="h-16 w-16 rounded-full bg-destructive/10 border-4 border-destructive shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform animate-pulse">
                  <Globe className="h-7 w-7 text-destructive" />
                </div>
                <div className="mt-2 bg-white px-2 py-1 rounded shadow-sm border border-destructive/30 text-center">
                  <div className="text-[10px] font-bold text-destructive">BVI Holdings Ltd</div>
                  <div className="text-[8px] font-mono text-muted-foreground uppercase">Shell Company</div>
                </div>
              </motion.div>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '260px', left: '510px' }}>
                <div className="h-14 w-14 rounded-full bg-white border-2 border-slate-300 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserPlus className="h-6 w-6 text-slate-500" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center">
                  <div className="text-[10px] font-bold">Jane Smith</div>
                </div>
              </motion.div>
              
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }} className="absolute z-20 flex flex-col items-center group cursor-pointer" style={{ top: '110px', left: '660px' }}>
                <div className="h-14 w-14 rounded-full bg-destructive/10 border-2 border-destructive/50 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Landmark className="h-6 w-6 text-destructive/80" />
                </div>
                <div className="mt-2 bg-white/90 backdrop-blur px-2 py-1 rounded shadow-sm border border-border/50 text-center">
                  <div className="text-[10px] font-bold text-destructive">Swiss Bank Acct</div>
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="evidence">
          <div className="flex items-center justify-between mt-6 mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Evidentiary Artifacts</h2>
            <Button size="sm" onClick={() => window.print()} className="h-9 gap-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <Download className="h-4 w-4" /> Export Evidence (PDF)
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-32 w-32 text-indigo-900" />
              </div>
              <h3 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2 relative z-10"><FileText className="h-5 w-5 text-indigo-500" /> Source Article</h3>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4 relative z-10">Financial Times • 15 March 2024</div>
              <div className="prose prose-sm text-sm text-muted-foreground max-w-none space-y-4 relative z-10">
                <p>The UK Serious Fraud Office has identified <mark className="bg-warning/20 text-warning-foreground font-semibold px-1 rounded">John Doe</mark> as a person of interest in connection with a complex fraud scheme involving multiple offshore entities...</p>
                <p>Investigators have traced suspicious transactions totalling approximately £4.2 million through shell companies registered in the <mark className="bg-warning/20 text-warning-foreground font-semibold px-1 rounded">British Virgin Islands</mark>.</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 hover:border-indigo-500/30 transition-colors">
              <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-500" /> Sanctions Match</h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Source: OFAC SDN List</div>
                  <div className="font-semibold text-foreground/80">No direct match found</div>
                </div>
                <div className="p-4 rounded-xl bg-warning/5 border border-warning/30 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning" />
                  <div className="text-[10px] font-bold uppercase tracking-wider text-warning-foreground/70 mb-1.5">Source: EU Consolidated List</div>
                  <div className="font-bold text-foreground">Fuzzy match — 72% similarity</div>
                  <div className="text-xs text-muted-foreground mt-2 font-mono bg-white/50 px-2 py-1 rounded inline-block">Entity: "Johan Doe" — ref. EU-2024-1847</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm p-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <ScanFace className="h-40 w-40 text-indigo-300" />
              </div>
              <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2 relative z-10"><ScanFace className="h-5 w-5 text-indigo-400" /> Deepfake & Synthetic Identity</h3>
              <div className="space-y-4 text-sm relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300 text-xs">Biometric Liveness</span>
                  <Badge className="bg-success/20 text-success-foreground border-success/30 hover:bg-success/30 text-[10px]">PASSED</Badge>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300 text-xs">AI Generative Artifacts</span>
                  <Badge className="bg-destructive/20 text-red-300 border-destructive/30 hover:bg-destructive/30 text-[10px]">99% DETECTED</Badge>
                </div>
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-300 text-xs">ID Document Tampring</span>
                  <Badge className="bg-warning/20 text-yellow-300 border-warning/30 hover:bg-warning/30 text-[10px]">FLAGGED</Badge>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs leading-relaxed">
                  <strong>CRITICAL ALERT:</strong> Onboarding video analysis reveals highly probable deepfake artifacts in facial meshing. ID document metadata shows photoshop tampering.
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="entity">
          <div className="grid md:grid-cols-3 gap-5 mt-6">
            <div className="md:col-span-2 rounded-2xl border border-border/50 bg-white shadow-sm p-6">
              <h3 className="text-base font-bold tracking-tight mb-6">Master Entity Profile</h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  ["Full Name", "John Michael Doe"],
                  ["Aliases", "J. Doe, Johan Doe, JMD"],
                  ["Date of Birth", "22 March 1985"],
                  ["Nationality", "British"],
                  ["Identifiers", "Passport: GB-8842991"],
                  ["Linked Jurisdictions", "UK, BVI, UAE, Switzerland"],
                ].map(([label, value]) => (
                  <div key={label} className="group">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
                    <div className="text-sm font-semibold text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50 group-hover:border-indigo-500/30 transition-colors">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-sm p-6">
              <h3 className="text-base font-bold tracking-tight mb-6">Risk Indicators</h3>
              <div className="space-y-4">
                {[
                  { label: "Sanctions Lists", count: 0, color: "text-success bg-success/10 border-success/20" },
                  { label: "PEP Associations", count: 1, color: "text-warning bg-warning/10 border-warning/20" },
                  { label: "Adverse Media", count: 3, color: "text-destructive bg-destructive/10 border-destructive/20" },
                  { label: "Watchlist Memberships", count: 2, color: "text-warning bg-warning/10 border-warning/20" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border/50 shadow-sm">
                    <span className="text-sm font-semibold">{r.label}</span>
                    <span className={`font-mono font-black px-2.5 py-1 rounded-md border ${r.color}`}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Risk Velocity Chart */}
          <div className="mt-5 rounded-2xl border border-border/50 bg-white shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" /> Perpetual KYC: Risk Velocity
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Real-time risk score decay and escalation over 30 days</p>
              </div>
              <Badge className="bg-destructive/10 text-destructive border-destructive/20">+42% Velocity Spike</Badge>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { day: "Day 1", score: 25 }, { day: "Day 5", score: 24 }, { day: "Day 10", score: 22 },
                  { day: "Day 15", score: 28 }, { day: "Day 20", score: 45 }, { day: "Day 25", score: 55 },
                  { day: "Day 28", score: 89 }, { day: "Day 29", score: 92 }, { day: "Day 30", score: 94 }
                ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#4F46E5' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm p-6 mt-6">
            <h3 className="text-base font-bold tracking-tight mb-8">Entity Event Timeline</h3>
            <div className="space-y-6">
              {[
                { date: "15 Mar 2024, 14:23", event: "Adverse media hit detected — Financial Times fraud article", severity: "critical" },
                { date: "12 Mar 2024, 09:15", event: "EU sanctions list update — fuzzy match identified", severity: "high" },
                { date: "28 Feb 2024, 11:42", event: "PEP association discovered — linked political figure", severity: "high" },
                { date: "15 Feb 2024, 16:30", event: "Routine screening completed — no new signals", severity: "low" },
                { date: "01 Feb 2024, 08:00", event: "Entity onboarded for continuous monitoring", severity: "info" },
              ].map((e, i) => (
                <div key={i} className="flex gap-5 group">
                  <div className="flex flex-col items-center">
                    <div className={`h-4 w-4 rounded-full border-2 border-white shadow-sm z-10 ${
                      e.severity === "critical" ? "bg-destructive ring-2 ring-destructive/30" : e.severity === "high" ? "bg-warning ring-2 ring-warning/30" :
                      e.severity === "low" ? "bg-success ring-2 ring-success/30" : "bg-muted-foreground ring-2 ring-muted-foreground/30"
                    }`} />
                    {i < 4 && <div className="w-0.5 flex-1 bg-border/80 group-hover:bg-indigo-500/30 transition-colors mt-2 mb-1" />}
                  </div>
                  <div className="pb-6 pt-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{e.date}</div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-indigo-600 transition-colors">{e.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reasoning">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-8 mt-6 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Brain className="h-48 w-48 text-indigo-900" />
            </div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2 relative z-10"><Brain className="h-5 w-5 text-indigo-500" /> AI Reasoning Chain</h3>
            <div className="space-y-6 relative z-10">
              {[
                { step: "Sources Checked", detail: "OFAC SDN, EU Consolidated, UN Sanctions, UK HMT, 2,847 media sources" },
                { step: "Entities Extracted", detail: "3 named entities from FT article matched against portfolio: John Doe (94%), BVI Holdings (67%), J. Doe Associates (45%)" },
                { step: "Matching Confidence", detail: "Primary entity: 94% confidence based on full name, DOB, and jurisdiction alignment" },
                { step: "Risk Signals Detected", detail: "Fraud investigation, SFO involvement, offshore transaction patterns, shell company structures" },
                { step: "Severity Rationale", detail: "Classified as CRITICAL due to: active law enforcement investigation, high confidence match, and potential SAR obligation" },
              ].map((s, i) => (
                <div key={i} className="flex gap-5 items-start group p-4 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 font-black shadow-sm shrink-0 border border-indigo-500/20 group-hover:scale-110 transition-transform">{i + 1}</div>
                  <div className="pt-1.5">
                    <div className="text-sm font-bold tracking-tight text-foreground group-hover:text-indigo-600 transition-colors mb-1">{s.step}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-5 border-b bg-muted/20">
              <h3 className="text-base font-bold tracking-tight">System Audit Trail</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6">Timestamp</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6">Component</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6">Version</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12 px-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { ts: "2024-03-15 14:23:41", comp: "Media Crawler", ver: "v3.2.1", action: "Article ingested from FT RSS feed" },
                  { ts: "2024-03-15 14:23:44", comp: "NER Engine", ver: "v2.1.0", action: "Named entity extraction completed" },
                  { ts: "2024-03-15 14:23:47", comp: "Matching Engine", ver: "v4.0.3", action: "Entity resolved against portfolio" },
                  { ts: "2024-03-15 14:23:49", comp: "Risk Scorer", ver: "v1.8.2", action: "Risk score calculated: 87 → 94" },
                  { ts: "2024-03-15 14:23:51", comp: "Alert Engine", ver: "v2.5.0", action: "Alert ALT-4891 generated" },
                  { ts: "2024-03-15 14:24:02", comp: "Case Generator", ver: "v1.3.1", action: "Case summary auto-generated" },
                ].map((r, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground px-6 py-4">{r.ts}</TableCell>
                    <TableCell className="text-sm font-semibold text-foreground px-6 py-4">{r.comp}</TableCell>
                    <TableCell className="font-mono text-xs font-semibold px-6 py-4">
                      <span className="bg-muted px-2 py-1 rounded border border-border/50 text-muted-foreground">{r.ver}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground px-6 py-4">{r.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Auto-SAR Generator Modal */}
      <Dialog open={isSarOpen} onOpenChange={setIsSarOpen}>
        <DialogContent className="max-w-[800px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-[#f8fafc] border-indigo-100 rounded-2xl">
          <div className="bg-white border-b px-8 py-5 shrink-0 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-r from-transparent to-indigo-50/50" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-indigo-500" /> Auto-Generated SAR
                </DialogTitle>
                <DialogDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  FINCEN FORMATTED NARRATIVE • CONFIDENCE: 94%
                </DialogDescription>
              </div>
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm">
                <FileSignature className="h-4 w-4" /> File Report
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-8 prose prose-sm max-w-none text-muted-foreground leading-relaxed custom-scrollbar">
            <p><strong>SUBJECT:</strong> Suspicious activity involving structured offshore transfers and potential evasion of sanctions, associated with JOHN DOE.</p>
            <p><strong>DATE OF PREPARATION:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>REPORTING INSTITUTION:</strong> Sentinel Bank N.A.</p>
            <hr className="my-6 border-border/50" />
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mt-0">1. Introduction</h4>
            <p>This Suspicious Activity Report (SAR) is being filed by Sentinel Bank N.A. to report suspected illicit financial activity involving <strong>JOHN MICHAEL DOE</strong> (DOB: 22-Mar-1985), a British national holding accounts at our institution. The activity came to our attention on 15 March 2024 following an alert generated by our automated screening system identifying adverse media.</p>
            
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">2. Account Information</h4>
            <p>JOHN DOE has maintained a primary checking account (Acct #: 8842-XXXX-9912) and a wealth management portfolio with Sentinel Bank since February 2024. The account was established with typical retail banking expected behavior, listing "Management Consultant" as the occupation.</p>

            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">3. Description of Suspicious Activity</h4>
            <p>On 15 March 2024, adverse media published by the Financial Times indicated that JOHN DOE is a subject of interest in an ongoing investigation by the UK Serious Fraud Office (SFO). The investigation allegedly involves the use of shell companies in the British Virgin Islands (BVI).</p>
            <p>A subsequent review of account activity revealed the following concerning patterns:</p>
            <ul>
              <li>Between 01-Mar-2024 and 10-Mar-2024, four incoming wire transfers totaling £4.2 million were received from "BVI Holdings Ltd," an entity previously unknown to the account profile.</li>
              <li>The funds were rapidly moved (velocity: less than 48 hours) to multiple destination accounts in Switzerland and the UAE, maintaining balances below standard regulatory reporting thresholds.</li>
              <li>Entity resolution analysis shows a 72% fuzzy match to a sanctioned individual ("Johan Doe", Ref: EU-2024-1847) on the EU Consolidated List. While not definitively confirmed, the proximity of the adverse media and the transaction behavior elevates the risk profile significantly.</li>
            </ul>

            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">4. Conclusion & Actions Taken</h4>
            <p>Due to the combination of high-profile adverse media (fraud investigation), complex offshore transactional patterns, and a potential fuzzy sanctions match, Sentinel Bank has flagged these transactions as highly suspicious. We are filing this SAR in accordance with regulatory requirements.</p>
            <p>The subject's accounts have been temporarily restricted pending further internal review, and a request for Enhanced Due Diligence (EDD) has been issued.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </DashboardLayout>
  );
};

export default Investigation;
