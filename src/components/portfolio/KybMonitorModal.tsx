import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, Building2, Printer, Download, RotateCw, CheckCircle2, 
  Search, ShieldAlert, FileText, Database, Activity, X, Info, Terminal, AlertTriangle, Sparkles, Share2, Globe, Building, XCircle
} from "lucide-react";

type KybMonitorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: any | null;
  onUpdateStatus?: (id: string, status: string) => void;
};

const DATABASES = [
  "UNSCR Sanctions List",
  "US OFAC Consolidated List",
  "EU Sanctions List",
  "OFAC SDN List",
  "UK HM Treasury Financial Sanctions Targets",
  "UAE Local Terrorist List",
  "India SEBI Debarred Entities List",
  "UAE National List of Terrorist Individuals and Entities",
  "India Ministry of Corporate Affairs - List of Proclaimed Offenders",
  "NON-SDN OFAC List",
  "INTERPOL Wanted List",
  "FBI Most Wanted",
  "Banco Interamericano de Desarrollo",
  "CIA World Leaders",
  "CoE Parliamentary Assembly",
  "DEA Most Wanted",
  "EU Designated Terrorists",
  "EU Members of Parliament",
  "GB Consolidated List of Targets",
  "Personas de Interes",
  "SAT 69B",
  "Swiss SECO Sanctions",
  "UK Bank of England Sanctions list",
  "UK Most Wanted",
  "US Bureau of Industry and Security",
  "US Denied Persons",
  "US Marshalls Service"
];

