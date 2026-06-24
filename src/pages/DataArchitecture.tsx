import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Database, BrainCircuit, UploadCloud, FileText, FileSpreadsheet, Server, CheckCircle2, Clock, Key, RefreshCw, Layers, Trash2, Link, Activity, TableProperties, Eye, Search, Crown, Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchUnifiedRecords } from "@/lib/policy-data";
import { formatRelativeTime } from "@/lib/utils";

const initialKnowledgeBase = [
  { id: 1, name: "Historical_SAR_Filings_2023.csv", type: "csv", size: "14.2 MB", status: "Active", tokens: "450k", date: "2 hrs ago", records: 15420, attributes: ["TransactionID", "Amount", "RiskScore"], policy: "Global KYB Thresholds", health: 100 },
  { id: 2, name: "KYB_Compliance_Policy_V4.pdf", type: "pdf", size: "2.1 MB", status: "Active", tokens: "12k", date: "5 hrs ago", records: 1, attributes: ["Text Content", "Metadata"], policy: "Document Analysis Rules", health: 100 },
  { id: 3, name: "Core Banking Customer API", type: "api", size: "Live", status: "Active", tokens: "8.4M", date: "1 min ago", records: 8400000, attributes: ["CustomerID", "Balance", "KYBStatus"], policy: "Real-time Tx Monitoring", health: 98 },
  { id: 4, name: "Sanctions_Internal_List.xlsx", type: "excel", size: "4.8 MB", status: "Inactive", tokens: "Processing", date: "Just now", records: 4500, attributes: ["EntityName", "Alias", "SanctionBody"], policy: "Sanctions Matching", health: 100 },
  { id: 5, name: "Board_Meeting_Minutes_Q1.docx", type: "doc", size: "1.1 MB", status: "Active", tokens: "5k", date: "1 day ago", records: 1, attributes: ["Text Content", "Signatures"], policy: "Corporate Governance", health: 100 }
];

const getIcon = (type: string) => {
  if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (type === 'csv' || type === 'excel') return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  if (type === 'doc') return <FileText className="h-5 w-5 text-blue-500" />;
  return <Server className="h-5 w-5 text-indigo-500" />;
};

const InFyndLogo = ({ className = "" }: { className?: string }) => (
  <img src="/infynd-logo.png" alt="InFynd Logo" className={`inline-block object-contain h-[2.5em] ${className}`} />
);

// Graph data removed.

