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
import { Textarea } from "@/components/ui/textarea";
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
      revenue: (row.financials as any)?.revenue,
      currency: (row.financials as any)?.currency,
      sector: (row.financials as any)?.sector || row.industry || row.sector,
      financials: row.financials,
      aboutCompany: row.aboutcompany,
      keyPersonnel: row.keypersonnel,
      keyCompetitors: row.keycompetitors,
      website: row.website,
      phone: row.phone,
      duns: row.duns,
      legalType: row.legaltype,
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

const getPageNumbers = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};

const PortfolioOnboarding = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [selectedCompany360, setSelectedCompany360] = useState<any | null>(null);

  const [importedDataRows, setImportedDataRows] = useState<MonitoredEntityImportRow[]>(() => {
    try {
      const saved = localStorage.getItem('sentinel_portfolio_data');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sentinel_portfolio_data', JSON.stringify(importedDataRows));
  }, [importedDataRows]);

  const [parseError, setParseError] = useState<string | null>(null);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [isCrmDialogOpen, setIsCrmDialogOpen] = useState(false);
  const [selectedCrmEntities, setSelectedCrmEntities] = useState<string[]>([]);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationStep, setOrchestrationStep] = useState(0);
  const [isJsonDialogOpen, setIsJsonDialogOpen] = useState(false);
  const [isPasteJsonDialogOpen, setIsPasteJsonDialogOpen] = useState(false);
  const [pasteJsonContent, setPasteJsonContent] = useState("");
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

      const initiateCorporateRegistryScreening = async (normalizedDomain: string, externalRef: string) => {
        try {
          const endpointUrl = "https://croftzgo.com/api/v1/screening";
          const CROFTZ_KEY = "sk_0d514a86648edbc36840257f3303ea6fd65874b0cad898cd913199d10f0a4b0d";

          // ── Build form payload ──
          const formData = new URLSearchParams();
          formData.append('name', normalizedDomain);
          formData.append('entityType', 'company');
          formData.append('exactMatch', 'false');
          formData.append('fuzzinessThreshold', '100');
          formData.append('monitor', 'false');
          formData.append('countryCodes', '');
          formData.append('metadata', '');
          formData.append('birthYear', '');
          formData.append('monitoringDuration', '60');
          formData.append('monitoringRenew', 'false');

          // ── LOG: Full request details ──
          console.group(`%c[Croftz] POST Request → ${normalizedDomain}`, 'color: #2563eb; font-weight: bold; font-size: 13px;');
          console.log('URL:', endpointUrl);
          console.log('Headers:', { 'Content-Type': 'application/x-www-form-urlencoded', 'x-api-key': CROFTZ_KEY });
          console.log('Body (parsed):', Object.fromEntries(formData.entries()));
          console.log('Body (raw):', formData.toString());
          console.groupEnd();

          const postResp = await fetch(endpointUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "x-api-key": CROFTZ_KEY
            },
            body: formData.toString()
          });

          // ── LOG: Raw HTTP response status ──
          console.group(`%c[Croftz] POST Response ← ${postResp.status} ${postResp.statusText}`, postResp.ok ? 'color: #16a34a; font-weight: bold;' : 'color: #dc2626; font-weight: bold;');
          console.log('Status:', postResp.status, postResp.statusText);
          console.log('Response Headers:', Object.fromEntries(postResp.headers.entries()));

          if (!postResp.ok) {
            const errText = await postResp.text();
            console.log('Error Body (raw text):', errText);
            console.groupEnd();
            throw new Error("Croftz returned " + postResp.status + ": " + errText);
          }

          const postData = await postResp.json();
          // ── LOG: Full response JSON — completely untruncated ──
          console.log('Full Response JSON:', JSON.parse(JSON.stringify(postData)));
          console.groupEnd();

          const postBody = postData.response || postData;

          if (!postBody.success) {
            console.error('[Croftz] success=false. Full body:', postBody);
            throw new Error(postBody.message || "Screening failed");
          }

          // ── LOG: screeningResults summary ──
          console.group('%c[Croftz] Screening Results', 'color: #7c3aed; font-weight: bold;');
          console.log('screeningResults count:', postBody.screeningResults?.length ?? 0);
          if (postBody.screeningResults?.length > 0) {
            console.log('screeningResults[0] (full):', JSON.parse(JSON.stringify(postBody.screeningResults[0])));
            console.log('results object (full):', JSON.parse(JSON.stringify(postBody.screeningResults[0].results)));
          } else {
            console.warn('No screeningResults in response. Full postBody:', postBody);
          }
          console.groupEnd();

          // ── Extract results directly from POST response ──
          if (postBody.screeningResults?.length > 0) {
            const results = postBody.screeningResults[0].results;
            setImportedDataRows(prev => prev.map(row =>
              row.externalReference === externalRef
                ? { ...row, identifiers: { ...row.identifiers, corporateRegistry: results } }
                : row
            ));
            toast({ title: "✅ Screening Complete", description: `Risk data loaded for ${normalizedDomain}.` });
          } else {
            toast({ title: "No Results", description: `No screening results for ${normalizedDomain}.`, variant: "destructive" });
          }

        } catch (err) {
          console.error("[Croftz] ❌ Screening failed:", err);
          toast({ title: "Screening Unavailable", description: String(err), variant: "destructive" });
        }
      };


      const payload: any = {
        domains: finalDomain ? [finalDomain] : []
      };
      
      if (crawlerCompanyName) {
        payload.company_name = crawlerCompanyName;
      }
      
      const crawlerUrl = import.meta.env.VITE_CRAWLER_API_URL || "http://173.249.56.10:1234/api/v1/crawler/extract-company-info";

      // 2-minute timeout — crawler does heavy scraping, needs time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(crawlerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
      
      // ── Close dialog IMMEDIATELY — don't make user wait ──
      setIsCrawlerDialogOpen(false);
      setCrawlerCompanyName("");
      setCrawlerCompanyDomain("");

      toast({
        title: "Crawler Finished",
        description: `Extracted data for ${crawlerCompanyName || crawlerCompanyDomain}. Running screening in background...`
      });

      let newEntities: MonitoredEntityImportRow[] = [];
      const extractedList = Array.isArray(data.data) ? data.data : (Array.isArray(data.entities) ? data.entities : null);
      
      if (extractedList && extractedList.length > 0) {
        newEntities = extractedList.map((e: any, idx: number) => {
          // Support the actual API payload structure
          if (e.normalizedDomain || e.ipCountry) {
            // Use the cleanest name: clearbitName is most reliable from crawler
            const entityName = (e.clearbitName || e.nameFromTitle || crawlerCompanyName || crawlerCompanyDomain || e.companyName || "Unknown Entity").split("|")[0].trim();
            return {
              name: entityName,
              entityType: "company",
              jurisdiction: e.ipCountry || e.clearbitGeo?.country || "Unknown",
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

      if (extractedList && extractedList.length > 0) {
        newEntities.forEach((entity, idx) => {
          const e = extractedList[idx];

          // ── Store the full crawler payload as rawIdentifiers on the row ──
          const crawlerIdentifiers = {
            website: e.website || e.clearbitDomain,
            phone: e.phone || e.clearbitPhone,
            address: e.address || e.clearbitGeo,
            legalType: e.legalType || e.clearbitType,
            duns: e.duns,
            aboutCompany: e.aboutCompany || { brief: e.description },
            keyPersonnel: e.keyPersonnel || [],
            keyCompetitors: e.keyCompetitors || [],
            financials: e.financials || {},
          };

          // Update the row in state with rawIdentifiers from crawler
          setImportedDataRows(prev => prev.map(row =>
            row.externalReference === entity.externalReference
              ? { ...row, rawIdentifiers: crawlerIdentifiers }
              : row
          ));

          // ── Pass ONLY e.normalizedDomain to Croftz POST ──
          const normalizedDomain = e.normalizedDomain;
          if (normalizedDomain && entity.externalReference) {
            console.log(`[Croftz] Using normalizedDomain: "${normalizedDomain}" for externalRef: "${entity.externalReference}"`);
            initiateCorporateRegistryScreening(normalizedDomain, entity.externalReference);
          } else {
            console.warn(`[Croftz] No normalizedDomain found in crawler response for entity at index ${idx}. Skipping screening.`, e);
            toast({ title: "No Domain Found", description: `Could not extract normalizedDomain from crawler for ${entity.name}. Screening skipped.`, variant: "destructive" });
          }
        });
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast({ title: "Crawler Timeout", description: "The crawler is taking too long. The server may be busy — please try again in a moment.", variant: "destructive" });
      } else {
        toast({ title: "Crawler Failed", description: error instanceof Error ? error.message : "Network error", variant: "destructive" });
      }
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
  const { data: sampleRows = [] } = useQuery({ queryKey: ["portfolio-sample"], queryFn: fetchSamplePreview });

  const displayData = useMemo(() => {
    if (importedDataRows.length === 0) {
      if (sampleRows.length === 0) return [];
      
      return sampleRows.map((row: any, index: number) => {
        const profile = row.masterEntityProfile || {};
        const name = profile.fullName || row.name || "Unknown";
        const country = profile.jurisdiction || row.country || "Unknown";
        const industry = profile.financials?.sector || row.payload?.industry || "N/A";
        const revenue = Number(profile.financials?.revenue || 0);
        
        const getFlag = (country: string) => {
          const c = country.toLowerCase();
          if (c === "us" || c === "united states" || c === "usa") return "🇺🇸";
          if (c === "uk" || c === "united kingdom" || c === "england") return "🇬🇧";
          if (c === "jersey") return "🇯🇪";
          if (c === "france") return "🇫🇷";
          if (c === "germany") return "🇩🇪";
          return "🌐";
        };
        
        let riskScore = 25;
        if (revenue > 10000000000) riskScore = 85;
        else if (revenue > 1000000000) riskScore = 65;
        else if (revenue > 0) riskScore = 45;

        let exposure = "Pending";
        if (revenue > 0) {
          if (revenue >= 1000000000) {
            exposure = `$${(revenue / 1000000).toFixed(1)}M`;
          } else {
            exposure = `$${(revenue / 1000).toFixed(1)}K`;
          }
        }
        
        return {
          id: index + 1,
          name: name,
          country: country,
          industry: industry,
          riskScore,
          rating: riskScore >= 80 ? "CCC" : riskScore >= 50 ? "BBB" : "AA",
          exposure,
          lastChange: "Just now",
          alert: riskScore >= 80 ? "Critical" : riskScore >= 50 ? "Medium" : "Low",
          flag: getFlag(country || ""),
          initial: name.charAt(0).toUpperCase(),
          externalReference: row.id || `ENT-${index}`,
          rawIdentifiers: profile || row.payload || {}
        };
      });
    }
    
    return importedDataRows.map((row, index) => {
      const name = String(row.name || "Unknown Entity");
      const revenue = Number(row.identifiers?.revenue || 0);
      const currency = String(row.identifiers?.currency || "USD");
      const sector = String(row.identifiers?.sector || (row.entityType !== "individual" ? "Corporate Entity" : "Individual"));
      
      let riskScore = Number(row.riskScore || 0);
      if (riskScore === 0) {
        if (revenue > 10000000000) riskScore = 85;
        else if (revenue > 1000000000) riskScore = 65;
        else if (revenue > 0) riskScore = 45;
      }
      
      let exposure = "Pending";
      if (revenue > 0) {
        const symbol = currency === "GBP" ? "£" : currency === "USD" ? "$" : currency + " ";
        if (revenue >= 1000000000) {
          exposure = `${symbol}${(revenue / 1000000).toFixed(1)}M`;
        } else {
          exposure = `${symbol}${(revenue / 1000).toFixed(1)}K`;
        }
      }

      const getFlag = (country: string) => {
        const c = country.toLowerCase();
        if (c === "us" || c === "united states" || c === "usa") return "🇺🇸";
        if (c === "uk" || c === "united kingdom" || c === "england") return "🇬🇧";
        if (c === "jersey") return "🇯🇪";
        if (c === "france") return "🇫🇷";
        return "🌐";
      };

      // Clean up name: take only the first segment if multiple aliases were concatenated
      const cleanName = name.split("|")[0].trim();

      return {
        id: index + 1,
        name: cleanName,
        country: row.jurisdiction || row.nationality || "Unknown",
        industry: sector,
        riskScore,
        rating: riskScore >= 80 ? "CCC" : riskScore >= 50 ? "BBB" : "AA",
        exposure,
        lastChange: "Just now",
        alert: riskScore >= 80 ? "Critical" : riskScore >= 50 ? "Medium" : "Low",
        flag: getFlag(row.jurisdiction || row.nationality || ""),
        initial: cleanName.charAt(0).toUpperCase(),
        externalReference: row.externalReference,
        rawIdentifiers: row.identifiers || {}
      };
    });
  }, [importedDataRows, sampleRows]);

  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayData.slice(startIndex, startIndex + itemsPerPage);
  }, [displayData, currentPage]);

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

  const handlePastedJsonSubmit = () => {
    if (!pasteJsonContent.trim()) {
      toast({ title: "No Data", description: "Please paste some JSON data to import.", variant: "destructive" });
      return;
    }
    
    try {
      setParseError(null);
      const parsed = JSON.parse(pasteJsonContent);
      let rows: any[] = [];
      
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && !("data" in parsed) && !("entities" in parsed)) {
        rows = [parsed];
      } else {
        rows = Array.isArray(parsed)
          ? parsed
          : parsed && typeof parsed === "object" && Array.isArray((parsed as any).entities)
            ? (parsed as any).entities
            : parsed && typeof parsed === "object" && Array.isArray((parsed as any).data)
              ? (parsed as any).data
              : [];
      }
      
      const mapped = rows.map(toImportRow).filter((row): row is MonitoredEntityImportRow => Boolean(row));

      if (!mapped.length) {
        toast({ title: "No Entities Found", description: "No valid entities could be parsed from the JSON.", variant: "destructive" });
        return;
      }

      setImportedDataRows(prev => [...mapped, ...prev]);
      toast({ title: "JSON Parsed", description: `${mapped.length} monitored entities added to queue.` });
      setIsPasteJsonDialogOpen(false);
      setPasteJsonContent("");
    } catch (error) {
      toast({ title: "Invalid JSON", description: error instanceof Error ? error.message : "The pasted content is not valid JSON.", variant: "destructive" });
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                      e.target.value = "";
                    }}
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><FileSpreadsheet className="h-4 w-4 text-slate-400" /> CSV / Excel</Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><FileJson className="h-4 w-4 text-slate-400" /> JSON Upload</Button>
                  <Button onClick={() => setIsPasteJsonDialogOpen(true)} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><Database className="h-4 w-4 text-slate-400" /> Paste JSON</Button>
                  <Button onClick={() => setIsCrmDialogOpen(true)} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><Cloud className="h-4 w-4 text-slate-400" /> CRM</Button>
                  <Button onClick={() => setIsApiDialogOpen(true)} variant="outline" className="h-9 gap-2 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold shadow-sm text-[13px] rounded-lg px-4"><LinkIcon className="h-4 w-4 text-slate-400" /> API</Button>
                  <Button onClick={() => setIsCrawlerDialogOpen(true)} className="h-9 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm text-[13px] rounded-lg px-5 ml-1"><Plus className="h-4 w-4" /> Add Company</Button>
                  {importedDataRows.length > 0 && (
                    <Button 
                      onClick={() => {
                        setImportedDataRows([]);
                        localStorage.removeItem('sentinel_portfolio_data');
                        toast({ title: "Local Data Cleared", description: "All rows have been removed." });
                      }} 
                      variant="destructive" 
                      className="h-9 gap-2 font-bold shadow-sm text-[13px] rounded-lg px-4 ml-1"
                    >
                      Clear All Data
                    </Button>
                  )}
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
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-48 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <Database className="h-8 w-8 text-slate-300 mb-3" />
                              <p className="text-[14px] font-medium text-slate-600 mb-1">No entities to monitor</p>
                              <p className="text-[13px]">Add companies using the crawler, paste JSON, or select from CRM to get started.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedData.map((row) => (
                          <TableRow key={row.id} className="hover:bg-slate-50/60 border-b border-slate-100/80 transition-colors group">
                            <TableCell className="py-4 pl-6 text-[12.5px] font-semibold text-slate-400">{row.id}</TableCell>
                            
                            {/* Company */}
                            <TableCell className="py-4 cursor-pointer" onClick={() => setSelectedCompany360(row)}>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="text-[13px] font-medium text-slate-500">
                    Showing <span className="font-bold text-slate-700">{displayData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, displayData.length)}</span> of <span className="font-bold text-slate-700">{displayData.length}</span> companies
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3 text-[12px] font-bold text-slate-600 bg-white border-slate-200"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {getPageNumbers(currentPage, totalPages).map((page, index) => {
                      if (page === '...') {
                        return <span key={`ellipsis-${index}`} className="px-1.5 text-slate-400 font-bold tracking-widest text-[13px]">...</span>;
                      }
                      return (
                        <Button 
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm" 
                          className={`h-8 w-8 p-0 text-[13px] font-bold rounded-md ${
                            currentPage === page 
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                          onClick={() => setCurrentPage(page as number)}
                        >
                          {page}
                        </Button>
                      );
                    })}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-3 text-[12px] font-bold text-slate-600 bg-white border-slate-200"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>

            </motion.div>

          {/* Crawler Dialog */}
          <Dialog open={isCrawlerDialogOpen} onOpenChange={setIsCrawlerDialogOpen}>
            <DialogContent className="sm:max-w-[450px] bg-white border-slate-200">
              <DialogTitle className="sr-only">Web Crawler Import</DialogTitle>
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
              <DialogTitle className="sr-only">API Integration</DialogTitle>
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
              <DialogTitle className="sr-only">CRM Sync</DialogTitle>
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
                  variant="outline" 
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    setImportedDataRows([]);
                    localStorage.removeItem('sentinel_portfolio_data');
                    toast({ title: "Data Cleared", description: "Reverted to preloaded backend data." });
                  }}
                >
                  Clear Local Data
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 shadow-md text-white border-0"
                  onClick={handleStartMonitoring}
                  disabled={selectedCrmEntities.length === 0}
                >
                  Sync Selected Entities
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Derive live data for modal from importedDataRows so Croftz data auto-fills when it arrives */}
          {(() => {
            const liveRow = selectedCompany360
              ? importedDataRows.find(r => r.externalReference === selectedCompany360.externalReference)
              : null;
            const liveModalData = selectedCompany360 && liveRow ? {
              ...selectedCompany360,
              rawIdentifiers: liveRow.identifiers || {}
            } : selectedCompany360;
            return (
              <Company360Modal
                isOpen={!!selectedCompany360}
                onClose={() => setSelectedCompany360(null)}
                companyData={liveModalData}
              />
            );
          })()}

        </div>
      </div>
      <Dialog open={isPasteJsonDialogOpen} onOpenChange={setIsPasteJsonDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-slate-100 shadow-xl rounded-xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Paste JSON Payload</DialogTitle>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h2 className="text-xl font-bold mb-1">Paste JSON Data</h2>
            <p className="text-blue-100 text-sm opacity-90">Paste your raw JSON payload directly to import monitored entities</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">JSON Payload</label>
                <Textarea 
                  placeholder='{"entities": [ ... ]}' 
                  className="h-64 font-mono text-xs bg-slate-50"
                  value={pasteJsonContent}
                  onChange={(e) => setPasteJsonContent(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsPasteJsonDialogOpen(false)}>Cancel</Button>
              <Button onClick={handlePastedJsonSubmit} className="bg-blue-600 hover:bg-blue-700 font-bold">Import Data</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PortfolioOnboarding;
