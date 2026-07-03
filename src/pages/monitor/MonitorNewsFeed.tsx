import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Filter, Settings, Search, ExternalLink, ShieldAlert, Sparkles, TrendingDown, Clock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mediaArticles } from "@/lib/mock-api";
import { useNavigate } from "react-router-dom";
import { startInvestigation } from "@/lib/dashboard-data";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function MonitorNewsFeed() {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All Changes");
  const navigate = useNavigate();
  const { toast } = useToast();

  const filterOptions = [
    "All Changes",
    "Credit Changes",
    "Financial Changes",
    "Director Changes",
    "Ownership Changes",
    "Compliance Events",
    "Sanctions",
    "PEP Exposure",
    "Adverse Media",
    "Legal Events",
    "Digital",
    "Employees"
  ];

  const handleInvestigate = async (article: any) => {
    setLoadingId(article.id);
    try {
      const { investigationId } = await startInvestigation(article.id);
      navigate(`/investigations/${investigationId}`, {
        state: {
          alertId: article.id,
          investigationId,
          entity: {
            name: article.matchedEntity || article.entities[0],
            risk_score: article.riskScore,
            latest_signal: article.headline,
            entity_type: "company"
          }
        }
      });
    } catch (err) {
      navigate(`/investigations/${article.id}`, {
        state: {
          entity: {
            name: article.matchedEntity || article.entities[0],
            risk_score: article.riskScore,
            latest_signal: article.headline
          }
        }
      });
    } finally {
      setLoadingId(null);
    }
  };

  const filteredArticles = mediaArticles.filter(article => 
    article.headline.toLowerCase().includes(search.toLowerCase()) || 
    article.summary.toLowerCase().includes(search.toLowerCase()) ||
    article.entities.some(e => e.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="flex gap-8 p-6 max-w-[1600px] mx-auto">
      {/* Sidebar for Filters */}
      <div className="w-56 shrink-0">
        <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
          <Filter className="w-4 h-4" /> Filters
        </div>
        <div className="flex flex-col space-y-3">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-sm text-left transition-colors font-medium px-2 py-1 -ml-2 rounded-md ${
                activeFilter === filter 
                  ? "text-pink-600" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-4">
        {/* Header line */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4 pb-2 border-b border-slate-100">
          <div>Showing <span className="font-bold text-slate-900">{filteredArticles.length} events</span> · Live stream</div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs tracking-wider">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> LIVE
          </div>
        </div>

        <AnimatePresence>
          {filteredArticles.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Rss className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No News Found</h3>
                <p className="text-slate-500 max-w-sm mb-6">
                  There are currently no relevant news articles matching your search criteria.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setSearch("")}>
                  Clear Search
                </Button>
              </div>
            </motion.div>
          ) : (
            filteredArticles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all rounded-xl p-5 flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        article.severity === 'critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                        article.severity === 'high' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        article.severity === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {article.severity} Risk
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Globe className="w-3 h-3" /> {article.source}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" /> {article.timestamp}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer">
                      {article.headline}
                    </h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">
                      Score: {article.riskScore}/100
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700 mr-1">AI Summary:</span>
                      {article.summary}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500">Entities:</span>
                    {article.entities.map((entity, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] bg-white hover:bg-slate-50 text-slate-600">
                        {entity}
                      </Badge>
                    ))}
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="text-xs font-semibold text-slate-500">Tags:</span>
                    {article.riskTags.map((tag, i) => (
                      <span key={i} className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Read Source
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={loadingId === article.id}
                      onClick={() => handleInvestigate(article)}
                    >
                      {loadingId === article.id && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
                      Move to Investigation
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
