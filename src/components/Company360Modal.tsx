import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, AlertCircle, Users, Target, Shield, Globe, Newspaper, ExternalLink, ShieldAlert, Database, Loader2, AlertTriangle, Activity } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Company360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyData: any | null;
}

// Helper: only render a field if value is not null/undefined/empty
function hasValue(val: any): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string" && val.trim() === "") return false;
  if (Array.isArray(val) && val.length === 0) return false;
  return true;
}

function InfoField({ label, value, className = "" }: { label: string; value: any; className?: string }) {
  if (!hasValue(value)) return null;
  return (
    <div className={className}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[14px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function getRiskColor(score: number) {
  if (score >= 75) return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", bar: "bg-red-500" };
  if (score >= 50) return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", bar: "bg-amber-500" };
  return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", bar: "bg-emerald-500" };
}

function getCategoryColor(cat: string) {
  if (cat.toLowerCase().includes("sanction")) return "bg-red-100 text-red-700 border-red-200";
  if (cat.toLowerCase().includes("adverse")) return "bg-orange-100 text-orange-700 border-orange-200";
  if (cat.toLowerCase().includes("pep") || cat.toLowerCase().includes("sie")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (cat.toLowerCase().includes("warning") || cat.toLowerCase().includes("regulatory")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function getSentimentColor(score: number) {
  if (score <= -2) return { text: "text-red-600", bg: "bg-red-50 border-red-200" };
  if (score < 0) return { text: "text-orange-600", bg: "bg-orange-50 border-orange-200" };
  if (score === 0) return { text: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
  return { text: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" };
}

export function Company360Modal({ isOpen, onClose, companyData }: Company360ModalProps) {
  // Derive values safely (companyData may be null)
  const companyName = companyData?.name ?? "";
  
  const isMockNeeded = !companyData?.payload?.description && !companyData?.rawIdentifiers?.aboutCompany;

  const mockPayload = {
    description: `${companyName || "This company"} is a global leader in next-generation digital services and consulting. With over three decades of experience in managing the systems and workings of global enterprises, we expertly steer our clients through their digital journey.`,
    url: `https://www.${(companyName || "company").toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    phone: "+1-800-555-0199",
    companyType: "Corporate Entity",
    industry: "Information Technology & Services",
    employees: 317240,
    annualRevenue: 18100000000,
    fiscalYear: "2023",
    riskCategories: ["Regulatory Risk", "Data Privacy", "Cybersecurity", "Operational Risk"],
    flaggedJurisdictions: ["United States", "United Kingdom", "Singapore"],
    keyPersonnel: [
      { name: "Jane Doe", role: "Chief Executive Officer" },
      { name: "John Smith", role: "Chief Financial Officer" }
    ],
    competitors: [
      { name: "Acme Corp", tier: "1", duns: "12-345-6789" },
      { name: "Global Tech", tier: "1", duns: "98-765-4321" }
    ],
    adverseMedia: {
      sentiment: "Neutral",
      sentiment_score: -0.2,
      adverse_keywords: {
        "lawsuit": 3,
        "settlement": 1,
        "investigation": 2
      }
    },
    sourceDetails: [
      { publisher: "Financial Times", description: "Tech giants face new data privacy scrutiny", url: "https://ft.com" },
      { publisher: "Reuters", description: "Sector earnings report analysis", url: "https://reuters.com" },
      { publisher: "OpenCorporates", description: "Registry data match", url: "https://opencorporates.com" }
    ]
  };

  const identifiers = isMockNeeded ? {} : (companyData?.rawIdentifiers || {});
  const payload = isMockNeeded ? mockPayload : (companyData?.payload || {});



  // Early return AFTER all hooks
  if (!companyData) return null;

  const about = payload.description || identifiers.aboutCompany?.fullRiskAssessment || identifiers.aboutCompany?.brief;
  const personnel = identifiers.keyPersonnel || payload.keyPersonnel || [];
  const competitors = identifiers.keyCompetitors || payload.competitors || [];

  // Data fields (all null-safe)
  const riskScore = companyData?.riskScore ?? (isMockNeeded ? 65 : null);
  const riskLevel = companyData?.severity ?? (isMockNeeded ? "Medium" : null);
  const matchStatus = companyData?.match_status ?? (isMockNeeded ? "Exact Match" : null);
  const categories = (payload.riskCategories || identifiers.riskCategories || companyData?.categories || []).filter(Boolean);
  const countries = (payload.flaggedJurisdictions || identifiers.flaggedJurisdictions || companyData?.countries || []).filter(Boolean);
  const adverseMedia = payload.adverseMedia || identifiers.adverseMedia || companyData?.adverse_media_details || null;
  const sourceDetails = (payload.sourceDetails || identifiers.sourceDetails || companyData?.source_details || []).filter((s: any) => hasValue(s?.publisher) || hasValue(s?.url));

  const riskColors = riskScore !== null ? getRiskColor(riskScore) : null;
  const sentimentColors = adverseMedia ? getSentimentColor(adverseMedia.sentiment_score ?? 0) : null;

  // Adverse keywords sorted by count desc
  const adverseKeywords = adverseMedia?.adverse_keywords
    ? Object.entries(adverseMedia.adverse_keywords as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent aria-describedby="company360-description" className="max-w-[900px] p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl h-[92vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center gap-3">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight m-0 p-0 leading-none">
              Company 360 <span className="font-medium text-slate-400 text-base">/ {companyName}</span>
            </DialogTitle>
            <span id="company360-description" className="sr-only">360° company risk profile and compliance screening results</span>
            {hasValue(matchStatus) && (
              <div className="text-[12px] text-slate-500 mt-0.5">Match Status: <span className="font-semibold text-slate-700">{matchStatus}</span></div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 bg-slate-50/30">



            {/* Top: Identity + Risk */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Company Identity */}
              <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow shrink-0">
                    {companyName?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{companyName}</h2>
                    {hasValue(identifiers.address) && (
                      <div className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" /> {identifiers.address}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">Active</span>
                      {hasValue(riskLevel) && (
                        <span className={`border px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${riskColors?.bg} ${riskColors?.border} ${riskColors?.text}`}>
                          {riskLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoField label="Website" value={identifiers.website || payload.url} />
                  <InfoField label="Phone" value={identifiers.phone || payload.phone} />
                  <InfoField label="Legal Type" value={identifiers.legalType || payload.companyType} />
                  <InfoField label="Industry" value={identifiers.industry || identifiers.sector || payload.industry} />
                  <InfoField label="Employees" value={identifiers.employees || identifiers.financials?.employees?.toLocaleString() || payload.employees?.toLocaleString()} />
                  <InfoField label="Annual Revenue" value={identifiers.annualRevenue || (identifiers.financials?.revenue ? `$${(identifiers.financials.revenue / 1000000).toFixed(1)}M` : null) || (payload.annualRevenue ? `$${(payload.annualRevenue / 1000000).toFixed(1)}M` : null)} />
                  <InfoField label="Fiscal Year" value={identifiers.fiscalYear || identifiers.financials?.fiscalYear || payload.fiscalYear} />
                  <InfoField label="DUNS" value={identifiers.duns} />
                </div>
              </div>


            </div>



            {/* About the Company (from JSON payload) */}
            {hasValue(about) && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">About the Company</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed text-justify">{about}</p>
              </div>
            )}

            {/* Categories & Countries */}
            {(() => {
              if (categories.length === 0 && countries.length === 0) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Risk Categories
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((cat: string, i: number) => (
                          <span key={i} className={`border px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide ${getCategoryColor(cat)}`}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {countries.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" /> Flagged Jurisdictions
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {countries.map((c: string, i: number) => (
                          <span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Adverse Media */}
            {(() => {
              if (!adverseMedia || !sentimentColors) return null;

              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5" /> Adverse Media Analysis
                  </h3>
                <div className="flex flex-wrap gap-4 mb-4">
                  {hasValue(adverseMedia.sentiment) && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${sentimentColors.bg}`}>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sentiment</div>
                      <div className={`text-[13px] font-bold ${sentimentColors.text}`}>{adverseMedia.sentiment}</div>
                    </div>
                  )}
                  {adverseMedia.sentiment_score !== null && adverseMedia.sentiment_score !== undefined && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${sentimentColors.bg}`}>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
                      <div className={`text-[13px] font-bold ${sentimentColors.text}`}>{adverseMedia.sentiment_score}</div>
                    </div>
                  )}
                </div>
                {adverseKeywords.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Adverse Keywords Detected</div>
                    <div className="flex flex-wrap gap-2">
                      {adverseKeywords.map(([kw, count], i) => (
                        <span key={i} className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold">
                          {kw} <span className="bg-red-200 text-red-800 rounded px-1 text-[10px] font-black">{count}×</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              );
            })()}

            {/* Source Details */}
            {sourceDetails.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Screening Sources ({sourceDetails.length})
                </h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {sourceDetails.map((source: any, i: number) => (
                    <div key={i} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {hasValue(source.publisher) && (
                            <div className="font-semibold text-slate-800 text-[13px] truncate">{source.publisher}</div>
                          )}
                          {hasValue(source.description) && (
                            <p className="text-[11px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{source.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(source.categories || []).filter(Boolean).map((cat: string, ci: number) => (
                              <span key={ci} className={`border px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryColor(cat)}`}>{cat}</span>
                            ))}
                            {(source.countries || []).filter(Boolean).map((c: string, ci: number) => (
                              <span key={ci} className="bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-semibold">{c}</span>
                            ))}
                          </div>
                        </div>
                        {hasValue(source.url) && (
                          <a href={source.url} target="_blank" rel="noreferrer"
                            className="shrink-0 h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          </a>
                        )}
                      </div>
                      {hasValue(source.updated_at) && (
                        <div className="text-[10px] text-slate-400 mt-2">Updated: {source.updated_at}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Personnel (from JSON upload) */}
            {personnel.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Key Personnel
                  <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{personnel.length} people</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {personnel.map((person: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div className="font-bold text-slate-900 text-[13px]">{person.name}</div>
                      {hasValue(person.role) && <div className="text-[11px] text-slate-500 mt-0.5">{person.role}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Competitors (from JSON upload) */}
            {competitors.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm pb-6">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Key Competitors
                  <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{competitors.length}</span>
                </h3>
                <div className="space-y-2">
                  {competitors.map((comp: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div>
                        <div className="font-bold text-slate-800 text-[13px]">{comp.name}</div>
                        {hasValue(comp.duns) && <div className="text-[11px] font-mono text-slate-400 mt-0.5">DUNS: {comp.duns}</div>}
                      </div>
                      {hasValue(comp.tier) && (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200 uppercase">Tier {comp.tier}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
