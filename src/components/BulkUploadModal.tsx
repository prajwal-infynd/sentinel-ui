import React, { useCallback, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Upload, FileSpreadsheet, ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, X, Download, Loader2, RefreshCw, ChevronDown
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

// ─── Sentinel canonical entity fields ────────────────────────────────────────
export const SENTINEL_FIELDS = [
  { key: "companyName",         label: "Company Name",          required: true  },
  { key: "registrationNumber",  label: "Registration Number",   required: false },
  { key: "industry",            label: "Industry / Sector",     required: false },
  { key: "jurisdiction",        label: "Jurisdiction / Country",required: false },
  { key: "creditLimit",         label: "Credit Limit",          required: false },
  { key: "incorporationDate",   label: "Incorporation Date",    required: false },
  { key: "registeredAddress",   label: "Registered Address",    required: false },
  { key: "contactEmail",        label: "Contact Email",         required: false },
  { key: "website",             label: "Website",               required: false },
];

// ─── Auto-mapper: fuzzy match uploaded headers → Sentinel fields ──────────────
function autoMap(headers: string[]): Record<string, string> {
  const SYNONYMS: Record<string, string[]> = {
    companyName:        ["company", "name", "company name", "business name", "entity", "legal name", "org", "organisation", "organization"],
    registrationNumber: ["reg", "crn", "registration", "company number", "reg no", "registration number", "regnum"],
    industry:           ["industry", "sector", "vertical", "business type", "category"],
    jurisdiction:       ["country", "jurisdiction", "nation", "domicile", "incorporated in", "location"],
    creditLimit:        ["credit", "limit", "credit limit", "credit line", "facility"],
    incorporationDate:  ["date", "incorporated", "incorporation date", "founded", "incorporated date", "dob"],
    registeredAddress:  ["address", "registered address", "office", "location", "street"],
    contactEmail:       ["email", "contact email", "contact", "mail", "e-mail"],
    website:            ["website", "url", "web", "domain", "site"],
  };

  const mapping: Record<string, string> = {};
  for (const h of headers) {
    const normalized = h.toLowerCase().trim();
    for (const [field, synonyms] of Object.entries(SYNONYMS)) {
      if (synonyms.some(s => normalized.includes(s) || s.includes(normalized))) {
        if (!Object.values(mapping).includes(h)) {
          mapping[field] = h;
          break;
        }
      }
    }
  }
  return mapping;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (companies: any[]) => void;
}

type Step = "upload" | "map" | "preview" | "done";

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS: { id: Step; label: string }[] = [
  { id: "upload",  label: "Upload File" },
  { id: "map",     label: "Map Columns" },
  { id: "preview", label: "Preview" },
  { id: "done",    label: "Done" },
];

function StepBar({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
              i < idx  ? "bg-indigo-600 border-indigo-600 text-white" :
              i === idx ? "bg-white border-indigo-600 text-indigo-600" :
                          "bg-white border-slate-200 text-slate-400"
            }`}>
              {i < idx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-bold ${i === idx ? "text-indigo-600" : i < idx ? "text-slate-500" : "text-slate-300"}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < idx ? "bg-indigo-500" : "bg-slate-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const [step, setStep]         = useState<Step>("upload");
  const [file, setFile]         = useState<File | null>(null);
  const [headers, setHeaders]   = useState<string[]>([]);
  const [rawRows, setRawRows]   = useState<any[]>([]);
  const [mapping, setMapping]   = useState<Record<string, string>>({}); // sentinelField -> uploadedHeader
  const [preview, setPreview]   = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload"); setFile(null); setHeaders([]); setRawRows([]);
    setMapping({}); setPreview([]); setSubmitting(false);
  };

  // ── Parse uploaded file ──────────────────────────────────────────────────
  const parseFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        if (json.length < 2) {
          toast({ title: "Empty file", description: "The file has no data rows.", variant: "destructive" });
          return;
        }
        const hdrs = (json[0] as any[]).map(h => String(h).trim()).filter(Boolean);
        const rows = json.slice(1).filter((r: any[]) => r.some(c => c !== "")).map((r: any[]) => {
          const obj: any = {};
          hdrs.forEach((h, i) => { obj[h] = r[i] !== undefined ? String(r[i]).trim() : ""; });
          return obj;
        });
        setHeaders(hdrs);
        setRawRows(rows);
        setMapping(autoMap(hdrs));
        setFile(f);
        setStep("map");
      } catch {
        toast({ title: "Parse error", description: "Could not read the file. Use .xlsx, .xls, or .csv.", variant: "destructive" });
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  // ── Build preview from mapping ───────────────────────────────────────────
  const buildPreview = () => {
    const mapped = rawRows.map((row, i) => {
      const entity: any = { _rowNum: i + 2 };
      for (const field of SENTINEL_FIELDS) {
        const col = mapping[field.key];
        entity[field.key] = col ? row[col] || "" : "";
      }
      return entity;
    });
    setPreview(mapped);
    setStep("preview");
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await apiClient.post("/onboarding/bulk-upload", { companies: preview });
      onSuccess(data.companies);
      setStep("done");
    } catch {
      toast({ title: "Upload failed", description: "Could not process the upload.", variant: "destructive" });
    }
    setSubmitting(false);
  };

  // ── Download sample template ─────────────────────────────────────────────
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      SENTINEL_FIELDS.map(f => f.label),
      ["Acme Corp Ltd", "CRN-12345678", "Technology", "United Kingdom", "£500,000", "2020-01-15", "1 Tech Park, London, EC1A 1BB", "hello@acme.com", "https://acme.com"],
      ["Global Trade Inc", "CRN-87654321", "Logistics", "Germany", "€250,000", "2018-06-01", "Unter den Linden 5, Berlin", "info@globaltrade.de", "https://globaltrade.de"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Onboarding Template");
    XLSX.writeFile(wb, "sentinel_onboarding_template.xlsx");
  };

  const requiredMapped = SENTINEL_FIELDS.filter(f => f.required).every(f => mapping[f.key]);
  const unmappedRequired = SENTINEL_FIELDS.filter(f => f.required && !mapping[f.key]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="px-8 pt-7 pb-0">
          <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Bulk Upload Companies
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mt-1">
            Import multiple companies via Excel or CSV and map your columns to Sentinel fields.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pt-6 pb-8">
          <StepBar current={step} />

          {/* ── STEP 1: Upload ── */}
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  dragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileInput} />
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-7 h-7 text-indigo-500" />
                </div>
                <p className="font-bold text-slate-800 text-base">Drop your file here</p>
                <p className="text-slate-500 text-sm mt-1">or click to browse · <span className="font-semibold">.xlsx, .xls, .csv</span></p>
              </div>
              <div className="flex items-center justify-center">
                <button onClick={downloadTemplate} className="flex items-center gap-1.5 text-sm text-indigo-600 font-bold hover:underline">
                  <Download className="w-4 h-4" /> Download sample template
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Map columns ── */}
          {step === "map" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-indigo-900">{file?.name}</p>
                  <p className="text-xs text-indigo-600">{rawRows.length} rows detected · {headers.length} columns</p>
                </div>
                <button onClick={() => { reset(); }} className="ml-auto text-indigo-400 hover:text-indigo-600"><X className="w-4 h-4" /></button>
              </div>

              <p className="text-sm text-slate-600 font-medium">
                Map your spreadsheet columns to Sentinel's entity fields. Columns are auto-mapped where possible.
              </p>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Sentinel Field</span>
                  <span>Your Column</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {SENTINEL_FIELDS.map(field => (
                    <div key={field.key} className="grid grid-cols-2 items-center px-4 py-2.5 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{field.label}</span>
                        {field.required && <Badge className="text-[9px] bg-red-100 text-red-600 border-none px-1.5 py-0">Required</Badge>}
                      </div>
                      <div className="relative">
                        <select
                          value={mapping[field.key] || ""}
                          onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                          <option value="">— Skip this field —</option>
                          {headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {unmappedRequired.length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <span>Required: <strong>{unmappedRequired.map(f => f.label).join(", ")}</strong> must be mapped before proceeding.</span>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={reset} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button disabled={!requiredMapped} onClick={buildPreview} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
                  Preview <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ── */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">{preview.length} companies ready to import</p>
                <button onClick={() => setStep("map")} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Re-map
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-slate-500 font-bold">#</th>
                        {SENTINEL_FIELDS.filter(f => mapping[f.key]).map(f => (
                          <th key={f.key} className="px-3 py-2 text-slate-500 font-bold whitespace-nowrap">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {preview.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                          {SENTINEL_FIELDS.filter(f => mapping[f.key]).map(f => (
                            <td key={f.key} className="px-3 py-2 max-w-[160px] truncate">
                              {row[f.key] ? (
                                <span className="text-slate-900 font-medium">{row[f.key]}</span>
                              ) : (
                                <span className="text-slate-300 italic">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep("map")} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : <><Upload className="w-4 h-4" /> Import {preview.length} Companies</>}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Done ── */}
          {step === "done" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Import Successful!</h3>
              <p className="text-slate-500 text-sm">
                <strong>{preview.length}</strong> companies have been added to the onboarding queue. AI screening will begin automatically.
              </p>
              <Button onClick={() => { reset(); onClose(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white w-full mt-4">
                Back to Onboarding
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
