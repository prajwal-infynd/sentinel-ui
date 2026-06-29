import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AlertTriangle, Sparkles, Brain, AlertCircle, Database, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchSamplePreview } from "@/lib/dashboard-data";

const mockCriticalAlerts = [
  {
    id: 1,
    company: "Xbox (Microsoft Corporation)",
    severity: "Critical",
    type: "Operational Alert",
    description: "Microsoft evaluating Xbox spin-off options including independent company, joint venture, or subsidiary restructuring - significant strategic uncertainty for the gaming division",
    aiAction: "Microsoft evaluating Xbox spin-off options including independent company, joint venture, or subsidiary restructuring - significant strategic uncertainty for the gaming division",
    flag: "🇺🇸",
    logoBg: "bg-green-500",
    initial: "X"
  },
  {
    id: 2,
    company: "Xbox (Microsoft Corporation)",
    severity: "Critical",
    type: "Market Alert",
    description: "Microsoft stock entered bear market territory with 23% YTD decline, worst performer among Magnificent Seven stocks, reflecting broader tech sector rotation and investor concerns",
    aiAction: "Microsoft stock entered bear market territory with 23% YTD decline, worst performer among Magnificent Seven stocks, reflecting broader tech sector rotation and investor concerns",
    flag: "🇺🇸",
    logoBg: "bg-green-500",
    initial: "X"
  },
  {
    id: 3,
    company: "Wise",
    severity: "Critical",
    type: "Regulatory Alert",
    description: "Belgian Prosecutor Investigation for AML/Financial Crime - €500M in suspicious transactions under investigation. Potential significant regulatory fines, reputational damage, and potential license restrictions in EU.",
    aiAction: "Belgian Prosecutor Investigation for AML/Financial Crime - €500M in suspicious transactions under investigation. Potential significant regulatory fines, reputational damage, and potential license restrictions in EU.",
    flag: "🇬🇧",
    logoBg: "bg-lime-500",
    initial: "W"
  },
  {
    id: 4,
    company: "Wise",
    severity: "Critical",
    type: "Operational Alert",
    description: "Stock price falling due to regulatory scrutiny - significant market impact from AML investigation",
    aiAction: "Stock price falling due to regulatory scrutiny - significant market impact from AML investigation",
    flag: "🇬🇧",
    logoBg: "bg-lime-500",
    initial: "W"
  }
];

const mockCountries = [
  { name: "France", count: 312, code: "fr" },
  { name: "Germany", count: 458, code: "de" },
  { name: "Spain", count: 198, code: "es" },
  { name: "Italy", count: 224, code: "it" },
  { name: "Netherlands", count: 167, code: "nl" },
  { name: "Belgium", count: 89, code: "be" },
  { name: "Portugal", count: 76, code: "pt" },
  { name: "Denmark", count: 52, code: "dk" },
  { name: "Ireland", count: 41, code: "ie" }
];