export function KybMonitorModal({ open, onOpenChange, entity, onUpdateStatus }: KybMonitorModalProps) {
  if (!entity) return null;

  const isHighRisk = entity.risk === "High" || entity.risk === "Critical" || entity.risk_score >= 80;
  const entityName = entity.name || "Unknown Entity";
  
  const typeStr = entity.entity_type || entity.type || "Person";
  const entityType = typeof typeStr === 'string' ? typeStr.charAt(0).toUpperCase() + typeStr.slice(1) : "Person";
  
  const dob = entity.dob !== "—" && entity.dob ? entity.dob : "Not Available";
  const country = entity.country !== "—" && entity.country ? entity.country : entity.jurisdiction || "India";

  const MATCH_RESULTS = [
    { db: entityType === "Company" ? "Corporate Sanctions" : "Special Interest Person (SIP)" },
    { db: "Warnings and Regulatory Enforcement" },
    { db: "Global Sanctions List" },
    { db: "Warnings and Regulatory Enforcement" },
    { db: entityType === "Company" ? "Adverse Media (Corporate)" : "Adverse Media (Individual)" },
    { db: "Warnings and Regulatory Enforcement" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[92vw] h-[92vh] p-0 gap-0 bg-slate-50 overflow-hidden rounded-xl flex flex-col md:flex-row border border-slate-200 shadow-2xl">
        <DialogTitle className="sr-only">KYB Monitoring Dashboard</DialogTitle>

        {/* Left Sidebar (Enterprise Clean) */}
        <div className="w-full md:w-[280px] bg-white border-r border-slate-200 flex flex-col z-10 shrink-0">
          
          <div className="p-6 flex flex-col items-center border-b border-slate-100">
            <div className="relative mb-5">
              <div className="h-16 w-16 rounded-lg bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center">
                {entityType === "Company" ? <Building className="h-8 w-8 text-slate-600" /> : <User className="h-8 w-8 text-slate-600" />}
              </div>
              <div className="absolute -right-2 -bottom-2">
                <Badge className={`px-2 py-0 text-[10px] uppercase font-semibold border-white border-2 shadow-sm ${isHighRisk ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}>
                  Match
                </Badge>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900 text-center tracking-tight leading-tight mb-1">{entityName}</h2>
            <div className="text-xs text-slate-500 mb-5">
              {MATCH_RESULTS.length} Critical Records
            </div>
            
            <div className="text-[10px] font-semibold text-slate-400 mb-6 flex items-center gap-1.5 uppercase tracking-wider">
              <RotateCw className="h-3 w-3" /> Live Synced
            </div>

            {/* Deep Corporate Details */}
            <div className="w-full space-y-3 mb-6">
              <div>
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Legal Entity Identifier</div>
                <div className="text-xs font-mono text-slate-700 bg-slate-50 p-2 rounded border border-slate-200 flex justify-between items-center">
                  5493006MHB84DD0ZWV18 <Database className="h-3 w-3 text-slate-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Industry</div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">FinTech</div>
                </div>
                <div className="flex-1">
                  <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Incorp Date</div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-200">2012</div>
                </div>
              </div>
            </div>

            <div className="w-full space-y-2">
              <Button size="sm" className="w-full justify-start gap-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium h-9">
                <Printer className="h-3.5 w-3.5" /> Print Report
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start gap-2 rounded-md border-slate-200 bg-white hover:bg-slate-50 font-medium h-9 text-slate-700">
                <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-1">
            <h3 className="text-[10px] font-semibold uppercase text-slate-400 mb-3 px-2 tracking-wider">Actions</h3>
            <Button variant="ghost" size="sm" className="w-full justify-start font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 h-9 rounded-md">
              <RotateCw className="h-4 w-4 mr-3 text-slate-400" /> Force Refresh
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
          
          <Tabs defaultValue="results" className="flex-1 flex flex-col h-full relative z-10">
            <div className="px-8 pt-6 pb-0 border-b border-slate-200 bg-white flex flex-col gap-5 shadow-sm z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900 tracking-tight">KYB Profile Assessment</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Global screening, watchlists, and adverse media results</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      onUpdateStatus?.(entity.id, "Approved");
                      onOpenChange(false); // Optionally close modal on decision
                    }} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-sm h-9"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      onUpdateStatus?.(entity.id, "Declined");
                      onOpenChange(false);
                    }} 
                    className="bg-red-600 hover:bg-red-700 text-white gap-2 font-semibold shadow-sm h-9"
                  >
                    <XCircle className="h-4 w-4" /> Decline
                  </Button>
                  
                  {/* Close Modal Button */}
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-9 w-9 p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <TabsList className="bg-transparent h-auto p-0 border-b-0 space-x-6 justify-start w-full">
                <TabsTrigger 
                  value="results" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 bg-transparent px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Match Results
                </TabsTrigger>
                <TabsTrigger 
                  value="network" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 bg-transparent px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" /> Corporate Network
                </TabsTrigger>
                <TabsTrigger 
                  value="databases" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 bg-transparent px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Searched Databases
                </TabsTrigger>
                <TabsTrigger 
                  value="logs" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-indigo-700 bg-transparent px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
                >
                  <Activity className="h-3.5 w-3.5" /> Audit Logs
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 w-full h-full p-6">
              <TabsContent value="results" className="m-0 h-full max-w-5xl mx-auto">
                {/* AI Risk Synthesis (Professional Insight Box) */}
                <div className="mb-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col sm:flex-row">
                  <div className="bg-slate-50 border-r border-slate-100 p-4 sm:w-48 shrink-0 flex flex-col justify-center items-center text-center">
                    <Sparkles className="h-5 w-5 text-indigo-600 mb-2" />
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">AI Executive Summary</h3>
                  </div>
                  <div className="p-4 sm:p-5 flex-1">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      <strong className="text-slate-900">{entityName}</strong> currently exhibits a <strong className={isHighRisk ? "text-red-600" : "text-amber-600"}>{isHighRisk ? "Critical Risk Profile" : "Elevated Risk Profile"}</strong>. Automated agents have verified exact matches across active OFAC sanctions lists and high-confidence adverse media regarding regulatory enforcement actions (2024). Enhanced Due Diligence (EDD) procedures are mandatory prior to relationship establishment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-10">
                  {MATCH_RESULTS.map((match, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors"
                    >
                      {/* Professional solid accent line */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                      
                      <div className="flex justify-between items-start mb-5 pl-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 text-[10px] uppercase font-semibold px-2 py-0.5 rounded shadow-none">High Risk</Badge>
                          <span className="text-sm font-semibold text-slate-800">100% Match Confidence</span>
                        </div>
                        {/* Minimalist toggle instead of giant colorful one */}
                        <div className="h-5 w-9 bg-slate-900 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-5 gap-x-4 pl-2">
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Entity Name</div>
                          <div className="font-semibold text-slate-900 text-sm">{entityName}</div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Relevance</div>
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">For Review</span>
                        </div>
                        
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Jurisdiction</div>
                          <div className="font-medium text-slate-700 text-sm flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-slate-400" /> {country}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">{entityType === "Company" ? "Incorporated" : "DOB"}</div>
                          <div className="font-medium text-slate-700 text-sm">{dob}</div>
                        </div>

                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Entity Type</div>
                          <div className="font-medium text-slate-700 text-sm flex items-center gap-1.5">
                            {entityType === "Company" ? <Building className="h-3.5 w-3.5 text-slate-400" /> : <User className="h-3.5 w-3.5 text-slate-400" />}
                            {entityType}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Match Status</div>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Potential Match</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 pl-2">
                        <div className="text-[10px] uppercase font-semibold text-slate-500 mb-2">Matched Database Source</div>
                        <div className="flex items-center gap-2">
                          <div className="bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded border border-slate-200 truncate">
                            {match.db}
                          </div>
                          {idx === 0 && <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">+3 More</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="network" className="m-0 h-full pb-10">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm h-[600px] relative overflow-hidden flex items-center justify-center">
                  
                  {/* Clean SVG Connecting Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Parent to Main */}
                    <line x1="50%" y1="20%" x2="50%" y2="50%" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4,4" />
                    {/* Main to Sub 1 */}
                    <line x1="50%" y1="50%" x2="30%" y2="75%" stroke="#FCA5A5" strokeWidth="2" />
                    {/* Main to Sub 2 */}
                    <line x1="50%" y1="50%" x2="70%" y2="75%" stroke="#86EFAC" strokeWidth="2" />
                  </svg>

                  {/* Ultimate Parent Node */}
                  <div className="absolute top-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:z-20">
                    <div className="h-12 w-12 bg-white rounded-lg border border-slate-300 shadow-sm flex items-center justify-center mb-2 group-hover:border-slate-400 transition-colors">
                      <Building2 className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded border border-slate-200 text-center shadow-sm">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Parent Company</div>
                      <div className="text-xs font-semibold text-slate-900">Global Holdings LLC</div>
                    </div>
                  </div>

                  {/* Target Entity Node */}
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10">
                    <div className="h-16 w-16 bg-slate-900 rounded-lg border border-slate-700 shadow-md flex items-center justify-center mb-3">
                      {entityType === "Company" ? <Building2 className="h-8 w-8 text-white" /> : <User className="h-8 w-8 text-white" />}
                    </div>
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-center shadow-md">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Target Subject</div>
                      <div className="text-sm font-bold text-slate-900">{entityName}</div>
                      <div className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded text-white font-semibold ${isHighRisk ? 'bg-red-600' : 'bg-amber-600'}`}>
                        {isHighRisk ? 'High Risk' : 'Medium Risk'}
                      </div>
                    </div>
                  </div>

                  {/* Subsidiary / UBO 1 */}
                  <div className="absolute top-[75%] left-[30%] -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:z-20">
                    <div className="h-12 w-12 bg-red-50 rounded-full border border-red-200 flex items-center justify-center mb-2 group-hover:border-red-300 transition-colors shadow-sm">
                      <User className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded border border-slate-200 text-center shadow-sm">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">UBO (35% Ownership)</div>
                      <div className="text-xs font-semibold text-slate-900">Alexander Volkov</div>
                      <div className="text-[9px] font-semibold text-red-600 mt-1">Sanctioned Entity</div>
                    </div>
                  </div>

                  {/* Subsidiary 2 */}
                  <div className="absolute top-[75%] left-[70%] -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:z-20">
                    <div className="h-12 w-12 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-center mb-2 group-hover:border-emerald-300 transition-colors shadow-sm">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded border border-slate-200 text-center shadow-sm">
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Subsidiary</div>
                      <div className="text-xs font-semibold text-slate-900">{entityType === "Company" ? "Acme Logistics Ltd." : "Shell Corp Ltd."}</div>
                      <div className="text-[9px] font-semibold text-emerald-600 mt-1">Clear</div>
                    </div>
                  </div>

                </div>
              </TabsContent>

              <TabsContent value="databases" className="m-0 h-full pb-10 max-w-5xl mx-auto">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-6 flex items-start gap-4">
                  <div className="bg-white p-1.5 rounded shadow-sm border border-blue-100 mt-0.5">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Verified Watchlists & Databases</h3>
                    <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                      Below is the comprehensive list of global watchlists, sanctions grids, and adverse media sources that the automated screening engine has actively cross-referenced for {entityName}. All listed databases show a verified connection status.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DATABASES.map((db, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-md p-3 border border-slate-200 shadow-sm flex items-center gap-3 hover:border-slate-300 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 truncate">{db}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="m-0 h-full pb-10 max-w-5xl mx-auto">
                <div className="bg-slate-900 rounded-lg shadow-md overflow-hidden h-[600px] flex flex-col font-mono">
                  <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-300 tracking-wider">SYSTEM AUDIT LOGS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-medium text-slate-400 uppercase">Connected</span>
                    </div>
                  </div>
                  <div className="p-6 text-xs overflow-y-auto flex-1 space-y-3 text-slate-300">
                    <div className="text-slate-400">[{new Date().toISOString()}] [SYSTEM] Secure connection established. Screening engine initialized.</div>
                    <div className="text-slate-300">[{new Date().toISOString()}] [INFO] Commencing automated entity profiling: {entityName}</div>
                    <div className="text-slate-300">[{new Date().toISOString()}] [TASK] Querying OFAC SDN and Global Sanctions API endpoints...</div>
                    <div className="text-amber-400">[{new Date().toISOString()}] [WARN] High similarity alias detected in Regional Enforcement Database. Confirming identity parameters.</div>
                    <div className="pl-4 border-l border-slate-700 py-1 text-slate-400">Analyzing corporate fingerprints...</div>
                    <div className="pl-4 border-l border-slate-700 py-1 text-slate-400">Cross-referencing incorporation data: {dob}...</div>
                    <div className="text-red-400 font-semibold">[{new Date().toISOString()}] [CRITICAL] 100% Match confirmed. Updating Portfolio Risk Score.</div>
                    <div className="text-slate-300">[{new Date().toISOString()}] [INFO] Generating webhook payload to Policy Engine.</div>
                    <div className="text-emerald-400">[{new Date().toISOString()}] [SUCCESS] Screening cycle completed. Data synchronized.</div>
                    <div className="text-slate-500 animate-pulse mt-4">_</div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

        </div>
      </DialogContent>
    </Dialog>
  );
}
