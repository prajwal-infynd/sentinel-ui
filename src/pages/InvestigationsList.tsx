import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, Filter, Plus, ArrowUpRight, Clock, ShieldAlert,
  Building, User, AlertTriangle, CheckCircle2, ChevronRight, UploadCloud
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useInvestigations } from "@/context/InvestigationsContext";
import { toast } from "@/components/ui/use-toast";

const InvestigationsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cases, addCase } = useInvestigations();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Assigned to Me" | "Critical">("All");
  const [isManualCaseOpen, setIsManualCaseOpen] = useState(false);
  const [showNoCaseWarning, setShowNoCaseWarning] = useState(false);
  
  // Form state
  const [newCaseName, setNewCaseName] = useState("");
  const [newCaseScore, setNewCaseScore] = useState("50");
  const [newCaseSignal, setNewCaseSignal] = useState("");

  // Handle incoming investigation requests from Dashboard/Portfolio
  useEffect(() => {
    if (location.state?.entity) {
      const entity = location.state.entity;
      const entityName = (entity.company || entity.name || "").toLowerCase();
      
      if (!entityName) return;

      const existingCase = cases.find(c => c.entity.name.toLowerCase() === entityName);

      if (existingCase) {
        navigate(`/investigations/${existingCase.id}`, { replace: true, state: { entity } });
      } else {
        // Instead of auto-creating, we pre-fill the form and open the dialog
        setShowNoCaseWarning(true);
        setNewCaseName(entity.company || entity.name || "Unknown Entity");
        setNewCaseScore(entity.riskScore?.toString() || "50");
        setIsManualCaseOpen(true);
        
        // Clear state so we don't infinitely re-trigger
        navigate(location.pathname, { replace: true });
      }
    }
  }, [location.state, cases, navigate, location.pathname]);

  const handleRowClick = (caseItem: any) => {
    navigate(`/investigations/${caseItem.id}`, { state: { entity: caseItem.entity } });
  };

  const handleAddCase = () => {
    if (!newCaseName || !newCaseSignal) {
      toast({ title: "Error", description: "Name and Signal are required", variant: "destructive" });
      return;
    }
    
    addCase({
      entity: {
        name: newCaseName,
        entity_type: "individual", // Default for manual
        jurisdiction: "Global",
        latest_signal: newCaseSignal,
        risk_score: parseInt(newCaseScore) || 50
      }
    });
    
    
    setShowNoCaseWarning(false);
    setIsManualCaseOpen(false);
    setNewCaseName("");
    setNewCaseSignal("");
    toast({ title: "Case Created", description: `New investigation for ${newCaseName} added to the queue.` });
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Search filter
      const matchesSearch = 
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.assignee.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Badge filters
      if (activeFilter === "Assigned to Me" && c.assignee !== "Admin") return false;
      if (activeFilter === "Critical" && c.entity.risk_score < 80) return false;

      return true;
    });
  }, [cases, searchQuery, activeFilter]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Investigations Inbox</h1>
            <p className="text-sm text-slate-500">Manage and resolve active compliance alerts and agent escalations.</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold"
                >
                  <UploadCloud className="h-4 w-4" /> Bulk Import
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-indigo-600" />
                    Bulk Import Investigations
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Upload your list of investigations to import them in bulk. Supported formats include CSV, XLSX, and JSON.</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => {
                    toast({ title: "Uploading...", description: "File is being uploaded and processed." });
                    setTimeout(() => {
                      toast({ title: "Import Successful", description: "Successfully imported 14 investigations." });
                    }, 1500);
                  }}>
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Click to select a file</p>
                    <p className="text-xs text-slate-500 mt-1">or drag and drop it here</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" className="mr-2">Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Import File</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2 bg-white text-slate-700">
              <Filter className="h-4 w-4" /> Filters
            </Button>
            
            <Dialog open={isManualCaseOpen} onOpenChange={(open) => {
              setIsManualCaseOpen(open);
              if (!open) {
                if (showNoCaseWarning) {
                  navigate(-1);
                }
                setShowNoCaseWarning(false);
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Plus className="h-4 w-4" /> Manual Case
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white p-6 rounded-2xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-xl font-bold">Create Manual Case</DialogTitle>
                </DialogHeader>
                {showNoCaseWarning && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-4 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p><strong>No Active Case Found.</strong> There is no existing investigation for this entity. You can start a manual one below.</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Entity Name</label>
                    <Input value={newCaseName} onChange={e => setNewCaseName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Latest Signal / Reason</label>
                    <Input value={newCaseSignal} onChange={e => setNewCaseSignal(e.target.value)} placeholder="e.g. Unusual Wire Transfer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Initial Risk Score (0-100)</label>
                    <Input type="number" value={newCaseScore} onChange={e => setNewCaseScore(e.target.value)} min="0" max="100" />
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={handleAddCase}>
                    Create Case
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search by ID, Entity, or Assignee..." 
                    className="pl-9 bg-white border-slate-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Badge 
                    variant={activeFilter === "All" ? "default" : "outline"} 
                    className={`cursor-pointer ${activeFilter === "All" ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setActiveFilter("All")}
                  >
                    All ({cases.length})
                  </Badge>
                  <Badge 
                    variant={activeFilter === "Assigned to Me" ? "default" : "outline"} 
                    className={`cursor-pointer ${activeFilter === "Assigned to Me" ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setActiveFilter("Assigned to Me")}
                  >
                    Assigned to Me ({cases.filter(c => c.assignee === "Admin").length})
                  </Badge>
                  <Badge 
                    variant={activeFilter === "Critical" ? "default" : "outline"} 
                    className={`cursor-pointer ${activeFilter === "Critical" ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'bg-white text-destructive border-destructive/20 hover:bg-destructive/5'}`}
                    onClick={() => setActiveFilter("Critical")}
                  >
                    Critical ({cases.filter(c => c.entity.risk_score >= 80).length})
                  </Badge>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Priority</th>
                    <th className="px-6 py-4 font-semibold">Case ID</th>
                    <th className="px-6 py-4 font-semibold">Entity</th>
                    <th className="px-6 py-4 font-semibold">Latest Signal</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Assignee</th>
                    <th className="px-6 py-4 font-semibold text-right">Age</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredCases.map((caseItem) => (
                    <tr 
                      key={caseItem.id} 
                      onClick={() => handleRowClick(caseItem)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Badge className={`${Number(caseItem.entity.risk_score) >= 80 ? 'bg-destructive/10 text-destructive border-destructive/20' : Number(caseItem.entity.risk_score) >= 60 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-primary/10 text-primary border-primary/20'} border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm`}>
                          {Number(caseItem.entity.risk_score) >= 80 ? 'CRITICAL' : Number(caseItem.entity.risk_score) >= 60 ? 'HIGH RISK' : 'ELEVATED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-600">{caseItem.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {caseItem.entity.entity_type === 'company' ? (
                            <Building className="h-4 w-4 text-slate-400" />
                          ) : (
                            <User className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="font-semibold text-slate-900">{caseItem.entity.name}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded ml-1">{caseItem.entity.jurisdiction}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{caseItem.entity.latest_signal}</td>
                      <td className="px-6 py-4">
                        {caseItem.status === "Pending Review" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>}
                        {caseItem.status === "In Progress" && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>}
                        {caseItem.status === "Resolved" || caseItem.status === "Approved" ? <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{caseItem.status}</Badge> : null}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{caseItem.assignee}</td>
                      <td className="px-6 py-4 text-right text-slate-500 flex items-center justify-end gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {caseItem.timestamp}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-indigo-600 h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        No cases found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default InvestigationsList;
