import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, FileJson, ArrowRight, ShieldCheck, Database, AlertCircle, Wand2, Keyboard, Plus, Search, Clock, History, Link as LinkIcon, Cloud, Settings2, Download } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KybMonitorModal } from "@/components/portfolio/KybMonitorModal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { importMonitoredEntities, fetchSamplePreview, type MonitoredEntityImportRow } from "@/lib/dashboard-data";
import { runMediaAgent } from "@/lib/media-agent-data";
import { Company360Modal } from "@/components/Company360Modal";

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const splitMultiValue = (value: unknown) =>
  typeof value === "string"
    ? value.split(/[|,;]+/).map((item) => item.trim()).filter(Boolean)
    : Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : [];

const parseDateValue = (value: unknown) => {
  if (!value) return null;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return `${parsed.y.toString().padStart(4, "0")}-${parsed.m.toString().padStart(2, "0")}-${parsed.d.toString().padStart(2, "0")}`;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const mapEntityType = (value: unknown) => {
  const normalized = String(value ?? "company").trim().toLowerCase();
  if (["individual", "person", "naturalperson"].includes(normalized)) return "individual";
  if (["company", "corporate", "corporation", "business", "entity"].includes(normalized)) return "company";
  if (["vessel", "ship"].includes(normalized)) return "vessel";
  if (["asset", "property"].includes(normalized)) return "asset";
  return "other";
};

const toImportRow = (rawRow: Record<string, unknown>): MonitoredEntityImportRow | null => {
  const sourceRow = rawRow.masterEntityProfile ? (rawRow.masterEntityProfile as Record<string, unknown>) : rawRow;
  
  const row = Object.entries(sourceRow).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});

  const name = row.name ?? row.entityname ?? row.customername ?? row.fullname ?? row.legalname ?? row.clearbitname ?? row.namefromtitle ?? row.companyname;
  if (!name || !String(name).trim()) return null;

  const riskValue = row.riskscore ?? row.risk ?? row.risksegment;
  const riskScore = typeof riskValue === "number" ? riskValue : Number.parseFloat(String(riskValue ?? ""));

  return {
    name: String(name).trim(),
    entityType: mapEntityType(row.entitytype ?? row.type),
    jurisdiction: String(row.jurisdiction ?? row.country ?? row.countryofincorporation ?? "").trim() || null,
    nationality: String(row.nationality ?? "").trim() || null,
    dateOfBirth: parseDateValue(row.dateofbirth ?? row.dob ?? row.incorporationdate ?? row.birthdate),
    externalReference: String(row.customerid ?? row.id ?? row.externalreference ?? row.regno ?? row.registrationnumber ?? "").trim() || null,
    aliases: splitMultiValue(row.aliases ?? row.alias),
    watchlistMemberships: splitMultiValue(row.watchlistmemberships ?? row.watchlists ?? row.watchlist),
    riskScore: Number.isFinite(riskScore) ? riskScore : 0,
    notes: String(row.notes ?? row.comment ?? "").trim() || null,
    identifiers: {
      registration_number: String(row.registrationnumber ?? row.regno ?? "").trim() || undefined,
      country: String(row.country ?? "").trim() || undefined,
    },
  };
};

const parseFile = async (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    const text = await file.text();
    const parsed = JSON.parse(text) as unknown;
    
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && !("data" in parsed) && !("entities" in parsed)) {
      return [parsed as Record<string, unknown>];
    }
    
    const rows = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { entities?: unknown[] }).entities)
        ? (parsed as { entities: unknown[] }).entities
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { data?: unknown[] }).data)
        ? (parsed as { data: unknown[] }).data
        : [];
    return rows.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object" && !Array.isArray(row));
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
};

