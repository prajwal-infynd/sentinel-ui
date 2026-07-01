import { motion } from "framer-motion";
import { BarChart3, Activity, PieChart, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorRiskAnalytics() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-rose-600" />
            Risk Analytics
          </h1>
          <p className="text-sm text-slate-500">Portfolio-wide risk exposure, trends, and vulnerability metrics.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Average Risk Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">42<span className="text-sm text-slate-400 font-normal ml-1">/ 100</span></div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" /> -2.4 from last month
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">High Risk Entities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">14</div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                Requires immediate review
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">328</div>
              <p className="text-xs text-rose-600 mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" /> +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">1.2<span className="text-sm text-slate-400 font-normal ml-1">days</span></div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" /> 18% faster
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-indigo-500" />
                Risk Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-slate-50/50 rounded-b-xl border-t border-slate-100">
              <span className="text-sm text-slate-400 font-medium">Chart Visualization Coming Soon</span>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-500" />
                Risk Distribution by Sector
              </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center bg-slate-50/50 rounded-b-xl border-t border-slate-100">
              <span className="text-sm text-slate-400 font-medium">Chart Visualization Coming Soon</span>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
