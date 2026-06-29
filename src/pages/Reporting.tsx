import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Settings, ShieldAlert, CreditCard, Scale, Sparkles, Bookmark, Globe } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const REPORT_CARDS = [
  {
    title: "Portfolio Risk Report",
    description: "Aggregated risk across your monitored portfolio",
    icon: ShieldAlert,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100"
  },
  {
    title: "Credit Exposure Report",
    description: "Exposure by counterparty, country, and industry",
    icon: CreditCard,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100"
  },
  {
    title: "Compliance Report",
    description: "Sanctions, PEP, and adverse media findings",
    icon: Scale,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100",
    isHighlighted: true
  },
  {
    title: "Executive Summary",
    description: "C-suite ready monthly briefing with AI insights",
    icon: Sparkles,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100"
  },
  {
    title: "Watchlist Activity",
    description: "All events across your custom watchlists",
    icon: Bookmark,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100"
  },
  {
    title: "Country Heatmap",
    description: "Risk concentration by geography",
    icon: Globe,
    iconColor: "text-rose-500",
    bgClass: "bg-rose-50 border-rose-100"
  }
];

const SCHEDULED_REPORTS = [
  {
    name: "Weekly Executive Summary",
    details: "Mondays 08:00 · PDF · 14 recipients"
  },
  {
    name: "Daily Critical Alerts Digest",
    details: "Daily 07:00 · Email · 6 recipients"
  },
  {
    name: "Monthly Portfolio Risk Report",
    details: "1st of month · PDF + Excel · Board"
  }
];

const Reporting = () => {
  const handleDownload = (type: string, title: string) => {
    toast({ 
      title: `Generating ${type}`, 
      description: `Your ${title} is being prepared and will download shortly.` 
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pb-4 border-b border-slate-100 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reporting</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              An AI-powered risk analyst continuously monitoring every customer on your portfolio — proactively telling you what matters before it becomes a problem.
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation (Visual only based on screenshot) */}
        <div className="flex gap-8 border-b border-slate-100 pb-px text-sm font-medium text-slate-500 overflow-x-auto">
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">Dashboard</div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">News Feed</div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors flex items-center gap-2">
            Alerts Centre <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">263</span>
          </div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">Monitored Companies</div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">Watchlists</div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">Risk Analytics</div>
          <div className="px-1 py-3 cursor-pointer hover:text-slate-900 transition-colors">AI Agent</div>
          <div className="px-1 py-3 border-b-2 border-rose-500 text-rose-600 flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Reports
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {REPORT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-xl p-6 border ${card.isHighlighted ? 'border-rose-200 shadow-sm ring-1 ring-rose-50' : 'border-slate-200 shadow-sm'} flex flex-col justify-between group hover:border-rose-300 transition-all`}
              >
                <div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center mb-5 border ${card.bgClass}`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-500 h-10">{card.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center gap-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleDownload("PDF", card.title)}
                  >
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center gap-2 text-slate-600 hover:text-slate-900"
                    onClick={() => handleDownload("Excel", card.title)}
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </Button>
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-slate-50/50 rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Scheduled reports</h3>
            <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 h-8 text-xs font-semibold">
              <Settings className="h-3.5 w-3.5" /> Manage
            </Button>
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            {SCHEDULED_REPORTS.map((report, idx) => (
              <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-0.5">{report.name}</h4>
                  <p className="text-xs text-slate-500">{report.details}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                  <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Reporting;
