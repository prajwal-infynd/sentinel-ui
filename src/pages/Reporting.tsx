import { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const ALERTS_OVER_TIME = [
  { name: 'Jan', critical: 12, medium: 45, low: 80 },
  { name: 'Feb', critical: 15, medium: 52, low: 95 },
  { name: 'Mar', critical: 8, medium: 38, low: 110 },
  { name: 'Apr', critical: 22, medium: 60, low: 85 },
  { name: 'May', critical: 14, medium: 48, low: 105 },
  { name: 'Jun', critical: 9, medium: 35, low: 120 },
];

const RISK_BY_COUNTRY = [
  { name: 'US', value: 45, color: '#f43f5e' },
  { name: 'UK', value: 25, color: '#f97316' },
  { name: 'EU', value: 20, color: '#eab308' },
  { name: 'Other', value: 10, color: '#22c55e' },
];

const RISK_TYPOLOGIES = [
  { name: 'Sanctions', count: 85 },
  { name: 'Adverse Media', count: 62 },
  { name: 'PEP Match', count: 45 },
  { name: 'FinCrime', count: 30 },
  { name: 'Cyber Risk', count: 18 },
];

const Reporting = () => {
  const handleDownload = (type: string) => {
    toast({ 
      title: `Generating ${type}`, 
      description: `Your Portfolio Risk Report is being prepared for download.` 
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pb-4 border-b border-slate-100 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reporting Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              AI-generated analytical breakdown of portfolio exposure, alert volume, and compliance metrics over time.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 text-slate-600 hover:text-slate-900" onClick={() => handleDownload("Excel")}>
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Data
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleDownload("PDF")}>
              <Download className="h-4 w-4" /> Download Report
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts Over Time */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">Alert Volume Trends</h3>
              <p className="text-xs text-slate-500">6-month rolling window of generated alerts by severity</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ALERTS_OVER_TIME} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="critical" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorCritical)" name="Critical" />
                  <Area type="monotone" dataKey="medium" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorMedium)" name="Medium" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk by Country */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">Exposure by Geography</h3>
              <p className="text-xs text-slate-500">Distribution of high-risk entities across monitored jurisdictions</p>
            </div>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RISK_BY_COUNTRY}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {RISK_BY_COUNTRY.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Risk Typologies */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900">Top Risk Typologies</h3>
              <p className="text-xs text-slate-500">Breakdown of underlying reasons for critical portfolio alerts</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={RISK_TYPOLOGIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 500 }} width={120} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reporting;