const Dashboard = () => {
  const { data: monitoredEntities = [] } = useQuery({
    queryKey: ["portfolio-sample"],
    queryFn: fetchSamplePreview,
  });

  const formattedEntities = monitoredEntities.map((row: any) => {
    const profile = row.masterEntityProfile || {};
    const name = profile.fullName || row.name || "Unknown";
    const country = profile.jurisdiction || row.country || "Unknown";
    const revenue = Number(profile.financials?.revenue || row.rawIdentifiers?.revenue || 0);
    
    let riskScore = row.riskScore || 25;
    if (!row.riskScore) {
      if (revenue > 10000000000) riskScore = 85;
      else if (revenue > 1000000000) riskScore = 65;
      else if (revenue > 0) riskScore = 45;
    }

    return {
      ...row,
      name,
      country,
      revenue,
      riskScore,
      alert: row.alert || (riskScore >= 80 ? "Critical" : riskScore >= 50 ? "Medium" : "Low")
    };
  });

  const totalMonitored = formattedEntities.length;
  const highRiskCount = formattedEntities.filter((e: any) => e.riskScore >= 60).length;
  
  const totalExposureValue = formattedEntities.reduce((acc: number, e: any) => acc + e.revenue, 0);
  
  const formattedExposure = totalExposureValue > 0 
    ? `$${(totalExposureValue / 1000000).toFixed(1)}M` 
    : "£640455.1M"; // fallback to mock if no real revenue data

  const uniqueCountries = new Set(formattedEntities.map((e: any) => e.country).filter(Boolean));
  const countryCount = uniqueCountries.size || 3;

  const topCriticalEntities = [...formattedEntities]
    .filter((e: any) => e.riskScore >= 80 || e.alert === 'Critical' || e.riskScore > 0)
    .sort((a: any, b: any) => b.riskScore - a.riskScore)
    .slice(0, 5);

  const dynamicCriticalAlerts = topCriticalEntities.length > 0 
    ? topCriticalEntities.map((e: any, idx: number) => ({
        id: e.id || idx,
        company: e.name,
        severity: e.alert,
        type: "Risk Alert",
        description: e.notes || `High risk score of ${e.riskScore} detected for ${e.name}. Requires immediate review.`,
        aiAction: `AI suggests reviewing ${e.name}'s recent activities due to an elevated risk score.`,
        flag: e.country === "United States" || e.country === "US" ? "🇺🇸" : e.country === "United Kingdom" || e.country === "UK" ? "🇬🇧" : e.country === "France" || e.country === "FR" ? "🇫🇷" : "🌍",
        logoBg: "bg-red-500",
        initial: e.name.charAt(0).toUpperCase()
      }))
    : mockCriticalAlerts;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8F9FC] font-sans pb-12 text-slate-800">
        
        {/* Main Content Area */}
        <div className="max-w-screen-2xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-slate-900 mb-2 tracking-tight">Dashboard</h1>
            <p className="text-[14px] text-slate-500 max-w-4xl leading-relaxed">
              An AI-powered risk analyst continuously monitoring every customer on your portfolio — proactively telling you what matters before it becomes a problem.
            </p>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Monitored Companies</p>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{totalMonitored || 36}</h3>
                <p className="text-[11px] text-slate-400">+{totalMonitored || 36} active monitoring</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Alerts</p>
              <div>
                <h3 className="text-2xl font-bold text-red-500 leading-none mb-1">85</h3>
                <p className="text-[11px] text-slate-400">+17 today</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High Risk Companies</p>
              <div>
                <h3 className="text-2xl font-bold text-orange-500 leading-none mb-1">{highRiskCount || 14}</h3>
                <p className="text-[11px] text-slate-400">Trend: stable</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New Alerts Today</p>
              <div>
                <h3 className="text-2xl font-bold text-rose-500 leading-none mb-1">0</h3>
                <p className="text-[11px] text-slate-400">Live feed</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Exposure</p>
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">{formattedExposure}</h3>
                <p className="text-[11px] text-slate-400">Across {countryCount} countries</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Deteriorating</p>
              <div>
                <h3 className="text-2xl font-bold text-red-500 leading-none mb-1">11</h3>
                <p className="text-[11px] text-slate-400">Based on Risk Score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Improving</p>
              <div>
                <h3 className="text-2xl font-bold text-green-500 leading-none mb-1">16</h3>
                <p className="text-[11px] text-slate-400">Based on Risk Score</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm flex flex-col justify-between h-28">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Countries Monitored</p>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{countryCount}</h3>
                <p className="text-[11px] text-slate-400">Active coverage</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Critical Alerts */}
            <div className="xl:col-span-2 flex flex-col h-full border border-red-200 bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-red-100 bg-red-50/30">
                <div className="flex items-center gap-2 text-red-600 font-bold text-[14px]">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Alerts Requiring Action
                </div>
                <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">
                  {dynamicCriticalAlerts.length} OPEN
                </div>
              </div>
              <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                {dynamicCriticalAlerts.map((alert: any) => (
                  <div key={alert.id} className="border border-red-100/80 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />
                    
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-xl leading-none">{alert.flag}</div>
                      <h3 className="font-bold text-blue-700 text-[14px]">{alert.company}</h3>
                      <span className="bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                        {alert.severity}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-slate-700 leading-relaxed">
                      <span className="font-semibold">{alert.type}</span> — {alert.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - AI Daily Briefing */}
            <div className="flex flex-col h-full border border-indigo-200 bg-white rounded-xl overflow-hidden shadow-sm relative">
              <div className="absolute inset-0 z-10 backdrop-blur-[3px] bg-white/40 flex items-center justify-center rounded-xl">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100 font-bold text-indigo-600 text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Coming Soon
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 border-b border-indigo-100 bg-indigo-50/30">
                <div className="bg-white p-1.5 rounded-lg border border-indigo-100 shadow-sm text-indigo-600">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-[14px] leading-tight">AI Daily Briefing</h2>
                  <p className="text-[11px] text-slate-500">Updated 2 min ago</p>
                </div>
              </div>
              
              <div className="p-5 flex-1">
                <p className="text-[13.5px] text-slate-700 leading-relaxed mb-6">
                  Portfolio risk has <span className="font-bold text-red-600">elevated overnight</span>. <span className="font-bold">Atos SE</span> triggered a multi-signal event combining credit downgrade, CFO exit, and digital outage — historically a 73% precursor to default within 90 days.
                  <br/><br/>
                  <span className="font-bold">Volkswagen AG</span> sanctions exposure should be reviewed by compliance today. Top deteriorating sector: <span className="font-bold text-slate-900">French retail</span> (3 of top 10).
                </p>
                
                <Button variant="outline" className="w-full justify-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl h-11">
                  <Sparkles className="h-4 w-4" /> Ask the AI Agent
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Risk by Country */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-slate-900 mb-5 flex items-center gap-2">
              <span className="text-xl leading-none">🌐</span> Risk by Country
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3">
              {mockCountries.map(country => (
                <div key={country.name} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors cursor-pointer group">
                  <div className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden rounded-sm shadow-sm">
                    <img src={`https://flagcdn.com/w40/${country.code}.png`} alt={country.name} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-800 text-center">{country.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-400">{country.count} co.</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
