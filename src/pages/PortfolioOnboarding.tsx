import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, Loader2, FileJson, ArrowRight, ShieldCheck, Database, AlertCircle, Wand2, Keyboard, Plus, Search, Clock, History, Link as LinkIcon, Cloud, Settings2, Download, Info, X } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { importMonitoredEntities, fetchSamplePreview, startAdverseMediaScreening, agentPortfolioEnrich, type MonitoredEntityImportRow } from "@/lib/dashboard-data";
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
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all-risks");
  const [ratingFilter, setRatingFilter] = useState("all-ratings");
  const [exposureFilter, setExposureFilter] = useState("all-exposures");
  const [alertFilter, setAlertFilter] = useState("all-severities");
  
  // Modal State
  const [selectedCompany360, setSelectedCompany360] = useState<any | null>(null);

  const [importedDataRows, setImportedDataRows] = useState<MonitoredEntityImportRow[]>([]);

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
  


  const [manualEntityName, setManualEntityName] = useState("");
  const [manualEntityType, setManualEntityType] = useState("");
  const [manualJurisdiction, setManualJurisdiction] = useState("");
  
  const [isCrawlerDialogOpen, setIsCrawlerDialogOpen] = useState(false);
  const [crawlerCompanyName, setCrawlerCompanyName] = useState("");
  const [crawlerCompanyDomain, setCrawlerCompanyDomain] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerLoadingText, setCrawlerLoadingText] = useState("Extracting...");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCrawling) {
      const phrases = ["Extracting...", "Attracting...", "Sourcing...", "Gathering Intel...", "Analyzing..."];
      let idx = 0;
      setCrawlerLoadingText(phrases[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % phrases.length;
        setCrawlerLoadingText(phrases[idx]);
      }, 1500);
    } else {
      setCrawlerLoadingText("Extracting...");
    }
    return () => clearInterval(interval);
  }, [isCrawling]);

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
          const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
          const endpointUrl = `${API_BASE}/croftz/corporate-registry-screening`;
          const CROFTZ_KEY = import.meta.env.VITE_CROFTZ_API_KEY || "sk_0d514a86648edbc36840257f3303ea6fd65874b0cad898cd913199d10f0a4b0d";

          // ── Build form payload ──
          const formData = new URLSearchParams();
          formData.append("name", normalizedDomain);
          formData.append("entityType", "company");
          formData.append("exactMatch", "false");
          formData.append("fuzzinessThreshold", "100");
          formData.append("monitor", "false");
          formData.append("countryCodes", "");
          formData.append("monitoringDuration", "60");
          formData.append("monitoringRenew", "false");

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

          // ── Extract screeningUid and fetch details via GET ──
          let screeningUid = postBody.screeningUid || postBody.screening?.rowUid;
          if (!screeningUid && postBody.screeningResults?.length > 0) {
            screeningUid = postBody.screeningResults[0].screeningUid || postBody.screeningResults[0].id;
          }
          if (!screeningUid && postBody.data?.length > 0) {
            screeningUid = postBody.data[0].screeningUid;
          }

          if (screeningUid) {
            console.group(`%c[Croftz] GET Request → ${screeningUid}`, 'color: #2563eb; font-weight: bold; font-size: 13px;');
            const getEndpointUrl = `${endpointUrl}?crScreeningUid=${screeningUid}`;
            console.log('URL:', getEndpointUrl);
            
            const getResp = await fetch(getEndpointUrl, {
              method: "GET",
              headers: {
                "x-api-key": CROFTZ_KEY
              }
            });

            console.group(`%c[Croftz] GET Response ← ${getResp.status} ${getResp.statusText}`, getResp.ok ? 'color: #16a34a; font-weight: bold;' : 'color: #dc2626; font-weight: bold;');
            if (!getResp.ok) {
              const errText = await getResp.text();
              console.log('Error Body (raw text):', errText);
              console.groupEnd();
              throw new Error("Croftz GET returned " + getResp.status + ": " + errText);
            }

            const getData = await getResp.json();
            console.log('Full GET Response JSON:', JSON.parse(JSON.stringify(getData)));
            console.groupEnd();
            console.groupEnd(); // close request group

            const getBody = getData.response || getData;
            
            // Extract results from GET response
            const results = getBody.results || (getBody.screeningResults && getBody.screeningResults[0]?.results) || getBody;

            setImportedDataRows(prev => prev.map(row =>
              row.externalReference === externalRef
                ? { ...row, identifiers: { ...row.identifiers, corporateRegistry: results } }
                : row
            ));
            toast({ title: "✅ Screening Complete", description: `Risk data loaded for ${normalizedDomain}.` });
          } else if (postBody.screeningResults?.length > 0) {
            console.warn('[Croftz] No screeningUid found, falling back to POST response results');
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
      const crawlerUrl = `${API_BASE}/v1/crawler/extract-company-info`;

      // 5-minute timeout — crawler does heavy scraping, needs time
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);

      const crawlerResp = await fetch(crawlerUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!crawlerResp.ok) {
        throw new Error(`Crawler API error: ${crawlerResp.statusText}`);
      }

      const crawlerData = await crawlerResp.json();
      console.log("CRAWLER PAYLOAD RECEIVED:", crawlerData);

      // ── Step 2 & 3: Agent Studio Enrichment (via backend — key never exposed to browser) ──
      toast({
        title: "Step 2/3: Agent Analysis",
        description: "Sending extracted data to Agent Studio for enrichment...",
      });

      const { result: agentFinalResult } = await agentPortfolioEnrich(crawlerData);
      if (!agentFinalResult) throw new Error("Agent Studio returned empty result");
      console.log("AGENT STUDIO FINAL RESULT:", agentFinalResult);

      // ── Close dialog IMMEDIATELY ──
      setIsCrawlerDialogOpen(false);
      setCrawlerCompanyName("");
      setCrawlerCompanyDomain("");

      toast({
        title: "Step 3/3: Risk Screening",
        description: `Agent enrichment complete. Initiating Croftz registry screening...`
      });

      let newEntities: MonitoredEntityImportRow[] = [];
      
      // Ensure agentFinalResult is an array, or wrap it
      const extractedList = Array.isArray(agentFinalResult) ? agentFinalResult : 
                           (agentFinalResult.entities ? agentFinalResult.entities : 
                           (agentFinalResult.data ? agentFinalResult.data : [agentFinalResult]));
      
      if (extractedList && extractedList.length > 0) {
        newEntities = extractedList.map((e: any, idx: number) => {
          const profile = e.masterEntityProfile || e;
          return {
            name: profile.fullName || profile.name || profile.companyName || crawlerCompanyName || crawlerCompanyDomain || "Unknown Entity",
            entityType: "company",
            jurisdiction: profile.jurisdiction || profile.ipCountry || "Unknown",
            riskScore: profile.financials?.revenue ? 45 : 20, // default placeholder
            externalReference: profile.normalizedDomain || profile.website || `CRAWL-${Date.now()}-${idx}`,
            notes: profile.aboutCompany?.brief || profile.description || ""
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
      
      // Merge with previous (must return new state AND capture for later use)
      let updatedEntities: MonitoredEntityImportRow[] = [];
      setImportedDataRows(prev => {
        const combined = [...newEntities, ...prev];
        const unique = Array.from(new Map(combined.map(item => [item.externalReference, item])).values());
        updatedEntities = unique;
        return unique;
      });

      // Kick off adverse media screening with the company's full name
      if (extractedList && extractedList.length > 0) {
        const firstExtracted = extractedList[0];
        const profile = firstExtracted.masterEntityProfile || firstExtracted;
        const companyFullName = (
          profile.fullName ||
          profile.name ||
          profile.companyName ||
          crawlerCompanyName ||
          crawlerCompanyDomain ||
          "Unknown"
        ).split("|")[0].trim();

        startAdverseMediaScreening(companyFullName, crawlerData)
          .then(({ alertCount }) => {
            if (alertCount > 0) {
              toast({
                title: `Adverse Media Found`,
                description: `${alertCount} alert(s) detected for ${companyFullName}. Check the Alerts page.`
              });
            }
          })
          .catch(err => console.warn("[Adverse Media] Screening unavailable:", err));
      }

      if (extractedList && extractedList.length > 0) {
        newEntities.forEach((entity, idx) => {
          const e = extractedList[idx];
          const profile = e.masterEntityProfile || e;

          const rawPhone = String(profile.phone || profile.clearbitPhone || "");
          const cleanPhone = rawPhone ? rawPhone.split("|")[0].trim() : null;

          const rawWebsite = String(profile.website || profile.url || profile.clearbitDomain || profile.normalizedDomain || "");
          const cleanWebsite = rawWebsite ? rawWebsite.split("|")[0].trim() : null;

          const rawAddress = String(profile.address || profile.clearbitGeo || profile.ipCountry || "");
          const cleanAddress = rawAddress ? rawAddress.split("|")[0].trim() : null;

          const crawlerIdentifiers = {
            website: cleanWebsite,
            phone: cleanPhone,
            address: cleanAddress,
            legalType: profile.legalType || profile.clearbitType || "Corporate Entity",
            duns: profile.duns,
            aboutCompany: profile.aboutCompany || { brief: profile.description || profile.homeContent?.substring(0, 300) + "..." },
            keyPersonnel: profile.keyPersonnel || [],
            keyCompetitors: profile.keyCompetitors || [],
            financials: profile.financials || {},
            riskIndicators: profile.riskIndicators || {},
            sourceEvidence: profile.sourceEvidence || {},
            summary: profile.summary || {}
          };

          // Update the rawIdentifiers for the specific row
          setImportedDataRows(currentRows => 
            currentRows.map(row => 
              row.externalReference === entity.externalReference 
                ? { ...row, rawIdentifiers: crawlerIdentifiers } 
                : row
            )
          );

          // ── Pass ONLY e.normalizedDomain to Croftz POST ──
          let normalizedDomain = profile.normalizedDomain || cleanWebsite;
          if (normalizedDomain) {
            normalizedDomain = normalizedDomain.replace(/^https?:\/\//, '').split('/')[0];
          }
          if (normalizedDomain && entity.externalReference) {
            console.log(`[Croftz] Using normalizedDomain: "${normalizedDomain}" for externalRef: "${entity.externalReference}"`);
            initiateCorporateRegistryScreening(normalizedDomain, entity.externalReference);
          } else {
            console.warn(`[Croftz] No normalizedDomain found in agent response for entity at index ${idx}. Skipping screening.`, e);
            toast({ title: "No Domain Found", description: `Could not extract normalizedDomain for ${entity.name}. Screening skipped.`, variant: "destructive" });
          }
        });

        // Persist to backend node-cache
        importMonitoredEntities(updatedEntities).then(() => {
          queryClient.invalidateQueries({ queryKey: ["portfolio-sample"] });
        }).catch(err => console.error("Failed to persist to node cache", err));
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast({ title: "Crawler Timeout", description: "The crawler is taking too long. The server may be busy — please try again in a moment.", variant: "destructive" });
      } else {
        toast({ title: "Crawler Failed", description: error instanceof Error ? error.message : "Network error", variant: "destructive" });
      }
    } finally {
      setIsCrawling(false);
      setIsCrawlerDialogOpen(false);
      setCrawlerCompanyName("");
      setCrawlerCompanyDomain("");
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
    // Show both crawled data and the API sample data (consolidated_entities.json)
    const formattedSample = sampleRows.map((row: any, index: number) => {
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
        id: `sample-${row.masterEntityProfile?.externalReference || index}`,
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

    const formattedImported = importedDataRows.map((row, index) => {
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
        id: `imported-${row.externalReference || index}`,
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
        externalReference: row.externalReference || `ENT-IMP-${index}`,
        rawIdentifiers: { ...(row.rawIdentifiers || {}), ...(row.identifiers || {}) }
      };
    });

    const combined = [...formattedImported, ...formattedSample];
    
    // Deduplicate by name or externalReference
    const uniqueMap = new Map();
    combined.forEach(item => {
      const key = item.externalReference || item.name.toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    
    return Array.from(uniqueMap.values());
  }, [importedDataRows, sampleRows]);

  const filteredData = useMemo(() => {
    return displayData.filter(row => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !row.name.toLowerCase().includes(query) && 
          !row.country.toLowerCase().includes(query) && 
          !row.industry.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // 2. Risk Level
      if (riskFilter !== "all-risks") {
        if (riskFilter === "critical" && row.riskScore < 80) return false;
        if (riskFilter === "high" && (row.riskScore < 60 || row.riskScore >= 80)) return false;
        if (riskFilter === "medium" && (row.riskScore < 30 || row.riskScore >= 60)) return false;
        if (riskFilter === "low" && row.riskScore >= 30) return false;
      }

      // 3. Rating
      if (ratingFilter !== "all-ratings" && row.rating !== ratingFilter) {
        return false;
      }

      // 4. Exposure
      if (exposureFilter !== "all-exposures") {
        const rev = row.rawIdentifiers?.revenue || row.rawIdentifiers?.financials?.revenue || 0;
        if (exposureFilter === "<1M" && (rev === 0 || rev >= 1000000)) return false;
        if (exposureFilter === "1M-1B" && (rev < 1000000 || rev >= 1000000000)) return false;
        if (exposureFilter === ">1B" && rev < 1000000000) return false;
      }

      // 5. Alerts
      if (alertFilter !== "all-severities" && row.alert !== alertFilter) {
        return false;
      }

      return true;
    });
  }, [displayData, searchQuery, riskFilter, ratingFilter, exposureFilter, alertFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, riskFilter, ratingFilter, exposureFilter, alertFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);



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

      setImportedDataRows(prev => {
        const combined = [...mapped, ...prev];
        const unique = Array.from(new Map(combined.map(item => [item.externalReference, item])).values());
        return unique;
      });
      
      // Persist to node-cache
      importMonitoredEntities(mapped).then(() => {
        queryClient.invalidateQueries({ queryKey: ["portfolio-sample"] });
      }).catch(err => console.error("Failed to persist to node cache", err));
      
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

      setImportedDataRows(prev => {
        const combined = [...mapped, ...prev];
        const unique = Array.from(new Map(combined.map(item => [item.externalReference, item])).values());
        return unique;
      });
      
      // Persist to node-cache
      importMonitoredEntities(mapped).then(() => {
        queryClient.invalidateQueries({ queryKey: ["portfolio-sample"] });
      }).catch(err => console.error("Failed to persist to node cache", err));

      toast({ title: "JSON Data Imported", description: `${mapped.length} entities are ready for onboarding.` });
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
                  <Input 
                    placeholder="Search companies..." 
                    className="pl-9 bg-transparent border-0 h-10 w-full focus-visible:ring-0 text-[13px] placeholder:text-slate-400 shadow-none" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[180px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Risk Level:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-risks" className="text-[13px] font-medium">All Risks</SelectItem>
                    <SelectItem value="critical" className="text-[13px] font-medium">Critical (80+)</SelectItem>
                    <SelectItem value="high" className="text-[13px] font-medium">High (60-79)</SelectItem>
                    <SelectItem value="medium" className="text-[13px] font-medium">Medium (30-59)</SelectItem>
                    <SelectItem value="low" className="text-[13px] font-medium">Low (0-29)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-[180px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Rating:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-ratings" className="text-[13px] font-medium">All Ratings</SelectItem>
                    <SelectItem value="CCC" className="text-[13px] font-medium">CCC</SelectItem>
                    <SelectItem value="BBB" className="text-[13px] font-medium">BBB</SelectItem>
                    <SelectItem value="AA" className="text-[13px] font-medium">AA</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={exposureFilter} onValueChange={setExposureFilter}>
                  <SelectTrigger className="w-[200px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 border-r border-slate-100 rounded-none pr-3">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Exposure:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-exposures" className="text-[13px] font-medium">All Exposures</SelectItem>
                    <SelectItem value=">1B" className="text-[13px] font-medium">Over $1B</SelectItem>
                    <SelectItem value="1M-1B" className="text-[13px] font-medium">$1M - $1B</SelectItem>
                    <SelectItem value="<1M" className="text-[13px] font-medium">Under $1M</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={alertFilter} onValueChange={setAlertFilter}>
                  <SelectTrigger className="w-[190px] h-10 bg-transparent border-0 font-semibold text-slate-700 shadow-none text-[13px] focus:ring-0 pr-2">
                    <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> <span className="text-slate-400 font-medium mr-1">Alerts:</span> <SelectValue /></div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-lg border-slate-100">
                    <SelectItem value="all-severities" className="text-[13px] font-medium">All Severities</SelectItem>
                    <SelectItem value="Critical" className="text-[13px] font-medium">Critical</SelectItem>
                    <SelectItem value="Medium" className="text-[13px] font-medium">Medium</SelectItem>
                    <SelectItem value="Low" className="text-[13px] font-medium">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="ghost" 
                  className="h-9 px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-[13px] font-medium ml-auto rounded-lg"
                  disabled={!(searchQuery !== "" || riskFilter !== "all-risks" || ratingFilter !== "all-ratings" || exposureFilter !== "all-exposures" || alertFilter !== "all-severities")}
                  onClick={() => {
                    setSearchQuery("");
                    setRiskFilter("all-risks");
                    setRatingFilter("all-ratings");
                    setExposureFilter("all-exposures");
                    setAlertFilter("all-severities");
                  }}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Clear All
                </Button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200/80">
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 pl-6">Company</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">Country</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4">Industry</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            Risk Score
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 rounded-full" aria-label="Risk Score Information">
                                  <Info className="h-3.5 w-3.5" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent side="top" className="w-64 p-3 shadow-lg border-slate-200">
                                <div className="space-y-2">
                                  <h4 className="font-bold text-[13px] text-slate-800">Risk Score Levels</h4>
                                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[12px]">
                                    <span className="font-bold text-red-500">80 - 100</span>
                                    <span className="text-slate-600">Critical Risk</span>
                                    <span className="font-bold text-amber-500">50 - 79</span>
                                    <span className="text-slate-600">Medium/High Risk</span>
                                    <span className="font-bold text-emerald-500">30 - 49</span>
                                    <span className="text-slate-600">Low Risk</span>
                                    <span className="font-bold text-blue-500">0 - 29</span>
                                    <span className="text-slate-600">Minimal Risk</span>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center">Rating</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-right">Exposure</TableHead>
                        <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-4 text-center pr-6">Alert</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-48 text-center">
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
                            
                            {/* Company */}
                            <TableCell className="py-4 pl-6 cursor-pointer" onClick={() => setSelectedCompany360(row)}>
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
                    Showing <span className="font-bold text-slate-700">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold text-slate-700">{filteredData.length}</span> companies
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
            <DialogContent aria-describedby={undefined} className="sm:max-w-[450px] bg-white border-slate-200">
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
                <Button onClick={handleCrawlerSubmit} disabled={isCrawling} className="bg-blue-600 hover:bg-blue-700 text-white w-[140px] transition-all">
                  {isCrawling ? <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" /> : <Wand2 className="h-4 w-4 mr-2 shrink-0" />}
                  <span className="truncate">{isCrawling ? crawlerLoadingText : "Start Extraction"}</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* API Dialog */}
          <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-slate-200">
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
            <DialogContent aria-describedby={undefined} className="sm:max-w-[500px] bg-white border-slate-200">
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
              rawIdentifiers: { ...(liveRow.rawIdentifiers || {}), ...(liveRow.identifiers || {}) }
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
        <DialogContent aria-describedby={undefined} className="sm:max-w-[600px] border-slate-100 shadow-xl rounded-xl p-0 overflow-hidden">
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