const DataArchitecture = () => {
  const [kb, setKb] = useState(initialKnowledgeBase);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: unifiedRecords = [], isLoading: isLoadingUnified } = useQuery({
    queryKey: ['unified-records'],
    queryFn: fetchUnifiedRecords
  });

  const handleDelete = (id: number) => {
    setKb(kb.filter(item => item.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setKb(kb.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'Inactive' ? 'Active' : 'Inactive';
        toast({ title: "Status Updated", description: `${item.name} is now ${newStatus}.` });
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const renderList = (filterType: string) => {
    const filtered = filterType === 'all' 
      ? kb 
      : kb.filter(item => {
          if (filterType === 'pdf') return item.type === 'pdf';
          if (filterType === 'csv-excel') return item.type === 'csv' || item.type === 'excel';
          if (filterType === 'docs') return item.type === 'doc';
          if (filterType === 'api') return item.type === 'api';
          return true;
        });

    return (
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="divide-y divide-border/50">
          {filtered.map((item) => (
            <div key={item.id} className="flex flex-col p-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-start md:items-center justify-between">
                <div className="flex items-start md:items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50/50 flex items-center justify-center border border-indigo-100 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {item.name}
                      {item.status === 'Active' && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>}
                      {item.status === 'Inactive' && <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-500 border-slate-200">Inactive</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                      <span className="uppercase font-mono tracking-wider">{item.type}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.size}</span>
                      <span className="text-slate-300">•</span>
                      <span>{item.date}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-indigo-600 bg-indigo-50 px-1 rounded">{item.records.toLocaleString()} records</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-8 mt-3 md:mt-0">
                  <div className="flex flex-col items-end md:items-start w-64 shrink-0 mr-4">
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-slate-50 rounded border border-slate-100">
                      <Link className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-slate-600">Used by: <span className="text-slate-900 font-semibold">{item.policy || "Unassigned"}</span></span>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs shadow-sm" onClick={() => navigate(`/policy?entity=${encodeURIComponent(item.name)}`)}>
                      Configure Policy
                    </Button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2 pl-4 border-l border-border/50">
                    <div className="flex flex-col items-center mr-2">
                      <span className="text-[8px] font-bold uppercase text-muted-foreground mb-1 tracking-wider">{item.status !== 'Inactive' ? 'ON' : 'OFF'}</span>
                      <Switch 
                        checked={item.status !== 'Inactive'} 
                        onCheckedChange={() => handleToggleStatus(item.id)} 
                        className="scale-75 origin-center data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => setPreviewItem(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 pl-14 mt-3">
                <TableProperties className="h-3 w-3 text-muted-foreground hidden sm:block" />
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider hidden sm:block">Schema:</span>
                <div className="flex flex-wrap gap-1">
                  {item.attributes.map(attr => (
                    <Badge key={attr} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 text-slate-600 font-mono hover:bg-slate-200">{attr}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">No data sources found for this category.</div>
          )}
        </div>

        {/* Data Preview Modal */}
        <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-500" />
                Data Preview: {previewItem?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto bg-slate-50 border rounded-md p-4 mt-2">
              {previewItem?.type === 'csv' || previewItem?.type === 'excel' ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-slate-200">
                      <tr>
                        {previewItem.attributes.map((attr: string) => <th key={attr} className="px-4 py-2">{attr}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="bg-white">
                          {previewItem.attributes.map((attr: string) => (
                            <td key={attr} className="px-4 py-2 font-mono text-xs text-slate-600">Sample {attr} Data {i+1}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-center text-xs text-muted-foreground mt-4">Showing 5 of {previewItem?.records?.toLocaleString()} records</div>
                </div>
              ) : previewItem?.type === 'api' ? (
                <pre className="text-xs font-mono text-slate-700 bg-white p-4 rounded border">
{`{
  "status": "success",
  "endpoint": "${previewItem?.name}",
  "records_returned": 100,
  "data": [
    {
      "${previewItem?.attributes[0] || 'id'}": "val_1",
      "${previewItem?.attributes[1] || 'field'}": "val_2"
    }
    // ... ${previewItem?.records?.toLocaleString()} total records
  ]
}`}
                </pre>
              ) : (
                <div className="bg-white p-6 rounded border prose prose-sm max-w-none text-slate-700">
                  <h3 className="text-lg font-bold mb-4">{previewItem?.name}</h3>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  <div className="p-4 bg-slate-100 rounded border mt-4 text-xs font-mono text-muted-foreground">
                    [End of document preview. Full document contains {previewItem?.tokens} tokens.]
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setPreviewItem(null)}>Close Preview</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 text-white transition-all">
                  <UploadCloud className="h-4 w-4" /> New Data Source
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl bg-white border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] p-8 md:p-10 rounded-[2.5rem]">
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">Add New Data Source</h2>
                  <p className="text-slate-500 text-base">Expand your AI's knowledge base by securely uploading historical documents or connecting external integrations.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Universal Drag and Drop */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 border-2 border-dashed border-indigo-200/60 rounded-[2rem] bg-indigo-50/30 p-10 flex flex-col items-center justify-center hover:bg-indigo-50/60 hover:border-indigo-400 transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
            <div className="h-20 w-20 rounded-2xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform duration-300 relative">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl animate-ping opacity-0 group-hover:opacity-100 duration-1000" />
              <UploadCloud className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-3 text-slate-900">Drag & Drop Documents</h3>
            <p className="text-muted-foreground text-sm max-w-md text-center mb-6">
              Upload policies, historical cases, or CSV exports. The AI will instantly embed them into its neural search graph.
            </p>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-red-500" /> PDF</Badge>
              <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-blue-500" /> DOCX</Badge>
              <Badge variant="outline" className="bg-white"><FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-500" /> CSV / XLSX</Badge>
            </div>
          </motion.div>

          {/* Premium Upsell Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="group relative rounded-3xl p-[1px] min-h-[280px] shadow-2xl flex"
          >
            {/* Animated Gradient Border Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl blur-[8px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 via-rose-500 to-indigo-600 rounded-3xl opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
            
            {/* Actual Card Body */}
            <div className="relative flex-1 bg-slate-950/90 backdrop-blur-xl rounded-[23px] p-8 flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/20 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                    <Crown className="h-6 w-6 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">Can't find the data you need?</h3>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  We know the feeling. Tell us what you're looking for, and our intelligence team will build a custom dataset exactly to your needs.
                </p>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full relative overflow-hidden group/btn gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_30px_rgba(225,29,33,0.4)] hover:shadow-[0_0_40px_rgba(225,29,33,0.6)] font-bold border border-white/20 transition-all h-14 mt-auto text-lg">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                      <span className="relative z-10 flex items-center justify-center gap-2 w-full tracking-wide">
                        Request Custom Data
                      </span>
                    </Button>
                  </DialogTrigger>
                <DialogContent className="sm:max-w-md overflow-hidden p-0 border-none rounded-2xl shadow-2xl">
                  <div className="bg-gradient-to-b from-slate-50 to-white px-6 py-8 border-b border-slate-100 flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-slate-100 p-2">
                      <InFyndLogo className="text-4xl text-slate-900 w-full h-full object-contain" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Request Custom Data</DialogTitle>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                      Can't find the dataset you need? The <InFyndLogo className="text-sm text-slate-700 mx-0.5" /> data intelligence team can build bespoke datasets tailored to your precise use case.
                    </p>
                  </div>
                  <div className="px-6 py-6 bg-white space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Entity or Industry Description</label>
                      <Textarea 
                        placeholder="e.g. 'I need a comprehensive list of high-risk fintech startups in Southeast Asia...'" 
                        className="resize-none h-24 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Contact Email</label>
                      <Input 
                        placeholder="you@company.com" 
                        className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-400"
                      />
                    </div>
                    <Button 
                      className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md h-11 text-base transition-all" 
                      onClick={() => toast({ title: "Request Submitted to InFynd", description: "Our intelligence team will reach out to you within 24 hours." })}
                    >
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            </div>
          </motion.div>
                </div>
              </DialogContent>
            </Dialog>            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm bg-white text-slate-700">
                  <Server className="h-4 w-4" /> Connect API
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-lg font-bold">Indexed Data Sources</h3>
              <TabsList className="bg-slate-100/80">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="csv-excel">CSV/Excel</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
                <TabsTrigger value="graph">Master Data Index</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-6">
              {/* Knowledge Repository List */}
              {renderList('all')}
            </TabsContent>
            <TabsContent value="pdf">{renderList('pdf')}</TabsContent>
            <TabsContent value="csv-excel">{renderList('csv-excel')}</TabsContent>
            <TabsContent value="docs">{renderList('docs')}</TabsContent>
            <TabsContent value="api">{renderList('api')}</TabsContent>
            
            <TabsContent value="graph">
              <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden flex flex-col relative">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Database className="h-5 w-5 text-indigo-600" />
                      Unified Master Data Index
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every extracted entity and record across all APIs and file uploads, merged under one roof.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search entities or sources..." 
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-lg">
                      <Switch 
                        id="live-sync" 
                        defaultChecked 
                        onCheckedChange={(checked) => toast({ 
                          title: checked ? "Live Sync Enabled" : "Live Sync Paused", 
                          description: checked ? "The Master Data Index is now actively syncing." : "Real-time syncing has been paused." 
                        })} 
                      />
                      <label htmlFor="live-sync" className="text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer">
                        Live Sync
                        <span className="relative flex h-2 w-2 ml-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </label>
                    </div>

                    <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200" onClick={() => toast({ title: "Export Started", description: "Downloading unified index as CSV..." })}>
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b">
                      <tr>
                        <th className="px-6 py-4 font-medium">Extracted Entity</th>
                        <th className="px-6 py-4 font-medium">Context / Snippet</th>
                        <th className="px-6 py-4 font-medium">Source</th>
                        <th className="px-6 py-4 font-medium text-right">Confidence</th>
                        <th className="px-6 py-4 font-medium text-right">Ingested</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {isLoadingUnified ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
                              Loading Master Index...
                            </div>
                          </td>
                        </tr>
                      ) : unifiedRecords.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No records found.</td>
                        </tr>
                      ) : (
                        unifiedRecords
                          .filter(r => 
                            r.entity.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.contextSnippet.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(record => (
                          <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                              {record.entity}
                            </td>
                            <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                              {record.contextSnippet}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getIcon(record.sourceType)}
                                <span className="font-mono text-xs">{record.sourceName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Badge variant="outline" className={record.confidence > 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                                {record.confidence}%
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(record.timestamp)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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
