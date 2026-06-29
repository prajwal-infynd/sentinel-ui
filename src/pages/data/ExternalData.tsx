import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, UploadCloud, Server, Key, File, Eye, Trash2, Database, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataPreviewModal } from '@/components/data/DataPreviewModal';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const DataSourceCard = ({ file, setPreviewFile, toast, navigate }: any) => {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="bg-white border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Icon & Details */}
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 text-indigo-500 rounded-xl shrink-0 mt-0.5">
             {file.type === 'pdf' ? <FileText className="h-6 w-6 text-red-400" /> : file.type === 'api' ? <Server className="h-6 w-6 text-indigo-500" /> : <FileSpreadsheet className="h-6 w-6 text-emerald-400" />}
          </div>
          <div className="space-y-1.5 min-w-0">
            <h4 className="font-bold text-slate-800 text-[16px] flex items-center gap-3 truncate">
              <span className="truncate">{file.name}</span>
              <Badge variant="outline" className={isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide shrink-0" : "bg-slate-50 text-slate-500 border-slate-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide shrink-0"}>
                {isActive ? 'Active' : 'Paused'}
              </Badge>
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500 font-medium">
              <span className="uppercase text-slate-600">{file.type}</span>
              <span className="text-slate-300">•</span>
              <span>{file.size}</span>
              <span className="text-slate-300">•</span>
              <span>{file.date}</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-500 font-bold bg-indigo-50 px-2 rounded-md">{file.records} records</span>
              <span className="text-slate-300">•</span>
              <span className={`font-bold px-2 rounded-md ${
                parseInt(file.reliability) >= 90 ? 'text-emerald-600 bg-emerald-50' : 
                parseInt(file.reliability) >= 70 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
              }`}>Trust Score: {file.reliability}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Database className="h-3 w-3" /> SCHEMA:
              </div>
              <div className="flex flex-wrap gap-3">
                {file.schema.map((s: string) => (
                  <span key={s} className="text-[12px] font-mono text-slate-500 bg-slate-50 px-1.5 rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle: Policy & Used By */}
        <div className="flex flex-col lg:items-start gap-3 w-64 lg:w-72 shrink-0 lg:pl-4 border-l border-slate-100">
          <div className="w-full">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Platform Utilization</h5>
            <div className="space-y-1.5 w-full">
              {file.utilization.map((use: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded w-full">
                  <LinkIcon className="h-3 w-3 text-slate-400 shrink-0" /> 
                  <span className="truncate">{use}</span>
                </div>
              ))}
            </div>
          </div>
          <Button 
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold px-4 py-1.5 h-auto rounded-full w-fit shadow-sm shadow-blue-500/20 mt-1"
            onClick={() => navigate(`/policy?source=${encodeURIComponent(file.name)}`)}
          >
            Configure Policy Links
          </Button>
        </div>

        {/* Right: Toggle & Actions */}
        <div className="flex flex-col items-center justify-center gap-2 shrink-0 lg:pl-4 min-w-[80px]">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{isActive ? 'ON' : 'OFF'}</span>
          <Switch 
            checked={isActive}
            className="data-[state=checked]:bg-[#10B981]"
            onCheckedChange={(checked) => {
              setIsActive(checked);
              toast({ title: checked ? "Source Activated" : "Source Paused", description: `Indexing for ${file.name} updated.` });
            }} 
          />
        </div>
        
        {/* Hover Actions (Absolute on right edge) */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 group-hover:-right-6 transition-all bg-white/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-100 shadow-lg z-10">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Preview Data" onClick={() => setPreviewFile({ name: file.name, records: file.records })}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Source" onClick={() => toast({ title: "Source Deleted", description: `${file.name} has been removed.` })}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export const ExternalData = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [previewFile, setPreviewFile] = useState<{name: string, records: string} | null>(null);
  const [activeTab, setActiveTab] = useState("All");

  const mockFiles = [
    { name: "Historical_SAR_Filings_2023.csv", type: "csv-excel", size: "14.2 MB", date: "2 hrs ago", status: "Active", records: "15,420", reliability: "98%", utilization: ["Global KYB Thresholds Policy", "Investigator Swarm Agent"], schema: ["TransactionID", "Amount", "RiskScore"] },
    { name: "KYB_Compliance_Policy_V4.pdf", type: "pdf", size: "2.1 MB", date: "5 hrs ago", status: "Active", records: "1", reliability: "100%", utilization: ["Document Analysis Rules", "Skeptic Defense Agent"], schema: ["Text Content", "Metadata"] },
    { name: "Core Banking Customer API", type: "api", size: "Live", date: "1 min ago", status: "Active", records: "8,400,000", reliability: "85%", utilization: ["Real-time Tx Monitoring", "Anomaly Detection Engine"], schema: ["CustomerID", "Balance", "KYBStatus"] }
  ];

  const tabs = ["All", "PDF", "CSV/Excel", "Docs", "API"];



  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 leading-tight">External Data Sources</h1>
            <p className="text-[15px] text-slate-500 mt-1 font-medium">Train the AI by uploading historical records, policies, and connecting internal data APIs.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* New Data Source Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white gap-2 font-semibold shadow-sm h-11 px-5 rounded-xl">
                  <UploadCloud className="h-5 w-5" /> New Data Source
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined} className="max-w-xl p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Add New Data Source</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="border-2 border-dashed border-indigo-200/60 rounded-2xl bg-indigo-50/30 p-10 flex flex-col items-center justify-center hover:bg-indigo-50/60 hover:border-indigo-400 transition-all cursor-pointer relative group">
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.csv,.xlsx,.txt" onChange={(e) => e.target.files && toast({ title: "Upload Started", description: `File ${e.target.files[0].name} is being ingested.` })} />
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                      <UploadCloud className="h-6 w-6 text-indigo-500" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">Drag & Drop Documents</h4>
                    <p className="text-sm text-slate-500 text-center">Supports PDF, CSV, Excel, DOCX</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-white px-3 text-slate-400">Or manual entry</span></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Manually Enter Entity Name</label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. Acme Corp or John Doe" className="flex-1 h-11 bg-slate-50" />
                      <Button className="bg-slate-900 text-white h-11 px-6 font-bold" onClick={() => toast({ title: "Entity Added", description: "Manual entity has been added for tracking." })}>Add Entity</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Connect API Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm bg-white text-slate-700 font-semibold border-slate-200 h-11 px-5 rounded-xl">
                  <Database className="h-4 w-4 text-slate-400" /> Connect API
                </Button>
              </DialogTrigger>
              <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                  <DialogTitle>Connect Internal API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2"><label className="text-sm font-medium">Source Name</label><Input placeholder="e.g. Core Banking System" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Endpoint URL</label><Input placeholder="https://api.internal-bank.com/v1/customers" /></div>
                  <div className="space-y-2"><label className="text-sm font-medium">Auth Token</label>
                    <div className="relative"><Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="password" placeholder="sk_live_..." className="pl-9" /></div>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => toast({ title: "Stream Connected", description: "API data source has been connected." })}>Connect Data Stream</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">Indexed Data Sources</h3>
            <div className="flex items-center gap-6 text-[15px] font-semibold text-slate-400">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`hover:text-slate-900 transition-colors ${activeTab === tab ? 'text-slate-900' : ''}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 relative">
            {mockFiles.filter(file => {
              if (activeTab === "All") return true;
              if (activeTab === "PDF") return file.type === "pdf";
              if (activeTab === "CSV/Excel") return file.type === "csv-excel";
              if (activeTab === "Docs") return file.type === "docs";
              if (activeTab === "API") return file.type === "api";
              return true;
            }).map((file, i) => (
              <DataSourceCard key={`${file.name}-${i}`} file={file} setPreviewFile={setPreviewFile} toast={toast} navigate={navigate} />
            ))}
          </div>
        </motion.div>
      </div>
      
      <DataPreviewModal 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        fileName={previewFile?.name || ''} 
        totalRecords={previewFile?.records} 
      />
    </DashboardLayout>
  );
};export default ExternalData;
