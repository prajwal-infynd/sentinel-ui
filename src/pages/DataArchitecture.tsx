import { motion } from "framer-motion";
import { Database, BrainCircuit, UploadCloud, FileText, FileSpreadsheet, Server, CheckCircle2, Clock, Key, RefreshCw, Layers, Trash2, Link, Activity, TableProperties } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import ForceGraph2D from "react-force-graph-2d";

const initialKnowledgeBase = [
  { id: 1, name: "Historical_SAR_Filings_2023.csv", type: "csv", size: "14.2 MB", status: "Active", tokens: "450k", date: "2 hrs ago", records: 15420, attributes: ["TransactionID", "Amount", "RiskScore"], policy: "Global KYB Thresholds", health: 100 },
  { id: 2, name: "KYB_Compliance_Policy_V4.pdf", type: "pdf", size: "2.1 MB", status: "Active", tokens: "12k", date: "5 hrs ago", records: 1, attributes: ["Text Content", "Metadata"], policy: "Document Analysis Rules", health: 100 },
  { id: 3, name: "Core Banking Customer API", type: "api", size: "Live", status: "Active", tokens: "8.4M", date: "1 min ago", records: 8400000, attributes: ["CustomerID", "Balance", "KYBStatus"], policy: "Real-time Tx Monitoring", health: 98 },
  { id: 4, name: "Sanctions_Internal_List.xlsx", type: "excel", size: "4.8 MB", status: "Uploaded", tokens: "Processing", date: "Just now", records: 4500, attributes: ["EntityName", "Alias", "SanctionBody"], policy: "Sanctions Matching", health: 100 },
  { id: 5, name: "Board_Meeting_Minutes_Q1.docx", type: "doc", size: "1.1 MB", status: "On-Premises", tokens: "5k", date: "1 day ago", records: 1, attributes: ["Text Content", "Signatures"], policy: "Corporate Governance", health: 100 }
];

const getIcon = (type: string) => {
  if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (type === 'csv' || type === 'excel') return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  if (type === 'doc') return <FileText className="h-5 w-5 text-blue-500" />;
  return <Server className="h-5 w-5 text-indigo-500" />;
};

const graphData = {
  nodes: [
    { id: "Google", group: 1, size: 30, color: "#4285F4" },
    { id: "OpenAI", group: 1, size: 25, color: "#10a37f" },
    { id: "Meta", group: 1, size: 25, color: "#0668E1" },
    { id: "Anthropic", group: 1, size: 20, color: "#d97757" },
    { id: "Midjourney", group: 1, size: 15, color: "#4a4a4a" },
    { id: "NYT", group: 2, size: 10, color: "#ff4b4b" },
    { id: "Getty", group: 2, size: 12, color: "#ff4b4b" },
    { id: "Universal", group: 2, size: 15, color: "#ffb700" },
    { id: "Authors Guild", group: 2, size: 10, color: "#4caf50" },
    { id: "Concord", group: 2, size: 8, color: "#ffb700" },
    { id: "Disney", group: 2, size: 18, color: "#00d1b2" }
  ],
  links: [
    { source: "NYT", target: "OpenAI", value: 2 },
    { source: "NYT", target: "Google", value: 1 },
    { source: "Getty", target: "Midjourney", value: 2 },
    { source: "Universal", target: "Anthropic", value: 1 },
    { source: "Authors Guild", target: "OpenAI", value: 3 },
    { source: "Authors Guild", target: "Meta", value: 2 },
    { source: "Concord", target: "Anthropic", value: 1 },
    { source: "Disney", target: "Midjourney", value: 2 }
  ]
};