const PortfolioOnboarding = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  // Modal State
  const [selectedCompany360, setSelectedCompany360] = useState<string | null>(null);

  const [importedDataRows, setImportedDataRows] = useState<MonitoredEntityImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isCrmDialogOpen, setIsCrmDialogOpen] = useState(false);
  const [selectedCrmEntities, setSelectedCrmEntities] = useState<string[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState(0);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [selectedKybEntity, setSelectedKybEntity] = useState<any>(null);

  const [monitoringFrequency, setMonitoringFrequency] = useState("daily");
  const [pushLiveAlerts, setPushLiveAlerts] = useState(false);
  const [dataSources, setDataSources] = useState({
    ofac: true,
    adverseMedia: true,
    pep: true,
    sanctions: true
  });
  
  const [mockUploadHistory] = useState([
    { id: 1, name: "Q3_Client_List_APAC.csv", date: "2026-06-28 09:30 AM", entities: 1450, user: "Sarah K.", status: "Active" },
    { id: 2, name: "EMEA_Vendors_Batch1.json", date: "2026-06-25 02:15 PM", entities: 320, user: "Admin", status: "Active" },
    { id: 3, name: "High_Risk_Prospects.xlsx", date: "2026-06-20 11:45 AM", entities: 85, user: "Michael R.", status: "Archived" }
  ]);

  const [manualEntityName, setManualEntityName] = useState("");
  const [manualEntityType, setManualEntityType] = useState("");
  const [manualJurisdiction, setManualJurisdiction] = useState("");
  
  const [isCrawlerDialogOpen, setIsCrawlerDialogOpen] = useState(false);
  const [crawlerCompanyName, setCrawlerCompanyName] = useState("");
  const [crawlerCompanyDomain, setCrawlerCompanyDomain] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);

  const handleCrawlerSubmit = async () => {
    if (!crawlerCompanyName && !crawlerCompanyDomain) {
      toast({ title: "Input Required", description: "Please provide either a company name or domain.", variant: "destructive" });
      return;
    }
    
    setIsCrawling(true);
    try {
      let finalDomain = crawlerCompanyDomain;
      if (!finalDomain && crawlerCompanyName) {
        finalDomain = crawlerCompanyName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
      }

      const payload: any = {
        domains: finalDomain ? [finalDomain] : []
      };
      
      if (crawlerCompanyName) {
        payload.company_name = crawlerCompanyName;
      }
      
      const crawlerUrl = import.meta.env.VITE_CRAWLER_API_URL || "http://173.249.56.10:1234/api/v1/crawler/extract-company-info";
      
      const response = await fetch(crawlerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Crawler API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log("CRAWLER PAYLOAD RECEIVED:", data);
      
      // Automatically download the JSON payload
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(crawlerCompanyName || crawlerCompanyDomain || "company").replace(/[^a-z0-9]/gi, '_').toLowerCase()}-payload.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ 
        title: "Crawler Finished", 
        description: `Successfully extracted data for ${crawlerCompanyName || crawlerCompanyDomain}. The JSON payload has been downloaded.` 
      });
      
      setIsCrawlerDialogOpen(false);
      setCrawlerCompanyName("");
      setCrawlerCompanyDomain("");
      
      let newEntities: MonitoredEntityImportRow[] = [];
      const extractedList = Array.isArray(data.data) ? data.data : (Array.isArray(data.entities) ? data.entities : null);
      
      if (extractedList && extractedList.length > 0) {
        newEntities = extractedList.map((e: any, idx: number) => {
          // Support the actual API payload structure
          if (e.normalizedDomain || e.ipCountry) {
            return {
              name: e.clearbitName || e.nameFromTitle || e.companyName || crawlerCompanyName || crawlerCompanyDomain || "Unknown Entity",
              entityType: "company",
              jurisdiction: e.ipCountry || "Unknown",
              riskScore: 25,
              externalReference: e.normalizedDomain || `CRAWL-${Date.now()}-${idx}`,
              notes: e.description || ""
            };
          }
          
          // Support the mock payload structure
          const profile = e.masterEntityProfile || {};
          return {
            name: profile.fullName || crawlerCompanyName || crawlerCompanyDomain || "Unknown Entity",
            entityType: "company",
            jurisdiction: profile.jurisdiction || "Unknown",
            riskScore: profile.financials?.revenue ? 45 : 20,
            externalReference: `CRAWL-${Date.now()}-${idx}`,
            notes: profile.aboutCompany?.brief || ""
          };
        });
      } else {
        newEntities = [{
          name: crawlerCompanyName || crawlerCompanyDomain || "Unknown Entity",
          entityType: "company",
          jurisdiction: "Pending API",
          riskScore: 0,
          externalReference: `CRAWL-${Date.now()}`
        }];
      }
      
      setImportedDataRows(prev => [...newEntities, ...prev]);
      
    } catch (error) {
      toast({ title: "Crawler Failed", description: error instanceof Error ? error.message : "Network error", variant: "destructive" });
    } finally {
      setIsCrawling(false);
    }
  };
  
  const handleAddManualEntity = () => {
    if (!manualEntityName) {
      toast({ title: "Name Required", description: "Please provide the entity name.", variant: "destructive" });
      return;
    }
    const newEntity: MonitoredEntityImportRow = {
      name: manualEntityName,
      entityType: manualEntityType || "company",
      jurisdiction: manualJurisdiction || "Unknown",
      riskScore: 50,
      externalReference: `MANUAL-${Date.now()}`
    };
    setImportedDataRows(prev => [newEntity, ...prev]);
    toast({ title: "Entity Added", description: `${manualEntityName} has been added to the queue.` });
    setManualEntityName("");
    setManualEntityType("");
    setManualJurisdiction("");
  };
  const mockCompaniesData = [
    { id: 1, name: "Xbox (Microsoft Corporation)", country: "United States", industry: "Technology - Software & Cloud Computing", riskScore: 58, rating: "BBB", exposure: "£281700.0M", lastChange: "6/23/2026", alert: "Low", flag: "🇺🇸", initial: "X" },
    { id: 2, name: "Wise", country: "United Kingdom", industry: "N/A", riskScore: 82, rating: "CCC", exposure: "—", lastChange: "10/15/2025", alert: "Critical", flag: "🇬🇧", initial: "W" },
    { id: 3, name: "The Weir Group PLC", country: "United Kingdom", industry: "Industrials - Mining Equipment & Technology", riskScore: 47.54, rating: "BBB", exposure: "£2506.0M", lastChange: "1/27/2025", alert: "Low", flag: "🇬🇧", initial: "T" },
    { id: 4, name: "Videndum plc", country: "United States", industry: "N/A", riskScore: 88, rating: "CCC", exposure: "£228.3M", lastChange: "6/23/2026", alert: "Critical", flag: "🇺🇸", initial: "V" },
    { id: 5, name: "Thames Water Utilities Limited", country: "United Kingdom", industry: "Utilities - Water & Wastewater Services", riskScore: 88.2, rating: "CCC", exposure: "£2700.0M", lastChange: "6/17/2025", alert: "Critical", flag: "🇬🇧", initial: "T" },
    { id: 6, name: "Spirit Airlines, Inc.", country: "United States", industry: "Industrials - Airlines (Ultra-Low-Cost Carrier)", riskScore: 95.05, rating: "CCC", exposure: "£5360.0M", lastChange: "6/23/2026", alert: "Critical", flag: "🇺🇸", initial: "S" },
    { id: 7, name: "Space Exploration Technologies Corp.", country: "United States", industry: "Aerospace & Defense - Space Launch & Satellite Communications", riskScore: 33.7, rating: "AA", exposure: "£14020.0M", lastChange: "6/18/2025", alert: "Medium", flag: "🇺🇸", initial: "S" },
    { id: 8, name: "Rolls-Royce Motor Cars Limited", country: "United Kingdom", industry: "Consumer Discretionary - Ultra-Luxury Automobiles", riskScore: 28, rating: "AA", exposure: "£978.9M", lastChange: "6/23/2026", alert: "Medium", flag: "🇬🇧", initial: "R" },
    { id: 9, name: "Rathbones Group Plc", country: "United Kingdom", industry: "Financials - Wealth & Asset Management", riskScore: 46, rating: "BBB", exposure: "£1020.0M", lastChange: "6/23/2026", alert: "Low", flag: "🇬🇧", initial: "R" },
    { id: 10, name: "Pizza Hut, LLC", country: "United States", industry: "Consumer Discretionary - Quick-Service Restaurants (QSR)", riskScore: 58, rating: "BBB", exposure: "£7549.0M", lastChange: "6/23/2026", alert: "Low", flag: "🇺🇸", initial: "P" },
  ];

  const loadMockData = () => {
    setSelectedFileName("demo-portfolio-Q3.csv");
    setImportedDataRows([
      { name: "Acme Corp", entityType: "company", jurisdiction: "United Kingdom", riskScore: 85, externalReference: "C-10492" },
      { name: "John Doe", entityType: "individual", jurisdiction: "United States", riskScore: 42, externalReference: "I-93910" },
      { name: "Globex Industries", entityType: "company", jurisdiction: "Singapore", riskScore: 12, externalReference: "C-10493" },
      { name: "Sarah Connor", entityType: "individual", jurisdiction: "Mexico", riskScore: 68, externalReference: "I-93911" },
      { name: "Stark Industries", entityType: "company", jurisdiction: "United States", riskScore: 94, externalReference: "C-10494" },
    ] as any[]);
  };

  const handleStartMonitoring = () => {
    setIsOrchestrating(true);
    setOrchestrationStep(0);
    
    // Simulate orchestration steps
    setTimeout(() => setOrchestrationStep(1), 800);
    setTimeout(() => setOrchestrationStep(2), 2000);
    setTimeout(() => setOrchestrationStep(3), 3200);
    setTimeout(() => setOrchestrationStep(4), 4500);
    
    // Fire actual mutation after simulation
    setTimeout(() => {
      importMutation.mutate();
    }, 5500);
  };

  const { data: sampleRows = [] } = useQuery({ queryKey: ["portfolio-sample"], queryFn: fetchSamplePreview });

  const previewRows = useMemo(() => {
    if (!importedDataRows.length) return sampleRows;
    return importedDataRows.slice(0, 6).map((row, index) => ({
      id: row.externalReference ?? `ROW-${String(index + 1).padStart(4, "0")}`,
      name: row.name,
      type: row.entityType === "individual" ? "Individual" : row.entityType === "company" ? "Company" : row.entityType ?? "Other",
      dob: row.dateOfBirth ?? "—",
      country: row.jurisdiction ?? row.nationality ?? "—",
      risk:
        Number(row.riskScore ?? 0) >= 80 ? "Critical" : Number(row.riskScore ?? 0) >= 60 ? "High" : Number(row.riskScore ?? 0) >= 35 ? "Medium" : "Low",
      onboarded: "Pending",
    }));
  }, [importedDataRows, sampleRows]);

  const importMutation = useMutation({
    mutationFn: async () => {
      const result = await importMonitoredEntities(importedDataRows);
      const agentResult = await runMediaAgent();
      return { ...result, agentResult };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-entities"] }),
        queryClient.invalidateQueries({ queryKey: ["media-dashboard-summary"] }),
        queryClient.invalidateQueries({ queryKey: ["media-dashboard-articles"] }),
        queryClient.invalidateQueries({ queryKey: ["media-dashboard-activities"] }),
        queryClient.invalidateQueries({ queryKey: ["media-dashboard-signals"] }),
        queryClient.invalidateQueries({ queryKey: ["media-dashboard-categories"] }),
        queryClient.invalidateQueries({ queryKey: ["media-live-alerts"] }),
      ]);

      toast({
        title: "Monitoring activated",
        description: `${result.imported} entities imported and the AI agents have started a monitoring cycle.`,
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Import failed", description: error.message, variant: "destructive" });
    },
  });

  const handleFile = async (file: File) => {
    try {
      setParseError(null);
      setSelectedFileName(file.name);
      const rows = await parseFile(file);
      const mapped = rows.map(toImportRow).filter((row): row is MonitoredEntityImportRow => Boolean(row));

      if (!mapped.length) {
        setImportedDataRows([]);
        setParseError("No valid entity rows were found. Include a name column such as Name, Entity Name, or Customer Name.");
        return;
      }

      setImportedDataRows(mapped);
      toast({ title: "File parsed", description: `${mapped.length} monitored entities are ready for import.` });
    } catch (error) {
      setImportedDataRows([]);
      setParseError(error instanceof Error ? error.message : "The selected file could not be parsed.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F9FC] font-sans pb-12 text-slate-800">
        
        {/* Main Content Area */}
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Monitor Customers</h1>
            <p className="text-[14px] text-slate-500 max-w-4xl leading-relaxed">
              An AI-powered risk analyst continuously monitoring every customer on your portfolio — proactively telling you what matters before it becomes a problem.
            </p>
          </div>
          
          {/* Add Companies Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between shadow-sm">
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 mb-0.5 tracking-tight">Add companies to monitor</h2>
                  <p className="text-[12.5px] text-slate-500">Bulk import, search, or sync from your CRM</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
                  <Button variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><FileSpreadsheet className="h-4 w-4 text-slate-400" /> CSV</Button>
                  <Button variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><FileJson className="h-4 w-4 text-slate-400" /> Excel</Button>
                  <Button onClick={() => setIsCrmDialogOpen(true)} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><Cloud className="h-4 w-4 text-slate-400" /> CRM</Button>
                  <Button onClick={() => setIsApiDialogOpen(true)} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><LinkIcon className="h-4 w-4 text-slate-400" /> API</Button>
                  <Button onClick={() => setIsCrawlerDialogOpen(true)} className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm text-[13px] rounded-lg px-5 ml-1"><Plus className="h-4 w-4" /> Add Company</Button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-2 rounded-xl border border-slate-200/60 shadow-sm">
                <div className="relative flex-1 min-w-[200px] border-r border-slate-100 pr-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search companies..." className="pl-9 bg-transparent border-0 h-10 w-full focus-visible:ring-0 text-[13px] placeholder:text-slate-400 shadow-none" />
                </div>
                
                <Select defaultValue="all-risks">
                  <SelectTrigger className="w-[180px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Risk Level:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-risks" className="text-[13px] font-medium">All Risks</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-ratings">
                  <SelectTrigger className="w-[180px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Rating:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-ratings" className="text-[13px] font-medium">All Ratings</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-exposures">
                  <SelectTrigger className="w-[200px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Exposure:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-exposures" className="text-[13px] font-medium">All Exposures</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all-severities">
                  <SelectTrigger className="w-[190px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 pr-2">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Alerts:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-severities" className="text-[13px] font-medium">All Severities</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200/80">
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 pl-6">S.No</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">Company</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">Country</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">Industry</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center">Risk Score</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center">Rating</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-right">Exposure</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-right pr-6">Last Change</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center pr-6">Alert</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockCompaniesData.map((row) => (
                        <TableRow key={row.id} className="hover:bg-slate-50/60 border-b border-slate-100/80 transition-colors group">
                          <TableCell className="py-4 pl-6 text-[12.5px] font-semibold text-slate-400">{row.id}</TableCell>
                          
                          {/* Company */}
                          <TableCell className="py-4 cursor-pointer" onClick={() => setSelectedCompany360(row.name)}>
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
                                {row.initial}
                              </div>
                              <span className="text-[13px] font-bold text-blue-600 hover:text-blue-800">{row.name}</span>
                            </div>
                          </TableCell>

                          {/* Country */}
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{row.flag}</span>
                              <span className="text-[13px] font-medium text-slate-600">{row.country}</span>
                            </div>
                          </TableCell>

                          {/* Industry */}
                          <TableCell className="py-4 text-[13px] font-medium text-slate-500 max-w-[200px] truncate">
                            {row.industry}
                          </TableCell>

                          {/* Risk Score */}
                          <TableCell className="py-4 text-center">
                            <span className={`text-[13.5px] font-bold ${
                              row.riskScore >= 80 ? 'text-red-500' : 
                              row.riskScore >= 50 ? 'text-amber-500' : 
                              row.riskScore >= 30 ? 'text-emerald-500' : 
                              'text-blue-500'
                            }`}>
                              {row.riskScore}
                            </span>
                          </TableCell>

                          {/* Rating */}
                          <TableCell className="py-4 text-center text-[13px] font-bold text-slate-700">
                            {row.rating}
                          </TableCell>

                          {/* Exposure */}
                          <TableCell className="py-4 text-right text-[13px] font-semibold text-slate-900">
                            {row.exposure}
                          </TableCell>

                          {/* Last Change */}
                          <TableCell className="py-4 text-right pr-6 text-[12.5px] font-medium text-slate-500">
                            {row.lastChange}
                          </TableCell>

                          {/* Alert */}
                          <TableCell className="py-4 text-center pr-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                              row.alert === "Critical" ? 'bg-red-50 text-red-600 border-red-200' :
                              row.alert === "Medium" ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>
                              {row.alert}
                            </span>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="text-[13px] font-medium text-slate-500">
                    Showing <span className="font-bold text-slate-700">1</span> to <span className="font-bold text-slate-700">10</span> of <span className="font-bold text-slate-700">36</span> companies
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 px-3 text-[12px] font-bold text-slate-600 bg-white border-slate-200">Previous</Button>
                    <Button size="sm" className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm rounded-md">1</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[13px] font-bold text-slate-600 hover:bg-slate-100 rounded-md">2</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[13px] font-bold text-slate-600 hover:bg-slate-100 rounded-md">3</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[13px] font-bold text-slate-600 hover:bg-slate-100 rounded-md">4</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 text-[12px] font-bold text-slate-600 bg-white border-slate-200">Next</Button>
                  </div>
                </div>
              </div>

            </motion.div>

          {/* Crawler Dialog */}
          <Dialog open={isCrawlerDialogOpen} onOpenChange={setIsCrawlerDialogOpen}>
            <DialogContent className="sm:max-w-[450px] bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add Company via Crawler</DialogTitle>
                <DialogDescription>
                  Enter a company name or domain. The external AI crawler will automatically extract the entity profile and onboard it to Sentinel.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Company Name</label>
                  <Input 
                    placeholder="e.g. Acme Corporation" 
                    value={crawlerCompanyName} 
                    onChange={e => setCrawlerCompanyName(e.target.value)} 
                  />
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                  <div className="relative bg-white px-2 text-xs text-slate-500 font-medium">OR</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Company Domain</label>
                  <Input 
                    placeholder="e.g. acme.com" 
                    value={crawlerCompanyDomain} 
                    onChange={e => setCrawlerCompanyDomain(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsCrawlerDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCrawlerSubmit} disabled={isCrawling} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {isCrawling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  {isCrawling ? "Crawling..." : "Start Extraction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* API Dialog */}
          <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-slate-200">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-blue-600" />
                  API Integration
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-2">
                  Push your entities array via our REST API. Below is the recommended JSON schema.
                </DialogDescription>
              </DialogHeader>
              <div className="p-6">
                <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto text-[13px] text-green-400 font-mono shadow-inner border border-slate-800">
                  <pre>{`[
  {
    "name": "Acme Corp",
    "entityType": "company",
    "jurisdiction": "United Kingdom",
    "riskScore": 85,
    "externalReference": "C-10492"
  }
]`}</pre>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => { setIsApiDialogOpen(false); loadMockData(); }} className="bg-blue-600 hover:bg-blue-700 font-bold">
                    Simulate API Upload
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* CRM Dialog */}
          <Dialog open={isCrmDialogOpen} onOpenChange={setIsCrmDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  Connect CRM
                </DialogTitle>
                <DialogDescription className="text-slate-500 mt-2">
                  Select the required entities you want to sync from your CRM to the monitoring list.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {["Accounts", "Contacts", "Leads", "Opportunities"].map(entity => (
                  <label key={entity} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={selectedCrmEntities.includes(entity)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCrmEntities([...selectedCrmEntities, entity]);
                        else setSelectedCrmEntities(selectedCrmEntities.filter(i => i !== entity));
                      }}
                    />
                    <span className="text-slate-700 font-semibold text-[14px]">{entity}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsCrmDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => { setIsCrmDialogOpen(false); loadMockData(); }} 
                  className="bg-blue-600 hover:bg-blue-700 font-bold"
                  disabled={selectedCrmEntities.length === 0}
                >
                  Sync Selected Entities
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Company360Modal 
            isOpen={!!selectedCompany360} 
            onClose={() => setSelectedCompany360(null)} 
            companyName={selectedCompany360} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioOnboarding;
