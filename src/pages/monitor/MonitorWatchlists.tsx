import { motion } from "framer-motion";
import { Bookmark, ShieldAlert, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MonitorWatchlists() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
            <Bookmark className="h-7 w-7 text-indigo-600" />
            Watchlists
          </h1>
          <p className="text-sm text-slate-500">Manage internal blocklists, VIP watchlists, and sanctions lists.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search watchlists..." className="pl-9 w-64 bg-white border-slate-200" />
          </div>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="h-4 w-4" /> Create Watchlist
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">SYSTEM</span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Global Sanctions</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">OFAC, UN Security Council, and EU Consolidated List of sanctioned entities.</p>
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-600">84,201 Entries</span>
              <span className="text-emerald-600">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 min-h-[220px]">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">New Custom Watchlist</h3>
            <p className="text-sm text-slate-500 max-w-[200px]">Upload a CSV or manually add entities to track.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