const DataArchitecture = () => {
  const [kb, setKb] = useState(initialKnowledgeBase);

  const handleDelete = (id: number) => {
    setKb(kb.filter(item => item.id !== id));
  };

  const renderList = (filterType: string) => {
    const filtered = filterType === 'all' 
      ? kb 
      : kb.filter(item => {
          if (filterType === 'pdf') return item.type === 'pdf';
          if (filterType === 'csv-excel') return item.type === 'csv' || item.type === 'excel';
          if (filterType === 'docs') return item.type === 'doc';
          return true;
        });

    return (
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col p-4 hover:bg-muted/20 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {item.name}
                      {item.status === 'Active' && <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Active</Badge>}
                      {item.status === 'On-Premises' && <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">On-Premises</Badge>}
                      {item.status === 'Uploaded' && <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/20">Uploaded</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span className="uppercase font-mono tracking-wider">{item.type}</span>
                      <span>•</span>
                      <span>{item.size}</span>
                      <span>•</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Records</div>
                    <div className="font-mono text-xs font-semibold">{item.records.toLocaleString()}</div>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Tokens</div>
                    <div className="font-mono text-xs font-semibold">{item.tokens}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Detailed Monitoring & Schema */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-14 pt-2 border-t border-border/30">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><TableProperties className="h-3 w-3" /> Attributes & Schema</div>
                  <div className="flex flex-wrap gap-1">
                    {item.attributes.map(attr => (
                      <Badge key={attr} variant="secondary" className="text-[9px] bg-slate-100 text-slate-600">{attr}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Link className="h-3 w-3" /> Policy Reference</div>
                  <Badge variant="outline" className="text-[10px] font-mono border-indigo-200 text-indigo-700 bg-indigo-50/50">{item.policy}</Badge>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5"><Activity className="h-3 w-3" /> Health & Freshness</div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px]">
                      <div className={`h-1.5 rounded-full ${item.health > 90 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${item.health}%` }}></div>
                    </div>
                    <span className="text-[10px] font-mono font-bold">{item.health}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No data sources found for this category.</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Data Sources</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Train the AI by uploading historical records, policies, and connecting internal data APIs.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-red-600 hover:bg-red-700 shadow-md">
                  <Database className="h-4 w-4" /> Request Custom Built Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Custom Built Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground mb-4">Need specific datasets? Our Infynd data team can build custom datasets tailored to your precise intelligence needs.</p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company / Entity Description</label>
                    <Textarea placeholder="Describe the target entities or industry you need data for..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Details (Email/Phone)</label>
                    <Input placeholder="Enter your contact info so we can reach you" />
                  </div>
                  <Button className="w-full mt-4 bg-red-600 hover:bg-red-700" onClick={() => toast({ title: "Request Submitted", description: "Our team will reach out to you shortly." })}>Submit Request</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                  <Server className="h-4 w-4" /> Configure API Source
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Internal API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Name</label>
                    <Input placeholder="e.g. Core Banking System" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input placeholder="https://api.internal-bank.com/v1/customers" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Authentication Token (Bearer)</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="sk_live_..." className="pl-9" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => toast({ title: "Stream Connected", description: "API data source has been connected." })}>Connect Data Stream</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Universal Drag and Drop */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="border-2 border-dashed border-border/60 rounded-3xl bg-muted/20 p-12 flex flex-col items-center justify-center hover:bg-muted/40 hover:border-indigo-500/50 transition-colors cursor-pointer group relative overflow-hidden"
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept=".pdf,.doc,.docx,.csv,.xlsx,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                alert(`File ready for ingestion: ${e.target.files[0].name}\n\nThis would normally trigger a background embedding task.`);
              }
            }}
          />
          <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <UploadCloud className="h-8 w-8 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">Drag & Drop internal documents</h3>
          <p className="text-muted-foreground text-sm max-w-md text-center mb-6">
            Upload policies, historical cases, or CSV exports. The AI will instantly embed them into its neural search graph.
          </p>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-red-500" /> PDF</Badge>
            <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-blue-500" /> DOCX</Badge>
            <Badge variant="outline" className="bg-white"><FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-500" /> CSV / XLSX</Badge>
          </div>
        </motion.div>

        {/* Knowledge Repository List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Indexed Data Sources</h3>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="csv-excel">CSV/Excel</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
                <TabsTrigger value="graph">Past Data Graph</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all">{renderList('all')}</TabsContent>
            <TabsContent value="pdf">{renderList('pdf')}</TabsContent>
            <TabsContent value="csv-excel">{renderList('csv-excel')}</TabsContent>
            <TabsContent value="docs">{renderList('docs')}</TabsContent>
            
            <TabsContent value="graph">
              <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden h-[600px] flex flex-col relative">
                <div className="p-4 border-b bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">Relationship Graph</h3>
                  <p className="text-xs text-muted-foreground">Network visualization of historical legal and copyright claims across major AI models.</p>
                </div>
                <div className="flex-1 bg-slate-50/50">
                  <ForceGraph2D
                    graphData={graphData}
                    nodeRelSize={1}
                    nodeVal={node => (node as any).size}
                    nodeLabel="id"
                    nodeColor={node => (node as any).color}
                    linkWidth={2}
                    linkColor={() => "#cbd5e1"}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DataArchitecture;
