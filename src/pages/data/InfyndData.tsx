import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Database, Search, Download, RefreshCw, FileText, FileSpreadsheet, Server, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DataPreviewModal } from '@/components/data/DataPreviewModal';

type EntityRecord = {
  id: string;
  entity: string;
  sourceType: 'pdf' | 'csv-excel' | 'docs' | 'api';
  sourceName: string;
  confidence: number;
  contextSnippet: string;
  timestamp: Date;
  records: string;
  usedBy: string;
  schema: string[];
};

const initialRecords: EntityRecord[] = [
  { id: "1", entity: "Oleg Deripaska", sourceType: "pdf", sourceName: "Global_Sanctions_List_Update.pdf", confidence: 99, contextSnippet: "...added to the OFAC SDN list under executive order...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), records: "842", usedBy: "KYC/AML Screenings", schema: ["Text Content", "Named Entities"] },
  { id: "2", entity: "Mirage Financial Corp", sourceType: "csv-excel", sourceName: "Historical_SAR_Filings_2023.csv", confidence: 94, contextSnippet: "Multiple structuring events reported by teller 04...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), records: "4,291", usedBy: "Transaction Monitoring", schema: ["Structured Data", "Financial Metadata"] },
  { id: "3", entity: "John Doe", sourceType: "api", sourceName: "Core Banking API", confidence: 88, contextSnippet: "Account 4091929 flagged for velocity limits...", timestamp: new Date(Date.now() - 1000 * 60 * 30), records: "15,820", usedBy: "Behavioral Analytics", schema: ["API JSON", "Transaction History"] },
  { id: "4", entity: "Nexus Shell LLC", sourceType: "docs", sourceName: "Internal_Compliance_Policy_v4.docx", confidence: 91, contextSnippet: "Refer to section 4.1 regarding entities like Nexus Shell...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), records: "1", usedBy: "Document Analysis Rules", schema: ["Text Content", "Metadata"] },
];

const RecordCard = ({ record, getIcon, setPreviewFile, toast, navigate }: any) => {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="bg-white border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] rounded-2xl p-5 hover:shadow-md transition-shadow relative group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-5">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100/50 text-indigo-500 rounded-xl mt-0.5">
            {getIcon(record.sourceType)}
          </div>
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-[16px] flex items-center gap-3">
              {record.entity}
              <Badge variant="outline" className={isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide shrink-0" : "bg-slate-50 text-slate-500 border-slate-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide shrink-0"}>
                {isActive ? 'Active' : 'Paused'}
              </Badge>
              <Badge variant="outline" className={record.confidence > 90 ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide" : "bg-amber-50 text-amber-600 border-amber-200/50 font-bold px-2 py-0 text-[10px] uppercase tracking-wide"}>
                {record.confidence}% Match
              </Badge>
            </h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500 font-medium">
              <span className="uppercase text-slate-600">{record.sourceType}</span>
              <span className="text-slate-300">•</span>
              <span>{formatDistanceToNow(record.timestamp)} ago</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-500 font-bold bg-indigo-50 px-2 rounded-md">{record.records} records</span>
            </div>
            <div className="mt-1.5 text-[11px] font-mono text-slate-400 flex items-center gap-1 uppercase">
              Source: {record.sourceName}
            </div>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-4">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Preview Data" onClick={() => setPreviewFile({ name: record.sourceName, records: record.records })}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Entity" onClick={() => toast({ title: "Entity Deleted", description: `${record.entity} has been removed from the index.` })}>
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="hidden md:block w-px h-8 bg-slate-100 mx-2"></div>
          <div className="flex items-center gap-3 px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isActive ? 'ON' : 'OFF'}</span>
            <Switch 
              checked={isActive}
              className="data-[state=checked]:bg-[#10B981]"
              onCheckedChange={(checked) => {
                setIsActive(checked);
                toast({ title: checked ? "Monitoring Activated" : "Monitoring Paused", description: `${record.entity} status updated.` });
              }} 
            />
          </div>
          </div>
        </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Used by</span>
          <p className="text-[14px] font-semibold text-slate-700 mt-1.5 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">{record.usedBy}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Schema</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {record.schema.map((s: string) => (
              <Badge key={s} variant="outline" className="text-slate-500 bg-slate-50 border-slate-200 font-medium text-[12px] px-2">{s}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const InfyndData = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [unifiedRecords, setUnifiedRecords] = useState<EntityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState<{name: string, records: string} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUnifiedRecords(initialRecords);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'csv-excel': return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
      case 'docs': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'api': return <Server className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">InFynd Data Index</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Access the proprietary global database provided by InFynd for advanced compliance checks.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden flex flex-col relative">
            <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  InFynd Global Database
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time access to millions of verified corporate entities, PEPs, and sanctions lists provided by InFynd.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-64">
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
            
            <div className="p-6 bg-slate-50/30">
              {isLoading ? (
                <div className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
                  Loading Master Index...
                </div>
              ) : unifiedRecords.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No records found.</div>
              ) : (
                <div className="space-y-4">
                  {unifiedRecords
                    .filter(r => 
                      r.entity.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      r.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.contextSnippet.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(record => (
                      <RecordCard 
                        key={record.id} 
                        record={record} 
                        getIcon={getIcon} 
                        setPreviewFile={setPreviewFile} 
                        toast={toast} 
                        navigate={navigate} 
                      />
                    ))}
                </div>
              )}
            </div>
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
};
export default InfyndData;
