import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, Sparkles, ExternalLink, AlertTriangle, TrendingDown, Clock, Tag, Shield, Loader2 } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { fetchAlerts, startInvestigation } from "@/lib/dashboard-data";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { AgentChatbot } from "@/components/AgentChatbot";

const severityDot = (s: string) => {
  const str = String(s).toLowerCase();
  return str === 'critical' ? 'bg-red-500' : str === 'high' ? 'bg-orange-500' : str === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
};

const sentimentLabel = (s: string) => {
  if (!s) return null;
  return s.replace(/_/g, " ");
};

const sentimentColor = (s: string) => {
  if (!s) return "text-slate-500";
  const l = s.toLowerCase();
  if (l.includes("severely")) return "text-red-600";
  if (l.includes("moderately")) return "text-orange-500";
  if (l.includes("slightly")) return "text-amber-500";
  return "text-slate-500";
};

// Normalise a sentiment string for comparison
const normSentiment = (s: string) => s?.toLowerCase().replace(/_/g, " ").trim() ?? "";

const STATIC_FILTERS = ["All"] as const;
const SENTIMENT_FILTERS = [
  "severely negative",
  "moderately negative",
  "slightly negative",
];

const LiveAlerts = () => {
  const { data: alerts = [] } = useQuery({
    queryKey: ["live-alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 10000,
  });
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [viewingAlertId, setViewingAlertId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Gather unique sentiments that actually appear in current alerts
  const liveSentiments = useMemo(() => {
    const seen = new Set<string>();
    (alerts as any[]).forEach((a: any) => {
      if (a.sentiment) seen.add(normSentiment(a.sentiment));
    });
    // Preserve the canonical order
    return SENTIMENT_FILTERS.filter(f => seen.has(f));
  }, [alerts]);

  const filterOptions = ["All", ...liveSentiments];

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "All") return alerts as any[];
    return (alerts as any[]).filter(
      (a: any) => normSentiment(a.sentiment) === activeFilter
    );
  }, [alerts, activeFilter]);

  const handleView = async (alert: any, entityName: string) => {
    if (alert.source === "Croftz" && alert.id) {
      setViewingAlertId(alert.id);
      try {
        const { investigationId } = await startInvestigation(alert.id);
        navigate(`/investigations/${investigationId}`, {
          state: {
            alertId: alert.id,
            isCroftzAlert: true,
            investigationId,
            entity: {
              name: entityName,
              risk_score: alert.riskScore || 40,
              latest_signal: alert.title,
              entity_type: "company"
            }
          }
        });
      } catch (err) {
        console.error("Failed to start investigation:", err);
        toast({ title: "Error", description: "Could not start investigation.", variant: "destructive" });
      } finally {
        setViewingAlertId(null);
      }
    } else {
      const caseId = alert.id || "ALT-4891";
      navigate(`/investigations/${caseId}`, {
        state: {
          entity: {
            name: entityName,
            risk_score: alert.severity === "critical" ? 95 : alert.severity === "high" ? 75 : 50,
            latest_signal: alert.title
          }
        }
      });
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex h-[calc(100vh-3.5rem)] bg-white overflow-hidden">

        {/* Left Sidebar — Filters */}
        <div className="w-56 flex-shrink-0 border-r border-slate-200/80 bg-white p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5 text-slate-800">
            <Filter className="h-4 w-4" />
            <h3 className="font-bold text-[15px]">Filters</h3>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 px-1">Sentiment</p>
          <div className="flex flex-col space-y-0.5">
            {filterOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors capitalize
                  ${activeFilter === opt
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                {opt === "All" ? "All Alerts" : opt}
              </button>
            ))}
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FC] p-8">
          {filteredAlerts.length === 0 && (
            <div className="p-10 text-center text-slate-400 border rounded-xl border-dashed bg-white">
              {activeFilter === "All"
                ? "No alerts yet. Add a company from the Portfolio page to begin monitoring."
                : `No alerts with sentiment "${activeFilter}".`}
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-5">
            {filteredAlerts.map((alert: any, i: number) => {
              const entityName = alert.monitored_entities?.name || alert.companyName || "Unknown Entity";
              const isCroftz = alert.source === "Croftz";
              const isLoadingThis = viewingAlertId === alert.id;

              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-white rounded-xl border border-slate-200/80 shadow-sm transition-all flex flex-col gap-0 relative hover:shadow-md hover:border-blue-300"
                >
                  {/* Croftz source banner */}
                  {isCroftz && (
                    <div className="flex items-center gap-2 px-5 pt-3 pb-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                        <Shield className="w-2.5 h-2.5" /> Adverse Media · Croftz
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className={`h-2 w-2 rounded-full ${severityDot(alert.severity)}`} />
                        {/* Flag for the news country (not entity country) */}
                        {isCroftz && alert.country && (
                          <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
                            <img
                              src={`https://flagcdn.com/w20/${alert.country}.png`}
                              alt={alert.country}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-bold text-blue-600 text-[14px]">{entityName}</span>
                        {isCroftz && alert.country && (
                          <span className="text-slate-400 text-[12px]">- {alert.country.toUpperCase()}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 z-10">
                        <div className="text-[12px] font-mono text-slate-400">
                          {isCroftz && alert.publicationDate
                            ? new Date(alert.publicationDate).toISOString().split("T")[0]
                            : alert.generated_at?.split("T")[0] ?? ""}
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleView(alert, entityName)}
                            disabled={isLoadingThis}
                            className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                          >
                            {isLoadingThis ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                            Move to Investigation
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[14px] text-slate-800 leading-snug">{alert.title}</h3>

                    {/* Croftz meta row */}
                    {isCroftz && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {alert.sentiment && (
                          <span className={`flex items-center gap-1 text-[11px] font-semibold ${sentimentColor(alert.sentiment)}`}>
                            <TrendingDown className="w-3 h-3" />
                            {sentimentLabel(alert.sentiment)}
                          </span>
                        )}
                        {alert.link && (
                          <a
                            href={alert.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] text-blue-500 hover:underline font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> Source article
                          </a>
                        )}
                        {alert.publicationDate && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3" />
                            {new Date(alert.publicationDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                        {typeof alert.score === "number" && (
                          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Score: {alert.score}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Adverse keywords */}
                    {isCroftz && alert.adverseKeywords?.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        {alert.adverseKeywords.slice(0, 8).map((kw: string) => (
                          <span key={kw} className="text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Summary */}
                    <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100 flex items-start gap-2 mt-1">
                      <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[12.5px] italic text-blue-700/80 leading-relaxed">
                        <span className="font-bold mr-1">AI Summary:</span>
                        {alert.summary || alert.description}
                      </p>
                    </div>

                    {/* Open Investigation CTA */}
                    {isCroftz && (
                      <button
                        onClick={() => handleView(alert, entityName)}
                        disabled={isLoadingThis}
                        className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                      >
                        {isLoadingThis
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Starting investigation...</>
                          : <><AlertTriangle className="w-3 h-3" /> Open Full Investigation</>
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAlerts;
