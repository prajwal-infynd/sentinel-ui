import os
import re

FILE_PATH = "src/components/Company360Modal.tsx"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add imports
if "useState" not in content:
    content = content.replace(
        'import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";',
        'import { useState, useEffect } from "react";\nimport { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";\nimport { Skeleton } from "@/components/ui/skeleton";'
    )

# 2. Add local state & useEffect
state_code = """
  const [localCroftzData, setLocalCroftzData] = useState<any>(null);
  const [isFetchingCroftz, setIsFetchingCroftz] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLocalCroftzData(null);
      setIsFetchingCroftz(false);
    }
  }, [isOpen]);

  useEffect(() => {
    // Only fetch if screening is pending and we don't have data yet
    if (isOpen && isScreeningPending && !isFetchingCroftz && !localCroftzData) {
      const fetchCroftz = async () => {
        setIsFetchingCroftz(true);
        try {
          const endpointUrl = "/croftz-api/api/v1/corporate-registry-screening";
          const CROFTZ_KEY = import.meta.env.VITE_CROFTZ_API_KEY || "sk_0d514a86648edbc36840257f3303ea6fd65874b0cad898cd913199d10f0a4b0d";
          
          const website = identifiers.website || payload.url;
          let domain = companyName;
          if (website) {
            domain = website.replace(/^https?:\\/\\//, '').replace(/^www\\./, '').split('/')[0];
          } else if (companyName) {
            domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
          }

          const formData = new URLSearchParams();
          formData.append("name", domain || "unknown.com");
          formData.append("entityType", "company");
          formData.append("exactMatch", "false");
          formData.append("fuzzinessThreshold", "100");
          formData.append("monitor", "false");
          formData.append("countryCodes", "");
          formData.append("monitoringDuration", "60");
          formData.append("monitoringRenew", "false");

          const postResp = await fetch(endpointUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "x-api-key": CROFTZ_KEY
            },
            body: formData.toString()
          });

          if (!postResp.ok) throw new Error("POST failed");
          const postData = await postResp.json();
          const postBody = postData.response || postData;

          let screeningUid = postBody.screeningUid || postBody.screening?.rowUid;
          if (!screeningUid && postBody.screeningResults?.length > 0) {
            screeningUid = postBody.screeningResults[0].screeningUid || postBody.screeningResults[0].id;
          }
          if (!screeningUid && postBody.data?.length > 0) {
            screeningUid = postBody.data[0].screeningUid;
          }

          if (screeningUid) {
            const getResp = await fetch(`${endpointUrl}?crScreeningUid=${screeningUid}`, {
              headers: { "x-api-key": CROFTZ_KEY }
            });
            if (getResp.ok) {
              const getData = await getResp.json();
              const getBody = getData.response || getData;
              const results = getBody.results || (getBody.screeningResults && getBody.screeningResults[0]?.results) || getBody;
              setLocalCroftzData(results);
            }
          } else if (postBody.screeningResults?.length > 0) {
             setLocalCroftzData(postBody.screeningResults[0].results);
          }
        } catch (e) {
          console.error("Croftz fetch error", e);
        } finally {
          setIsFetchingCroftz(false);
        }
      };
      fetchCroftz();
    }
  }, [isOpen, isScreeningPending, isFetchingCroftz, localCroftzData, companyName, identifiers.website, payload.url]);
"""

# Find where to inject state code
if "setLocalCroftzData" not in content:
    content = content.replace(
        "const isScreeningPending = !croftz && !payload.fiscalYear;",
        "const isScreeningPending = !croftz && !payload.fiscalYear;\n" + state_code
    )

    # Change how `croftz` is evaluated:
    content = content.replace(
        "const croftz = identifiers.corporateRegistry ?? null; // Croftz screeningResults[0].results",
        "const croftz = localCroftzData ?? identifiers.corporateRegistry ?? null; // Updated to include local data"
    )

# Now, add Skeletons into the risk panel, corporate registry, match categories, adverse media
risk_panel_old = "{riskScore !== null && riskColors && ("
risk_panel_new = """{isFetchingCroftz ? (
                <div className="bg-white border rounded-2xl p-5 shadow-sm border-slate-200 flex flex-col justify-between">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Risk Assessment
                  </h3>
                  <div className="mb-4">
                    <div className="flex items-end gap-2 mb-1">
                      <Skeleton className="h-10 w-16" />
                      <div className="text-[12px] text-slate-400 mb-1">/100</div>
                    </div>
                    <Skeleton className="w-full h-2 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div>
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ) : riskScore !== null && riskColors && ("""

if risk_panel_old in content and "isFetchingCroftz ?" not in content:
    content = content.replace(risk_panel_old, risk_panel_new)

corporate_registry_old = """            {/* Corporate Registry */}
            {(() => {
              const rawCr = companyData.rawIdentifiers?.corporateRegistry;"""
corporate_registry_new = """            {/* Corporate Registry */}
            {(() => {
              if (isFetchingCroftz) {
                 return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-6">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Corporate Registry Details
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({length: 8}).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-3 w-20 mb-1" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  </div>
                 );
              }

              const rawCr = croftz;"""

if corporate_registry_old in content:
    content = content.replace(corporate_registry_old, corporate_registry_new)

categories_old = """            {/* Categories & Attributes */}
            {(categories.length > 0 || countries.length > 0) && ("""
categories_new = """            {/* Categories & Attributes */}
            {isFetchingCroftz ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Match Categories & Attributes
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="flex gap-2">
                       <Skeleton className="h-6 w-20 rounded-full" />
                       <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <div className="flex gap-2">
                       <Skeleton className="h-6 w-16 rounded-full" />
                       <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (categories.length > 0 || countries.length > 0) && ("""

if categories_old in content:
    content = content.replace(categories_old, categories_new)


adverse_old = """            {/* Adverse Media Analysis */}
            {adverseMedia && ("""
adverse_new = """            {/* Adverse Media Analysis */}
            {isFetchingCroftz ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" /> Adverse Media Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                     <Skeleton className="h-4 w-40 mb-4" />
                     <div className="space-y-3">
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-5/6" />
                       <Skeleton className="h-4 w-4/6" />
                     </div>
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="flex flex-wrap gap-2">
                       {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-6 w-20 rounded-md" />)}
                    </div>
                  </div>
                </div>
              </div>
            ) : adverseMedia && ("""

if adverse_old in content:
    content = content.replace(adverse_old, adverse_new)

with open(FILE_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("Rewrote Company360Modal.tsx successfully")
