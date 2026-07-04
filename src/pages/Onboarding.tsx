import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Database, FileText, Clock, Building, 
  Fingerprint, RefreshCw, CheckCircle2, ArrowRight, Eye,
  ArrowLeft, Printer, Download, Search, Settings, X, Activity, ShieldCheck,
  UploadCloud
} from "lucide-react";

const AML_ACTIVITIES = [
  { id: "AML-1884", name: "Sentinel", type: "AML Screening", status: "Clean", date: "2026-07-01 13:43" },
  { id: "AML-2805", name: "ssssss", type: "AML Screening", status: "Clean", date: "2026-07-01 13:43" },
];

const CORP_SYNCS = [
  { id: "REG-301", name: "Acme Global Industries Ltd", type: "Corporate Registry", status: "Verified", files: 42, directors: "Marcus Vance (Managing Director), Sarah Jenkins (Financial Officer)", reg: "UK-08429384" },
  { id: "REG-302", name: "Apex Crypto Ventures LLC", type: "Corporate Registry", status: "Action Required", files: 6, directors: "Christoph Mueller (CEO), Hannah Brandt (General Manager)", reg: "DE-38910482" }
];

const DOC_LOGS = [
  { id: "DOC-501", name: "Johnathan Miller", type: "Identity Verification", doc: "Passport (GBR)", idMatch: "99.2%", face: "98.7%", ocr: "99.5%", device: "98%", fraud: "Safe (Low Risk Profile)", date: "2026-07-01 10:15" },
  { id: "DOC-502", name: "Li Wei", type: "Identity Verification", doc: "National ID (CHN)", idMatch: "98.1%", face: "97.4%", ocr: "98%", device: "91%", fraud: "Safe (Low Risk Profile)", date: "2026-06-30 16:48" }
];

