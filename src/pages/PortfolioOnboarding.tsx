import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, FileJson, ArrowRight, ShieldCheck, Database, AlertCircle, Wand2, Keyboard, Plus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { importMonitoredEntities, fetchSamplePreview, type MonitoredEntityImportRow } from "@/lib/dashboard-data";
import { runMediaAgent } from "@/lib/media-agent-data";

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
  const row = Object.entries(rawRow).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[normalizeKey(key)] = value;
    return acc;
  }, {});

  const name = row.name ?? row.entityname ?? row.customername ?? row.fullname ?? row.legalname;
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
    const rows = Array.isArray(parsed)
      ? parsed
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
  const [parsedRows, setParsedRows] = useState<MonitoredEntityImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"csv" | "json" | "manual">("csv");
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  const [manualEntityName, setManualEntityName] = useState("");
  const [manualEntityType, setManualEntityType] = useState("");
  const [manualJurisdiction, setManualJurisdiction] = useState("");
  
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
    setParsedRows(prev => [newEntity, ...prev]);
    toast({ title: "Entity Added", description: `${manualEntityName} has been added to the queue.` });
    setManualEntityName("");
    setManualEntityType("");
    setManualJurisdiction("");
  };
  const [orchestrationStep, setOrchestrationStep] = useState(0);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);

  const loadMockData = () => {
    setSelectedFileName("demo-portfolio-Q3.csv");
    setParsedRows([
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
    if (!parsedRows.length) return sampleRows;
    return parsedRows.slice(0, 6).map((row, index) => ({
      id: row.externalReference ?? `ROW-${String(index + 1).padStart(4, "0")}`,
      name: row.name,
      type: row.entityType === "individual" ? "Individual" : row.entityType === "company" ? "Company" : row.entityType ?? "Other",
      dob: row.dateOfBirth ?? "—",
      country: row.jurisdiction ?? row.nationality ?? "—",
      risk:
        Number(row.riskScore ?? 0) >= 80 ? "Critical" : Number(row.riskScore ?? 0) >= 60 ? "High" : Number(row.riskScore ?? 0) >= 35 ? "Medium" : "Low",
      onboarded: "Pending",
    }));
  }, [parsedRows, sampleRows]);

  const importMutation = useMutation({
    mutationFn: async () => {
      const result = await importMonitoredEntities(parsedRows);
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
        setParsedRows([]);
        setParseError("No valid entity rows were found. Include a name column such as Name, Entity Name, or Customer Name.");
        return;
      }

      setParsedRows(mapped);
      toast({ title: "File parsed", description: `${mapped.length} monitored entities are ready for import.` });
    } catch (error) {
      setParsedRows([]);
      setParseError(error instanceof Error ? error.message : "The selected file could not be parsed.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-3.5rem)] bg-muted/10 py-12 px-6 flex flex-col items-center">
        
        {/* Wizard Header */}
        <div className="max-w-4xl w-full text-center mb-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-indigo-100 shadow-sm">
            Portfolio Ingestion
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
            Import your customer book
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your existing portfolio. Sentinel will automatically extract entities, screen against global risk universes, and activate real-time monitoring.
          </motion.p>
        </div>

        {/* Main Centered Card */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="max-w-4xl w-full bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="p-8 md:p-12 border-b border-border/50 relative z-10">
            {/* Segmented Control */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setActiveTab("csv")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "csv" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <FileSpreadsheet className="h-5 w-5" /> CSV / Excel
                </button>
                <button
                  onClick={() => setIsJsonDialogOpen(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "json" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <FileJson className="h-5 w-5" /> JSON Arrays
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "manual" ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Keyboard className="h-5 w-5" /> Manual Entry
                </button>
              </div>
            </div>

            {/* Hidden Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={activeTab === "csv" ? ".csv,.xlsx,.xls" : ".json"}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.currentTarget.value = "";
              }}
            />

            {/* Premium Drop Zone with Micro-Animations */}
            {activeTab !== "manual" && (
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full overflow-hidden rounded-3xl border-2 border-dashed border-indigo-200 bg-white/50 p-16 text-center cursor-pointer transition-colors hover:border-indigo-500 hover:shadow-xl shadow-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  className="mb-6 h-20 w-20 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm"
                  initial={{ y: 0 }}
                  whileHover={{ y: -8, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Upload className="h-10 w-10" />
                </motion.div>
                <h3 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
                  Click or drag file here
                </h3>
                <p className="text-sm font-medium text-muted-foreground max-w-sm mx-auto">
                  {activeTab === "csv" ? "Supports CSV, XLSX up to 50MB." : "Supports valid JSON array payloads."}
                </p>

                
                {selectedFileName && (
                  <div className="mt-8 inline-flex items-center rounded-full bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-600 ring-1 ring-emerald-200 shadow-sm">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    {selectedFileName}
                  </div>
                )}
                
                {/* Mock data loader button */}
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); loadMockData(); }} className="mt-6 rounded-full text-xs font-bold shadow-sm z-20 hover:text-indigo-600 hover:bg-indigo-50 border-indigo-100">
                  <Wand2 className="mr-2 h-3.5 w-3.5" /> Load Demo Data
                </Button>
                {parseError && (
                  <div className="mt-8 inline-flex items-center rounded-full bg-red-50 px-5 py-2 text-sm font-bold text-red-600 ring-1 ring-red-200 shadow-sm">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    {parseError}
                  </div>
                )}
              </div>
            </motion.div>
            )}

            {activeTab === "manual" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-white/50 rounded-3xl border border-indigo-100 p-8 text-left"
              >
                <h3 className="mb-6 text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Keyboard className="h-6 w-6 text-indigo-600" />
                  Manually Add Entity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Entity Name <span className="text-red-500">*</span></label>
                    <Input value={manualEntityName} onChange={e => setManualEntityName(e.target.value)} placeholder="e.g. Acme Corp" className="bg-white" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Entity Type</label>
                    <Input value={manualEntityType} onChange={e => setManualEntityType(e.target.value)} placeholder="e.g. company, individual" className="bg-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Jurisdiction / Country</label>
                    <Input value={manualJurisdiction} onChange={e => setManualJurisdiction(e.target.value)} placeholder="e.g. United Kingdom" className="bg-white" />
                  </div>
                </div>
                <Button onClick={handleAddManualEntity} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" /> Add to Import Queue
                </Button>
              </motion.div>
            )}

            {/* JSON Schema Trigger Modal */}
            <AnimatePresence>
              {(activeTab === "json" || isJsonDialogOpen) && !selectedFileName && !parsedRows.length && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mt-6 flex justify-center"
                >
                  <Dialog open={isJsonDialogOpen} onOpenChange={setIsJsonDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="rounded-full shadow-sm hover:text-indigo-600 hover:bg-indigo-50 border-indigo-100 font-bold transition-all group">
                        <FileJson className="mr-2 h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                        View Expected JSON Format
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white text-slate-900 border-slate-200 shadow-xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-600">
                          <FileJson className="h-5 w-5" /> 
                          JSON Array Format
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                          Your file must contain a single JSON array of objects. Below is the expected structure with standard properties.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="bg-slate-50 rounded-xl p-4 overflow-hidden border border-slate-200 shadow-inner group/code relative mt-2">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Example Payload</span>
                          </div>
                          <button 
                            className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-1 rounded transition-colors font-bold border border-indigo-100"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigator.clipboard.writeText(`[\n  {\n    "name": "Acme Corp",\n    "entityType": "company",\n    "jurisdiction": "UK",\n    "riskScore": 85,\n    "externalReference": "C-10492"\n  }\n]`); 
                              toast({title: "Template Copied", description: "JSON template copied to clipboard."}); 
                            }}
                          >
                            Copy Payload
                          </button>
                        </div>
                        <pre className="text-[12px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
{`[
  {
    "name": "Acme Corp",
    "entityType": "company",
    "jurisdiction": "UK",
    "riskScore": 85,
    "externalReference": "C-10492"
  }
]`}
                        </pre>
                      </div>
                      <Button 
                        onClick={() => { setActiveTab("json"); setIsJsonDialogOpen(false); }} 
                        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl"
                      >
                        I Understand, Proceed to Upload
                      </Button>
                    </DialogContent>
                  </Dialog>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="bg-slate-50 p-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-slate-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {parsedRows.length ? "Ready for Ingestion" : "Awaiting Portfolio"}
                </div>
                <div className="text-xs text-slate-500">
                  {parsedRows.length ? `${parsedRows.length} entities parsed and validated.` : "Upload a file to begin the onboarding sequence."}
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-8 text-base font-bold tracking-wide rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none"
              disabled={!parsedRows.length || isOrchestrating} 
              onClick={handleStartMonitoring}
            >
              {isOrchestrating ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Initializing...</>
              ) : (
                <>Start Real-Time Monitoring <ArrowRight className="ml-2 h-5 w-5" /></>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Data Preview Section - Fades in below */}
        <AnimatePresence>
          {parsedRows.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20, height: 0 }} 
              animate={{ opacity: 1, y: 0, height: "auto" }} 
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="max-w-4xl w-full mt-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between border-b px-8 py-5 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-900">Extracted Data Preview</h3>
                </div>
                <div className="text-sm font-semibold text-slate-500">{parsedRows.length} valid rows found</div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Customer ID</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Entity Name</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Type</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">DOB / Inc.</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Country</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Vol. Trend</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500 h-12">Initial Risk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((r) => (
                      <TableRow key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-mono text-xs text-slate-500">{r.id}</TableCell>
                        <TableCell className="text-sm font-bold text-slate-900">{r.name}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">{r.type}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{r.dob}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-600">{r.country}</TableCell>
                        <TableCell>
                          <div className="h-6 w-16">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={Array.from({ length: 7 }, () => ({ val: Math.random() * 100 }))}>
                                <Line type="monotone" dataKey="val" stroke="#6366F1" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            r.risk === "Critical"
                              ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                              : r.risk === "High"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                                : r.risk === "Medium"
                                  ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20"
                                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          }`}
                          >
                            {r.risk}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Orchestration Overlay */}
        <AnimatePresence>
          {isOrchestrating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm"
            >
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-xl font-bold text-white tracking-tight">AI Orchestrator</h3>
                </div>
                
                <div className="space-y-6">
                  {[
                    { title: "Extracting entities from payload...", step: 0 },
                    { title: "Normalizing entity schemas...", step: 1 },
                    { title: "Spawning autonomous AI Agents...", step: 2 },
                    { title: "Connecting to live data sources...", step: 3 },
                    { title: "Real-time monitoring active!", step: 4 }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: orchestrationStep >= item.step ? 1 : 0.3, x: 0 }}
                      className="flex items-center gap-4"
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${orchestrationStep > item.step ? 'bg-emerald-500/20 text-emerald-400' : orchestrationStep === item.step ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                        {orchestrationStep > item.step ? <CheckCircle2 className="h-3.5 w-3.5" /> : orchestrationStep === item.step ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                      </div>
                      <span className={`text-sm font-semibold ${orchestrationStep >= item.step ? 'text-white' : 'text-slate-600'}`}>
                        {item.title}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

export default PortfolioOnboarding;
