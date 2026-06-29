import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Filter, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { fetchAlerts } from "@/lib/dashboard-data";
import { useNavigate } from "react-router-dom";
import { useInvestigations } from "@/context/InvestigationsContext";
import { toast } from "@/components/ui/use-toast";

const severityDot = (s: string) => {
  const str = String(s).toLowerCase();
  return str === 'critical' ? 'bg-red-500' : str === 'high' ? 'bg-orange-500' : str === 'medium' ? 'bg-amber-500' : 'bg-emerald-500';
}

const severityBadge = (s: string) => {
  const str = String(s).toLowerCase();
  return str === 'critical' ? 'bg-red-50 text-red-600 border-red-200' : 
         str === 'high' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
         str === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
         'bg-emerald-50 text-emerald-600 border-emerald-200';
}

const getFlag = (companyName: string) => {
  if (companyName?.includes("Wise") || companyName?.includes("Weir") || companyName?.includes("Thames") || companyName?.includes("Rolls")) return "gb";
  if (companyName?.includes("Sinaloa")) return "mx";
  if (companyName?.includes("Novosibirsk")) return "ru";
  return "us"; 
};

const getCountry = (companyName: string) => {
  if (companyName?.includes("Wise") || companyName?.includes("Weir") || companyName?.includes("Thames") || companyName?.includes("Rolls")) return "United Kingdom";
  if (companyName?.includes("Sinaloa")) return "Mexico";
  if (companyName?.includes("Novosibirsk")) return "Russia";
  return "United States"; 
};

const LiveAlerts = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ["live-alerts"], queryFn: fetchAlerts });
  const [activeCategory, setActiveCategory] = useState<string>("All Changes");
  const navigate = useNavigate();
  const { addCase } = useInvestigations();

  const handleView = (alert: any, entityName: string) => {
    const caseId = alert.id || 'ALT-4891';
    navigate(`/investigations/${caseId}`, { 
      state: { 
        entity: { 
          name: entityName, 
          risk_score: alert.severity === 'critical' ? 95 : alert.severity === 'high' ? 75 : alert.severity === 'medium' ? 50 : 25, 
          latest_signal: alert.title 
        } 
      } 
    });
  };

  const handleAddToInvestigate = (alert: any, entityName: string) => {
    if (alert.severity !== "critical" && alert.severity !== "high") return;
    
    const newCaseId = addCase({
      entity: {
        name: entityName,
        entity_type: "company",
        jurisdiction: getCountry(entityName) === "United States" ? "US" : getCountry(entityName) === "United Kingdom" ? "UK" : "Global",
        latest_signal: alert.title,
        risk_score: alert.severity === "critical" ? 95 : 75
      }
    });
    
    toast({ title: "Added to Inbox", description: "Alert moved to Investigations Inbox." });
    navigate(`/investigations/${newCaseId}`, { 
      state: { 
        entity: { 
          name: entityName, 
          risk_score: alert.severity === 'critical' ? 95 : 75, 
          latest_signal: alert.title 
        } 
      } 
    });
  };

  const categories = [
    "All Changes", "Credit Changes", "Financial Changes", "Director Changes", 
    "Ownership Changes", "Compliance Events", "Sanctions", "PEP Exposure", 
    "Adverse Media", "Legal Events", "Digital", "Employees", "Status Changes", 
    "High Risk", "Critical Only"
  ];

  const filteredAlerts = useMemo(() => {
    if (activeCategory === "All Changes") return alerts;
    if (activeCategory === "High Risk") return alerts.filter((a: any) => a.severity === "high" || a.severity === "critical");
    if (activeCategory === "Critical Only") return alerts.filter((a: any) => a.severity === "critical");
    return alerts.filter((a: any) => a.category === activeCategory);
  }, [alerts, activeCategory]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3.5rem)] bg-white overflow-hidden">
        
        {/* Left Sidebar - Filters */}
        <div className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white p-5 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 text-slate-800">
            <Filter className="h-4 w-4" />
            <h3 className="font-bold text-[15px]">Filters</h3>
          </div>
          
          <div className="flex flex-col space-y-1">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)} 
                className={`text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-colors 
                  ${activeCategory === cat 
                    ? (cat === "All Changes" ? "text-blue-600 bg-blue-50" : "text-blue-600 bg-blue-50") 
                    : (cat === "All Changes" ? "text-blue-500 hover:bg-slate-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Feed Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FC] p-8">
          
          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center text-slate-500 border rounded-xl border-dashed bg-white">
              No alerts found for category: {activeCategory}
            </div>
          )}

          <div className="max-w-5xl mx-auto space-y-5">
            {filteredAlerts.map((alert: any, i: number) => {
              const entityName = alert.monitored_entities?.name || "Unknown Entity";
              const isInvestigatable = alert.severity === "critical" || alert.severity === "high";
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleView(alert, entityName)}
                  className="group bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 transition-all flex flex-col gap-3 relative cursor-pointer hover:shadow-md hover:border-blue-300"
                >
                  {/* Alert Header Row */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`h-2 w-2 rounded-full ${severityDot(alert.severity)}`} />
                      <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
                        <img src={`https://flagcdn.com/w20/${getFlag(entityName)}.png`} alt="flag" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-blue-600 text-[14px] ml-1">{entityName}</span>
                      <span className="text-slate-400 text-[12px] ml-1">- {getCountry(entityName)}</span>
                      
                      <span className="ml-3 bg-white text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                        {alert.category || "Status"}
                      </span>
                      <span className={`ml-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize shadow-sm ${severityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 z-10">
                      <div className="text-[12px] font-mono text-slate-400">
                        {alert.generated_at ? alert.generated_at.split('T')[0] : "2026-06-23"}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(alert, entityName);
                          }}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          View
                        </button>
                        {isInvestigatable && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToInvestigate(alert, entityName);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Add to Inbox
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Alert Title */}
                  <h3 className="font-bold text-[14px] text-slate-800 leading-snug">
                    {alert.title}
                  </h3>
                  
                  {/* AI Summary Box */}
                  <div className="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100 flex items-start gap-2 mt-1">
                    <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[12.5px] italic text-blue-700/80 leading-relaxed">
                      <span className="font-bold mr-1">AI Summary:</span>
                      {alert.summary}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveAlerts;