export default function Onboarding() {
  const [activeTab, setActiveTab] = useState("overview");
  
  type DossierType = 'aml' | 'corporate' | 'document';
  const [dossier, setDossier] = useState<{name: string, type: DossierType, id: string} | null>(null);
  
  // Modals state
  const [isAmlModalOpen, setIsAmlModalOpen] = useState(false);
  const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  const [activeScreeningType, setActiveScreeningType] = useState<DossierType | null>(null);
  
  const [isAmlVerificationComplete, setIsAmlVerificationComplete] = useState(false);
  const [isCorpVerificationComplete, setIsCorpVerificationComplete] = useState(false);
  const [isDocVerificationComplete, setIsDocVerificationComplete] = useState(false);
  
  // Form state
  const [entityName, setEntityName] = useState("");
  const [corpRegNumber, setCorpRegNumber] = useState("");
  const [docType, setDocType] = useState("Passport (GBR)");
  
  // Progress state
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeScreeningType) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              if (activeScreeningType === 'aml') setIsAmlVerificationComplete(true);
              if (activeScreeningType === 'corporate') setIsCorpVerificationComplete(true);
              if (activeScreeningType === 'document') setIsDocVerificationComplete(true);
              setActiveScreeningType(null);
            }, 500);
            return 100;
          }
          return p + 20;
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [activeScreeningType]);

  const getStepStatus = (stepProgress: number, targetProgress: number) => {
    if (stepProgress > targetProgress) return "complete";
    if (stepProgress === targetProgress) return "active";
    return "pending";
  };

  const renderDossierContent = () => {
    if (!dossier) return null;
    const { type, name, id } = dossier;
    
    let title = "AML Screening Result";
    let leftTitle = "Company AML Screening";
    let matchGroup = "Adverse Media / Global Sanctions";
    let statusText = "Clean";
    let matchPct = "0% Match";
    let riskBadge = <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-4 py-1 text-sm font-bold shadow-none">Low Risk</Badge>;
    let relevance = "For Review";
    let entityType = "Company";
    
    if (type === 'corporate') {
      title = "Corporate Registry Sync Details";
      leftTitle = "Corporate Registry";
      matchGroup = "Companies Registry Database";
      statusText = "Verified";
      matchPct = "100% Data Sync";
      riskBadge = <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-4 py-1 text-sm font-bold shadow-none">Verified</Badge>;
    } else if (type === 'document') {
      title = "Document Verification Report";
      leftTitle = "Identity Document Verification";
      matchGroup = "Biometric ID Database";
      statusText = "Approved";
      matchPct = "99.1% Match";
      riskBadge = <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 rounded-full px-4 py-1 text-sm font-bold shadow-none">Approved</Badge>;
      entityType = "Individual";
    }
    
    return (
      <div className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6">
         {/* Breadcrumbs */}
         <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
           <span>Sentinel Verify™</span>
           <span>›</span>
           <span className="font-bold text-slate-900 dark:text-slate-100">{leftTitle}</span>
           <div className="flex-1" />
           <Button variant="outline" className="h-9 gap-2 rounded-xl border-slate-200" onClick={() => {
              setActiveTab(type === 'corporate' ? 'corporate' : type === 'document' ? 'document' : 'aml');
              setDossier(null);
           }}>
              <ArrowLeft className="w-4 h-4" /> Back to Workspace
           </Button>
         </div>
         
         {/* Detailed Dossier Layout (Left Sidebar + Right Content) */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="rounded-3xl border-slate-200 shadow-sm relative">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                     <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4 text-blue-600 relative">
                       {type === 'document' ? <Fingerprint className="w-10 h-10" /> : type === 'corporate' ? <Building className="w-10 h-10" /> : <Database className="w-10 h-10" />}
                       <Badge className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white border-white shadow-sm font-bold">Match</Badge>
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
                     <p className="text-xs text-slate-400 font-bold tracking-widest mt-2 uppercase">NO. OF RECORDS: 1</p>
                     <p className="text-xs text-slate-400 mt-2 font-medium">Updated: 2026-07-01 13:45</p>
                  </CardContent>
                </Card>
                
                <Button variant="outline" className="w-full justify-center rounded-2xl h-12 text-slate-700 font-bold bg-white hover:bg-slate-50 border-slate-200">
                  <Printer className="w-4 h-4 mr-2" /> Print Report
                </Button>
                <Button variant="outline" className="w-full justify-center rounded-2xl h-12 text-slate-700 font-bold bg-white hover:bg-slate-50 border-slate-200">
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
                
                <div className="mt-8 pt-4">
                   <p className="text-sm font-bold text-slate-900 mb-2 px-2">Update Status</p>
                   <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 text-sm text-emerald-600 font-bold p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                        <CheckCircle2 className="w-4 h-4" /> Mark as Read
                      </button>
                      <button className="w-full flex items-center gap-3 text-sm text-slate-600 font-bold p-3 hover:bg-slate-50 rounded-2xl transition-colors" onClick={() => setDossier(null)}>
                        <ArrowLeft className="w-4 h-4" /> Return to Screening
                      </button>
                   </div>
                </div>
                
                <Card className="rounded-3xl border-none bg-blue-50/50 mt-4 shadow-none">
                   <CardContent className="p-6">
                     <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-4">{leftTitle}</p>
                     <div className="flex justify-between items-center text-sm mb-3">
                       <span className="text-slate-500 font-medium">Search Type</span>
                       <span className="font-bold text-slate-900">{type === 'corporate' ? 'Registry' : type === 'document' ? 'Identity' : 'AML'}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-500 font-medium">Timestamp</span>
                       <span className="font-bold text-slate-900">2026-07-01 13:45</span>
                     </div>
                   </CardContent>
                </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3 space-y-6">
               <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                     <Search className="w-5 h-5 text-blue-600" /> {title}
                   </div>
                   <div className="flex items-center gap-3">
                     <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                     <X className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setDossier(null)} />
                   </div>
                 </div>
                 
                 <CardContent className="p-8">
                   <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                     <div className="flex items-center gap-4">
                       {riskBadge}
                       <span className="text-sm font-bold text-slate-900">{matchPct}</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">Audited</span>
                       <div className="w-12 h-6 bg-blue-600 rounded-full relative flex items-center px-1 cursor-pointer">
                         <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                       </div>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-6 mb-10">
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">Name</p>
                       <p className="font-bold text-slate-900 text-base">{name}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">Relevance</p>
                       <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-none font-bold">For Review</Badge>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">Countries</p>
                       <p className="font-bold text-slate-900 text-base">United Kingdom, USA</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">DOB / Registry Date</p>
                       <p className="font-bold text-slate-900 text-base">{type === 'document' ? 'Not Available' : '2026-07-01'}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">Entity Type</p>
                       <p className="font-bold text-slate-900 text-base">{entityType}</p>
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 mb-2">Match Status</p>
                       <p className="font-bold text-slate-900 text-base">{statusText}</p>
                     </div>
                   </div>
                   
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Database Match Group</p>
                     <Badge className="bg-slate-100 text-slate-700 border-none hover:bg-slate-200 shadow-none px-4 py-2 rounded-full font-bold">{matchGroup}</Badge>
                   </div>
                 </CardContent>
               </Card>

               {/* Monitoring Logs */}
               <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                     <Activity className="w-5 h-5 text-blue-600" /> Monitoring Logs
                   </div>
                   <div className="flex items-center gap-3">
                     <Settings className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                     <X className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                   </div>
                 </div>
                 <CardContent className="p-16 flex flex-col items-center text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
                     <Activity className="w-8 h-8" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-500 mb-3">Monitoring Alerts not activated yet</h3>
                   <p className="text-sm text-slate-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">
                     Enable daily auto-monitoring logs to track modifications in directors, registries, and sanction lists.
                   </p>
                   <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 shadow-lg shadow-blue-600/20">
                     All Alerts
                   </Button>
                 </CardContent>
               </Card>

               {/* Searched Databases */}
               <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                     <ShieldCheck className="w-5 h-5 text-emerald-500" /> Searched Databases
                   </div>
                   <X className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                 </div>
                 <CardContent className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                     {type === 'document' ? (
                       [
                         "INTERPOL Stolen & Lost Travel Documents", "National ID Verification Registries", "Mobile SIM Provider Directories",
                         "Geo-Fencing Fraud Threat Registers", "Device Fingerprint Reputation Databases", "MRZ Cryptographic Checksum Registry",
                         "Biometric Facial Liveness Match DB", "International Travel History Records"
                       ].map((db, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-300 hover:bg-white transition-colors cursor-default shadow-sm group">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                           </div>
                           <span className="text-sm font-semibold text-slate-600 truncate group-hover:text-slate-900" title={db}>{db}</span>
                         </div>
                       ))
                     ) : (
                       [
                         "UNSCR Sanctions List", "CoE Parliamentary Assembly", "US OFAC Consolidated List",
                         "DEA Most Wanted", "EU Sanctions List", "EU Designated Terrorists",
                         "DEAC SDN List", "EU Members of Parliament", "UK HM Treasury Financial Sanctions...",
                         "GB Consolidated List of Targets", "UAE Local Terrorist List", "Personas de Interes",
                         "India SEBI Debarred Entities List", "SAT 69B", "UAE National List of Terrorist Individ...",
                         "Swiss SECO Sanctions", "India MCA List of Proclaimed Offende...", "UK Bank of England Sanctions List",
                         "NON-SDN OFAC List", "UK Most Wanted", "INTERPOL Wanted List"
                       ].map((db, idx) => (
                         <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-2xl hover:border-slate-300 hover:bg-white transition-colors cursor-default shadow-sm group">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                           </div>
                           <span className="text-sm font-semibold text-slate-600 truncate group-hover:text-slate-900" title={db}>{db}</span>
                         </div>
                       ))
                     )}
                   </div>
                 </CardContent>
               </Card>
            </div>
         </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {dossier ? renderDossierContent() : (
        <div className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6">
          
          {/* Page Title */}
          <div className="pt-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-navy dark:text-white">Onboarding V2</h1>
            <p className="text-muted-foreground mt-2">Perform, manage, and audit corporate registries, identity checks, and AML compliance screenings.</p>
          </div>

          {/* Tabs & Buttons Container */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full xl:w-auto">
              <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl h-auto">
                <TabsTrigger value="overview" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">Overview</TabsTrigger>
                <TabsTrigger value="aml" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">AML Screening</TabsTrigger>
                <TabsTrigger value="corporate" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">Corporate Registry</TabsTrigger>
                <TabsTrigger value="document" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm text-sm font-semibold">Document Verification</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <Button variant="outline" className="gap-2 rounded-2xl text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-5 h-11" onClick={() => setIsAmlModalOpen(true)}>
                <Plus className="w-4 h-4" /> Run AML Check
              </Button>
              <Button variant="outline" className="gap-2 rounded-2xl text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-5 h-11" onClick={() => setIsCorpModalOpen(true)}>
                <Plus className="w-4 h-4" /> Run Corporate Registry
              </Button>
              <Button variant="outline" className="gap-2 rounded-2xl text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-5 h-11" onClick={() => setIsDocModalOpen(true)}>
                <Plus className="w-4 h-4" /> Verify Document
              </Button>
            </div>
          </div>

          {/* Tab Content: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
              <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden relative">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-2">AML Watchlists</p>
                        <div className="text-5xl font-extrabold text-slate-900 dark:text-white">6</div>
                        <p className="text-sm text-slate-500 mt-4 font-medium">Total checks performed</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                        <Database className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden relative">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-2">Corporate Registry</p>
                        <div className="text-5xl font-extrabold text-slate-900 dark:text-white">3</div>
                        <p className="text-sm text-slate-500 mt-4 font-medium">Total checks performed</p>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600">
                        <FileText className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-8">
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm h-full overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-lg">
                        <Clock className="w-5 h-5 text-blue-600" /> Recent Verification Activities
                      </div>
                      <Badge variant="secondary" className="rounded-full bg-slate-200/50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium px-4 py-1">Real-time Audit</Badge>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            <th className="px-6 py-4 font-bold tracking-wider">Target Entity Name</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Screening Type</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Compliance Status</th>
                            <th className="px-6 py-4 font-bold tracking-wider">Verification Date</th>
                            <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {AML_ACTIVITIES.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Database className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{row.name}</div>
                                    <div className="text-xs text-slate-500 font-medium">{row.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{row.type}</td>
                              <td className="px-6 py-4">
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full px-3 shadow-none border-none">
                                  {row.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-medium">{row.date}</td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold gap-2" onClick={() => setDossier({name: row.name, type: 'aml', id: row.id})}>
                                  <Eye className="w-4 h-4" /> View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab Content: Corporate Registry */}
          {activeTab === "corporate" && (
             <div className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Corporate Registry Syncs</h2>
                    <p className="text-sm text-slate-500 font-medium">Verify registered details and filing statuses with official government registries.</p>
                  </div>
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-600/20" onClick={() => setIsCorpModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Sync New Corporate Profile
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {CORP_SYNCS.map((row, idx) => (
                    <Card key={idx} className="rounded-3xl border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                               <Building className="w-5 h-5" />
                             </div>
                             <div>
                               <h3 className="font-bold text-slate-900">{row.name}</h3>
                               <p className="text-xs text-slate-500 font-medium">{row.id} • Corporate Registry</p>
                             </div>
                           </div>
                           <Badge className={row.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 shadow-none' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 shadow-none'}>
                             {row.status}
                           </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                           <div>
                             <p className="text-xs text-slate-400 font-bold mb-1">Reg: {row.reg}</p>
                             <p className="text-xs text-slate-400 font-bold">Directors: {row.directors}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-slate-400 font-bold">Filings sync: {row.files} files</p>
                           </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                           <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold gap-2 h-9" onClick={() => setDossier({name: row.name, type: 'corporate', id: row.id})}>
                             <Eye className="w-4 h-4" /> View Details
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}

          {/* Tab Content: Document Verification */}
          {activeTab === "document" && (
             <div className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Document Verification Logs</h2>
                    <p className="text-sm text-slate-500 font-medium">Inspect AI-driven biometrics, MRZ scans, and fraud check values for user IDs.</p>
                  </div>
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-600/20" onClick={() => setIsDocModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Verify New Document
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {DOC_LOGS.map((row, idx) => (
                    <Card key={idx} className="rounded-3xl border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6 space-y-5">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                               <Fingerprint className="w-5 h-5" />
                             </div>
                             <div>
                               <h3 className="font-bold text-slate-900">{row.name}</h3>
                               <p className="text-xs text-slate-500 font-medium">{row.id} • {row.type}</p>
                             </div>
                           </div>
                           <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 shadow-none px-3">
                             Approved
                           </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 bg-slate-50 p-5 rounded-2xl">
                           <div>
                             <p className="text-xs text-slate-400 font-medium mb-1">Document: <span className="font-bold text-slate-700">{row.doc}</span></p>
                             <p className="text-xs text-slate-400 font-medium mb-1">Face biometric: <span className="font-bold text-slate-700">{row.face}</span></p>
                             <p className="text-xs text-slate-400 font-medium">Device trust: <span className="font-bold text-slate-700">{row.device}</span></p>
                           </div>
                           <div>
                             <p className="text-xs text-slate-400 font-medium mb-1">Identity Match: <span className="font-bold text-slate-700">{row.idMatch}</span></p>
                             <p className="text-xs text-slate-400 font-medium mb-1">OCR confidence: <span className="font-bold text-slate-700">{row.ocr}</span></p>
                             <p className="text-xs text-slate-400 font-medium">Fraud triggers: <span className="font-bold text-slate-700">{row.fraud}</span></p>
                           </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                           <span className="text-xs text-slate-400 font-medium">Verified: {row.date}</span>
                           <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold gap-2 h-9" onClick={() => setDossier({name: row.name, type: 'document', id: row.id})}>
                             <Eye className="w-4 h-4" /> View
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}
          
          {/* Tab Content: AML Screening */}
          {activeTab === "aml" && (
             <div className="space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AML Watchlist Screenings</h2>
                    <p className="text-sm text-slate-500 font-medium">Check individuals or companies against global watchlists and sanctions.</p>
                  </div>
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-6 shadow-md shadow-blue-600/20" onClick={() => setIsAmlModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Run AML Check
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {AML_ACTIVITIES.map((row, idx) => (
                    <Card key={idx} className="rounded-3xl border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                               <Database className="w-5 h-5" />
                             </div>
                             <div>
                               <h3 className="font-bold text-slate-900">{row.name}</h3>
                               <p className="text-xs text-slate-500 font-medium">{row.id} • AML Screening</p>
                             </div>
                           </div>
                           <Badge className={row.status === 'Clean' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 shadow-none' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200 shadow-none'}>
                             {row.status}
                           </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                           <div>
                             <p className="text-xs text-slate-400 font-bold mb-1">Risk Level: <span className="text-emerald-600">Low Risk</span></p>
                             <p className="text-xs text-slate-400 font-bold">Match: 0% Match</p>
                           </div>
                           <div className="text-right">
                             <p className="text-xs text-slate-400 font-bold">Timestamp: {row.date.split(' ')[0]}</p>
                           </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                           <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold gap-2 h-9" onClick={() => setDossier({name: row.name, type: 'aml', id: row.id})}>
                             <Eye className="w-4 h-4" /> View Details
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             </div>
          )}
        </div>
      )}

      {/* Footer versions */}
      <div className="flex justify-end items-center p-6 text-sm font-medium text-slate-500 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600" /> Version 1.0
        </div>
      </div>

      {/* -------------------- AML MODALS -------------------- */}
      <Dialog open={isAmlModalOpen} onOpenChange={setIsAmlModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">New AML Watchlist Screening</h2>
          </div>
          <div className="space-y-6">
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Target Entity Name</label>
               <Input 
                 placeholder="e.g. Sentinel" 
                 value={entityName} 
                 onChange={(e) => setEntityName(e.target.value)} 
                 className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-base px-4 focus-visible:ring-blue-600" 
               />
             </div>
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Entity Type</label>
               <select className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600">
                 <option>Company / Enterprise</option>
                 <option>Individual</option>
               </select>
             </div>
          </div>
          <div className="flex gap-4 mt-10">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-base" onClick={() => setIsAmlModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base" onClick={() => { setIsAmlModalOpen(false); setActiveScreeningType('aml'); }}>Start Verification</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeScreeningType === 'aml'} onOpenChange={(open) => !open && setActiveScreeningType(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
             <RefreshCw className="w-10 h-10 animate-spin" />
           </div>
           <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Compliance Screening Active</h2>
           <p className="text-sm font-medium text-slate-500 mb-10">Searching international sanctions & PEP watchlists...</p>
           
           <div className="w-full space-y-3 mb-10">
             <div className="flex justify-between text-sm font-bold">
               <span className="text-slate-500">Verification progress</span>
               <span className="text-blue-600">{progress}%</span>
             </div>
             <Progress value={progress} className="h-2.5 bg-blue-100" />
           </div>
           
           <div className="w-full">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Engine Execution Steps</p>
             <ul className="space-y-4">
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 0) === 'complete' ? 'text-emerald-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 0) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Validate Target Query & Params
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 25) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 25) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 25) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 25) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Match International PEP Registries
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 50) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 50) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 50) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 50) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Scan OFAC, UK, EU Sanction Lists
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 75) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 75) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 75) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 75) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Analyze Adverse Media Databases
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 100) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 100) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 100) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 100) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Verdict Authentication
               </li>
             </ul>
           </div>
           
           <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">SENTINEL COMPLIANCE ENGINE</p>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAmlVerificationComplete} onOpenChange={setIsAmlVerificationComplete}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Verification Complete</h2>
           <p className="text-xs text-blue-600 uppercase tracking-widest mb-8 font-bold">SENTINEL COMPLIANCE ENGINE</p>
           
           <div className="w-full bg-slate-50 rounded-3xl p-6 space-y-5 mb-8 border border-slate-100">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Record ID</span>
               <span className="font-bold text-slate-900">AML-8469</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Target Entity</span>
               <span className="font-bold text-slate-900">{entityName || 'Sentinel'}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Status Verdict</span>
               <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 py-1 shadow-none border-none font-bold">Clean</Badge>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Risk Level</span>
               <span className="font-bold text-emerald-600">Low</span>
             </div>
           </div>
           
           <Button className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20" onClick={() => {
             setIsAmlVerificationComplete(false);
             setDossier({name: entityName || 'Sentinel', type: 'aml', id: 'AML-8469'});
             setEntityName("");
           }}>
             Go to Detailed Dossier View <ArrowRight className="w-5 h-5 ml-2" />
           </Button>
        </DialogContent>
      </Dialog>

      {/* -------------------- CORP MODALS -------------------- */}
      <Dialog open={isCorpModalOpen} onOpenChange={setIsCorpModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 bg-white border-slate-200 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Sync Corporate Registry Profile</h2>
          </div>
          <div className="space-y-6">
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Company Legal Name</label>
               <Input 
                 placeholder="e.g. Acme Industries Ltd" 
                 value={entityName} 
                 onChange={(e) => setEntityName(e.target.value)} 
                 className="rounded-2xl h-14 bg-slate-50 border-slate-200 text-base px-4 focus-visible:ring-blue-600" 
               />
             </div>
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Registration Number</label>
               <Input 
                 placeholder="e.g. UK-9830492" 
                 value={corpRegNumber} 
                 onChange={(e) => setCorpRegNumber(e.target.value)} 
                 className="rounded-2xl h-14 bg-slate-50 border-slate-200 text-base px-4 focus-visible:ring-blue-600" 
               />
             </div>
          </div>
          <div className="flex gap-4 mt-10">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-base" onClick={() => setIsCorpModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base" onClick={() => { setIsCorpModalOpen(false); setActiveScreeningType('corporate'); }}>Start Verification</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeScreeningType === 'corporate'} onOpenChange={(open) => !open && setActiveScreeningType(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
             <RefreshCw className="w-10 h-10 animate-spin" />
           </div>
           <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Compliance Screening Active</h2>
           <p className="text-sm font-medium text-slate-500 mb-10">Analyzing input parameters & routing targets...</p>
           
           <div className="w-full space-y-3 mb-10">
             <div className="flex justify-between text-sm font-bold">
               <span className="text-slate-500">Verification progress</span>
               <span className="text-blue-600">{progress}%</span>
             </div>
             <Progress value={progress} className="h-2.5 bg-blue-100" />
           </div>
           
           <div className="w-full">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Engine Execution Steps</p>
             <ul className="space-y-4">
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 0) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 0) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 0) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 0) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Establish Registrar Connection
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 25) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 25) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 25) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 25) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Fetch Directors & Officers Roster
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 50) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 50) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 50) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 50) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Audit Filing History Details
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 75) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 75) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 75) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 75) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Verify Shareholder Equity Stakes
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 100) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 100) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 100) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 100) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Verdict Authentication
               </li>
             </ul>
           </div>
           
           <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">SENTINEL COMPLIANCE ENGINE</p>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCorpVerificationComplete} onOpenChange={setIsCorpVerificationComplete}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Verification Complete</h2>
           <p className="text-xs text-blue-600 uppercase tracking-widest mb-8 font-bold">SENTINEL COMPLIANCE ENGINE</p>
           
           <div className="w-full bg-slate-50 rounded-3xl p-6 space-y-5 mb-8 border border-slate-100">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Record ID</span>
               <span className="font-bold text-slate-900">REG-5992</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Target Entity</span>
               <span className="font-bold text-slate-900">{entityName || 'Acme'}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Status Verdict</span>
               <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 py-1 shadow-none border-none font-bold">Verified</Badge>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Reg Number</span>
               <span className="font-bold text-slate-900">{corpRegNumber || 'UK-389909'}</span>
             </div>
             
             <div className="pt-5 border-t border-slate-200">
               <p className="text-xs text-slate-500 italic font-medium leading-relaxed">Entity successfully queried in UK corporate register.</p>
             </div>
           </div>
           
           <Button className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20" onClick={() => {
             setIsCorpVerificationComplete(false);
             setDossier({name: entityName || 'Acme', type: 'corporate', id: 'REG-5992'});
             setEntityName("");
             setCorpRegNumber("");
           }}>
             Go to Detailed Dossier View <ArrowRight className="w-5 h-5 ml-2" />
           </Button>
        </DialogContent>
      </Dialog>

      {/* -------------------- DOC MODALS -------------------- */}
      <Dialog open={isDocModalOpen} onOpenChange={setIsDocModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-8 bg-white border-slate-200 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">Start Identity Document Verification</h2>
          </div>
          <div className="space-y-6">
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Applicant Full Name</label>
               <Input 
                 placeholder="e.g. John Doe" 
                 value={entityName} 
                 onChange={(e) => setEntityName(e.target.value)} 
                 className="rounded-2xl h-14 bg-slate-50 border-slate-200 text-base px-4 focus-visible:ring-blue-600" 
               />
             </div>
             <div>
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Identity Document Type</label>
               <select 
                 value={docType}
                 onChange={(e) => setDocType(e.target.value)}
                 className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600"
               >
                 <option>Passport (GBR)</option>
                 <option>National ID</option>
                 <option>Driver's License</option>
               </select>
             </div>
             <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <Fingerprint className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-sm font-bold text-slate-700 mb-1">Selfie & ID Photo Attachment</p>
                <p className="text-xs text-slate-500 font-medium">Drag & drop files or click to browse</p>
             </div>
          </div>
          <div className="flex gap-4 mt-10">
            <Button variant="outline" className="flex-1 rounded-2xl h-14 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-base" onClick={() => setIsDocModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base" onClick={() => { setIsDocModalOpen(false); setActiveScreeningType('document'); }}>Start Verification</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeScreeningType === 'document'} onOpenChange={(open) => !open && setActiveScreeningType(null)}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8">
             <RefreshCw className="w-10 h-10 animate-spin" />
           </div>
           <h2 className="text-2xl font-extrabold mb-3 text-slate-900">Compliance Screening Active</h2>
           <p className="text-sm font-medium text-slate-500 mb-10">Analyzing input parameters & routing targets...</p>
           
           <div className="w-full space-y-3 mb-10">
             <div className="flex justify-between text-sm font-bold">
               <span className="text-slate-500">Verification progress</span>
               <span className="text-blue-600">{progress}%</span>
             </div>
             <Progress value={progress} className="h-2.5 bg-blue-100" />
           </div>
           
           <div className="w-full">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Engine Execution Steps</p>
             <ul className="space-y-4">
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 0) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 0) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 0) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 0) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Extract OCR Document Text Payload
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 25) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 25) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 25) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 25) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Run Face Biometric Liveness Match
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 50) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 50) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 50) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 50) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Evaluate Device Location Signals
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 75) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 75) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 75) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 75) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Verify Security Authentication Keys
               </li>
               <li className={`flex items-center gap-4 text-sm font-semibold ${getStepStatus(progress, 100) === 'complete' ? 'text-emerald-600' : getStepStatus(progress, 100) === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>
                 {getStepStatus(progress, 100) === 'complete' ? <CheckCircle2 className="w-5 h-5" /> : getStepStatus(progress, 100) === 'active' ? <RefreshCw className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300" />} Verdict Authentication
               </li>
             </ul>
           </div>
           
           <div className="mt-10 pt-6 border-t border-slate-100 w-full text-center">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">SENTINEL COMPLIANCE ENGINE</p>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDocVerificationComplete} onOpenChange={setIsDocVerificationComplete}>
        <DialogContent className="sm:max-w-md rounded-[2rem] p-10 flex flex-col items-center bg-white border-slate-200 shadow-2xl">
           <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-extrabold mb-2 text-slate-900">Verification Complete</h2>
           <p className="text-xs text-blue-600 uppercase tracking-widest mb-8 font-bold">SENTINEL COMPLIANCE ENGINE</p>
           
           <div className="w-full bg-slate-50 rounded-3xl p-6 space-y-5 mb-8 border border-slate-100">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Record ID</span>
               <span className="font-bold text-slate-900">DOC-6110</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Target Entity</span>
               <span className="font-bold text-slate-900">{entityName || 'John'}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500 font-medium">Status Verdict</span>
               <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 py-1 shadow-none border-none font-bold">Approved</Badge>
             </div>
             
             <div className="pt-5 border-t border-slate-200">
               <p className="text-xs text-slate-500 italic font-medium leading-relaxed">ID document scanned and face biometric validation successfully matched.</p>
             </div>
           </div>
           
           <Button className="w-full rounded-2xl h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20" onClick={() => {
             setIsDocVerificationComplete(false);
             setDossier({name: entityName || 'John', type: 'document', id: 'DOC-6110'});
             setEntityName("");
           }}>
             Go to Detailed Dossier View <ArrowRight className="w-5 h-5 ml-2" />
           </Button>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
