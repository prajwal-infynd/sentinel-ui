import { motion } from "framer-motion";
import { Rss, Filter, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MonitorNewsFeed() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-2">
            <Rss className="h-7 w-7 text-blue-600" />
            Global News Feed
          </h1>
          <p className="text-sm text-slate-500">Live aggregated news mentions relevant to your monitored companies.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search news topics..." className="pl-9 w-64 bg-white border-slate-200" />
          </div>
          <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-50">
            <Settings className="h-4 w-4" /> Config
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
          <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Rss className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No News Found</h3>
          <p className="text-slate-500 max-w-sm mb-6">
            There are currently no relevant news articles detected for your monitored entities. Adjust your filters or add more companies to your portfolio.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Manage Monitored Companies
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
