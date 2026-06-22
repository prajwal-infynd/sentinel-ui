import { useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, Plug, CheckCircle2, Loader2, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { importMonitoredEntities, fetchSamplePreview, type MonitoredEntityImportRow } from "@/lib/dashboard-data";
import { runMediaAgent } from "@/lib/media-agent-data";



const steps = [
  { title: "Ingest customer book", description: "Upload CSV, Excel, or connect via API" },
  { title: "Enrich & normalise", description: "Standardise fields, resolve entities" },
  { title: "Match to risk universe", description: "Screen against sanctions, PEP, and media" },
  { title: "Activate monitoring", description: "Start continuous real-time screening" },
];

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
        description: `${result.imported} entities imported and the media agent has started a monitoring cycle.`,
      });
      navigate("/media");
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
      <div className="p-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.currentTarget.value = "";
          }}
        />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="mb-1 text-2xl font-bold tracking-tight">Customer Portfolio Onboarding</h1>
          <p className="text-muted-foreground">Upload a screening file, map monitored entities, and trigger the media agents in one step.</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-12 text-center transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="mb-6 rounded-full bg-primary/10 p-4 shadow-inner ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold tracking-tight">Upload your customer portfolio</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Drag and drop your CSV, XLSX, or JSON file here. We'll automatically detect names, entity types, and risk identifiers.
                </p>
                {selectedFileName && (
                  <div className="mt-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20">
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                    {selectedFileName}
                  </div>
                )}
              </div>
            </motion.button>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: FileSpreadsheet, label: "CSV / Excel", desc: parsedRows.length ? `${parsedRows.length} rows ready` : "Upload flat files", active: true },
                { icon: FileJson, label: "JSON", desc: "Bulk import structured entities", active: true },
                { icon: Plug, label: "API Connector", desc: "Use import first, API next", active: false },
              ].map((c, i) => (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all ${c.active ? "cursor-pointer hover:border-primary/40 hover:shadow-md" : "opacity-60 grayscale"}`}
                    onClick={() => c.active && fileInputRef.current?.click()}
                  >
                    <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/20 transition-transform group-hover:scale-110">
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold tracking-tight">{c.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
                  </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="overflow-hidden rounded-xl bg-card shadow-sm">
              <div className="flex items-center justify-between border-b px-5 py-3.5">
                <h3 className="text-sm font-semibold">{parsedRows.length ? "Imported Data Preview" : "Sample Data Preview"}</h3>
                <div className="text-xs text-muted-foreground">{parsedRows.length ? `${parsedRows.length} parsed rows` : "Upload a file to replace sample rows"}</div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Customer ID</TableHead>
                    <TableHead className="text-xs">Entity Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">DOB / Inc.</TableHead>
                    <TableHead className="text-xs">Country</TableHead>
                    <TableHead className="text-xs">Risk Segment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell className="text-sm font-medium">{r.name}</TableCell>
                      <TableCell className="text-xs">{r.type}</TableCell>
                      <TableCell className="font-mono text-xs">{r.dob}</TableCell>
                      <TableCell className="text-xs">{r.country}</TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.risk === "Critical"
                            ? "bg-destructive/10 text-destructive"
                            : r.risk === "High"
                              ? "bg-warning/10 text-warning"
                              : r.risk === "Medium"
                                ? "bg-primary/10 text-primary"
                                : "bg-success/10 text-success"
                        }`}
                        >
                          {r.risk}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-bold tracking-tight flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> How Onboarding Works
              </h3>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-4 ring-background ${i === 0 ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-primary/10 text-primary"}`}>
                        {i + 1}
                      </div>
                      {i < steps.length - 1 && <div className="absolute top-8 bottom-0 left-4 w-px -ml-[0.5px] bg-gradient-to-b from-primary/30 to-border" />}
                    </div>
                    <div className="pt-1.5 pb-2">
                      <div className={`text-sm font-bold ${i === 0 ? "text-foreground" : "text-foreground/80"}`}>{step.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Import Readiness</h3>
                <span className="text-xs text-muted-foreground">{parsedRows.length ? "Ready" : "Waiting"}</span>
              </div>
              <Progress value={parsedRows.length ? 100 : 24} className="h-2" />
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <p>{parsedRows.length ? `${parsedRows.length} entities will be inserted into monitored records.` : "Upload a file to validate entity rows before import."}</p>
                <p>{parseError ?? "After import, the media agents will run immediately against the uploaded portfolio."}</p>
              </div>
            </div>

            <Button className="w-full gap-2" size="lg" disabled={!parsedRows.length || importMutation.isPending} onClick={() => importMutation.mutate()}>
              {importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {importMutation.isPending ? "Importing & starting agents" : "Start Monitoring"}
            </Button>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PortfolioOnboarding;
