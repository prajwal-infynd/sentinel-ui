import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, ShieldAlert, Plus, Search, FileUp, ListPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

type Watchlist = {
  id: string;
  name: string;
  description: string;
  entries: number;
  type: "SYSTEM" | "CUSTOM";
};

const INITIAL_WATCHLISTS: Watchlist[] = [
  {
    id: "global-sanctions",
    name: "Global Sanctions",
    description: "OFAC, UN Security Council, and EU Consolidated List of sanctioned entities.",
    entries: 84201,
    type: "SYSTEM"
  }
];

export default function MonitorWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>(INITIAL_WATCHLISTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [manualEntities, setManualEntities] = useState("");

  const handleCreateWatchlist = () => {
    if (!newListName.trim()) {
      toast({ title: "Name Required", description: "Please enter a name for the watchlist.", variant: "destructive" });
      return;
    }

    const entriesCount = manualEntities.split('\n').filter(e => e.trim().length > 0).length;

    const newList: Watchlist = {
      id: `custom-${Date.now()}`,
      name: newListName,
      description: newListDesc || "Custom user-defined watchlist.",
      entries: entriesCount,
      type: "CUSTOM"
    };

    setWatchlists(prev => [...prev, newList]);
    setIsModalOpen(false);
    setNewListName("");
    setNewListDesc("");
    setManualEntities("");

    toast({
      title: "Watchlist Created",
      description: `${newListName} has been added to your watchlists.`,
    });
  };

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
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
            <Plus className="h-4 w-4" /> Create Watchlist
          </Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlists.map(list => (
            <div key={list.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${list.type === 'SYSTEM' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {list.type === 'SYSTEM' ? <ShieldAlert className="h-6 w-6" /> : <Bookmark className="h-6 w-6" />}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${list.type === 'SYSTEM' ? 'text-slate-500 bg-slate-100' : 'text-indigo-600 bg-indigo-50 border border-indigo-100'}`}>
                  {list.type}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{list.name}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">{list.description}</p>
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-600">{list.entries.toLocaleString()} Entries</span>
                <span className="text-emerald-600">Active</span>
              </div>
            </div>
          ))}

          {/* New Custom Watchlist Card */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 min-h-[220px]"
          >
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">New Custom Watchlist</h3>
            <p className="text-sm text-slate-500 max-w-[200px]">Upload a CSV or manually add entities to track.</p>
          </div>
        </div>
      </motion.div>

      {/* Create Watchlist Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-2xl" aria-describedby={undefined}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Create New Watchlist</h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-200" onClick={() => setIsModalOpen(false)}>
              <X className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Watchlist Name</label>
                <Input 
                  placeholder="e.g., High-Risk Vendors" 
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 shadow-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Description <span className="normal-case font-normal text-slate-400">(Optional)</span></label>
                <Input 
                  placeholder="Briefly describe the purpose of this list..." 
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <Tabs defaultValue="manual" className="w-full pt-2">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100/80 p-1 rounded-lg">
                <TabsTrigger value="manual" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md py-1.5">
                  <ListPlus className="w-3.5 h-3.5 mr-1.5" /> Manual Entry
                </TabsTrigger>
                <TabsTrigger value="csv" className="text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm rounded-md py-1.5">
                  <FileUp className="w-3.5 h-3.5 mr-1.5" /> Upload CSV
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual" className="mt-0">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-inner">
                  <label className="text-[11px] font-semibold text-slate-500 mb-2 block">Enter entity names (one per line)</label>
                  <textarea 
                    value={manualEntities}
                    onChange={(e) => setManualEntities(e.target.value)}
                    className="w-full h-32 bg-white border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder:text-slate-300 shadow-sm"
                    placeholder="Acme Corp&#10;Global Tech Ltd&#10;John Doe"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="csv" className="mt-0">
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-colors cursor-pointer text-center">
                  <div className="h-10 w-10 bg-white shadow-sm rounded-full flex items-center justify-center mb-3">
                    <FileUp className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">Click or drag CSV to upload</p>
                  <p className="text-xs text-slate-500 max-w-[200px]">Maximum file size 10MB. Must contain a 'Name' column.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-white font-semibold text-slate-700 border-slate-200 hover:bg-slate-50">
              Cancel
            </Button>
            <Button onClick={handleCreateWatchlist} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-6">
              Create Watchlist
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
