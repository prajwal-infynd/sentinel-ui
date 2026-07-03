import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { title: "Q2 Compliance Audit Report", date: "Jul 01, 2026", type: "Quarterly Audit", size: "2.4 MB" },
  { title: "Monthly Risk Exposure Summary", date: "Jun 01, 2026", type: "Risk Summary", size: "1.1 MB" },
  { title: "High Risk Entity Deep Dive", date: "May 15, 2026", type: "Targeted Analysis", size: "4.8 MB" },
];

export default function MonitorReports() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
            <FileText className="h-7 w-7 text-emerald-600" />
            Generated Reports
          </h1>
          <p className="text-sm text-slate-500">Download and manage compliance, risk, and audit reports.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
            <Calendar className="h-4 w-4" /> Date Range
          </Button>
          <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <FileText className="h-4 w-4" /> Generate New Report
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Report Name</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Generated Date</th>
                <th className="px-6 py-4 font-semibold">Size</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((report, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-slate-900">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{report.type}</td>
                  <td className="px-6 py-4 text-slate-500">{report.date}</td>
                  <td className="px-6 py-4 text-slate-500 font-mono">{report.size}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2 font-semibold">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
