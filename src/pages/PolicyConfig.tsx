import { motion } from "framer-motion";
import { Shield, Globe, AlertTriangle, Newspaper, Loader2, CheckCircle2, Trash2, GitMerge, MousePointerSquareDashed, Plus, Settings, Workflow, MoreHorizontal, Database, Filter } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPolicyConfig, savePolicyConfig, type Watchlist, type PolicyConfigData } from "@/lib/policy-data";
import { toast } from "@/components/ui/use-toast";

const PolicyConfig = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["policy-config"], queryFn: fetchPolicyConfig });

  const [lists, setLists] = useState<Watchlist[]>([]);
  const [confidence, setConfidence] = useState([75]);
  const [severity, setSeverity] = useState([60]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  // Add Policy State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyRegion, setNewPolicyRegion] = useState("");

  useEffect(() => {
    if (data) {
      setLists(data.watchlists);
      setConfidence(data.confidence);
      setSeverity(data.severity);
      setSelectedMedia(data.selectedMedia);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (config: PolicyConfigData) => savePolicyConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-config"] });
      toast({ title: "Policy Saved", description: "Your policy configuration has been updated.", variant: "default" });
    },
  });

  const toggle = (i: number) => {
    const updated = [...lists];
    updated[i] = { ...updated[i], enabled: !updated[i].enabled };
    setLists(updated);
  };

  const toggleMedia = (cat: string) => {
    setSelectedMedia(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleSave = () => {
    if (!data) return;
    saveMutation.mutate({
      watchlists: lists,
      mediaCategories: data.mediaCategories,
      selectedMedia,
      confidence,
      severity,
    });
  };

  const handleAddPolicy = () => {
    if (!newPolicyName.trim() || !newPolicyRegion.trim()) {
      toast({ title: "Validation Error", description: "Name and Region are required.", variant: "destructive" });
      return;
    }
    const newPolicy = { name: newPolicyName, region: newPolicyRegion, enabled: true };
    const updatedLists = [newPolicy, ...lists];
    setLists(updatedLists);
    
    saveMutation.mutate({
      watchlists: updatedLists,
      mediaCategories: data!.mediaCategories,
      selectedMedia,
      confidence,
      severity,
    });
    
    setIsAddOpen(false);
    setNewPolicyName("");
    setNewPolicyRegion("");
  };

  const handleDeletePolicy = (indexToRemove: number) => {
    const updatedLists = lists.filter((_, i) => i !== indexToRemove);
    setLists(updatedLists);
    
    saveMutation.mutate({
      watchlists: updatedLists,
      mediaCategories: data!.mediaCategories,
      selectedMedia,
      confidence,
      severity,
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Policy Configuration</h1>
            <p className="text-sm text-muted-foreground">Configure screening rules, watchlists, and alert thresholds</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ Add Policy</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Custom Policy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Policy Name</label>
                  <Input value={newPolicyName} onChange={e => setNewPolicyName(e.target.value)} placeholder="e.g. Internal Do-Not-Do-Business List" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region/Jurisdiction</label>
                  <Input value={newPolicyRegion} onChange={e => setNewPolicyRegion(e.target.value)} placeholder="e.g. Global" />
                </div>
              </div>
              <Button onClick={handleAddPolicy} className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Policy
              </Button>
            </DialogContent>
          </Dialog>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
        ) : !data ? null : (
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="bg-card border border-border/50 rounded-xl p-1 shadow-sm mb-6 inline-flex">
              <TabsTrigger value="global" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4">Global Thresholds</TabsTrigger>
              <TabsTrigger value="builder" className="text-xs font-bold uppercase tracking-wider rounded-lg data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-2 px-4 gap-2">
                <Workflow className="h-3 w-3" /> Visual Rule Builder
              </TabsTrigger>
            </TabsList>

            <TabsContent value="global" className="space-y-6">
            {/* Watchlists */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl bg-card shadow-sm p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Watchlist Sources</h3>
              <div className="space-y-3">
                {lists.map((list, i) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={list.name} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors group">
                    <div>
                      <div className="text-sm font-semibold">{list.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground/70" />{list.region}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={list.enabled} onCheckedChange={() => toggle(i)} className="data-[state=checked]:bg-primary" />
                      <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeletePolicy(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Thresholds */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl bg-card shadow-sm p-6 space-y-6"
            >
              <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Alert Thresholds</h3>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Matching Confidence Threshold</span>
                  <span className="text-sm font-mono font-bold">{confidence[0]}%</span>
                </div>
                <Slider value={confidence} onValueChange={setConfidence} max={100} min={30} step={5} />
                <p className="text-xs text-muted-foreground mt-1">Matches below this threshold will not generate alerts</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Alert Severity Escalation</span>
                  <span className="text-sm font-mono font-bold">{severity[0]}%</span>
                </div>
                <Slider value={severity} onValueChange={setSeverity} max={100} min={20} step={5} />
                <p className="text-xs text-muted-foreground mt-1">Scores above this threshold trigger high-severity alerts</p>
              </div>
            </motion.div>

            {/* Media Categories */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="rounded-xl bg-card shadow-sm p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Newspaper className="h-4 w-4 text-accent" /> Adverse Media Categories</h3>
              <div className="flex flex-wrap gap-2">
                {data.mediaCategories.map(cat => (
                  <Badge key={cat}
                    variant={selectedMedia.includes(cat) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMedia(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </motion.div>

            <Button size="lg" className="w-full" onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saveMutation.isPending ? "Saving..." : "Save Policy Configuration"}
            </Button>
            </TabsContent>

            <TabsContent value="builder">
              <div className="rounded-2xl border border-border/50 bg-[#F8FAFC] shadow-sm overflow-hidden h-[600px] flex flex-col relative">
                
                {/* Header / Toolbar */}
                <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold shadow-sm">
                      <MousePointerSquareDashed className="h-3.5 w-3.5" /> Select
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold shadow-sm">
                      <Plus className="h-3.5 w-3.5" /> Add Node
                    </Button>
                    <div className="h-4 w-px bg-border/50 mx-1" />
                    <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs font-bold text-muted-foreground">
                      <Settings className="h-3.5 w-3.5" /> Rule Settings
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold">Discard Draft</Button>
                    <Button size="sm" className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md">Deploy Rule</Button>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px]">
                  
                  {/* Start Node */}
                  <div className="absolute top-10 left-[40%] w-[280px] bg-white rounded-xl shadow-md border-2 border-primary/20 p-4">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Database className="h-4 w-4 text-primary" /> Incoming Transaction
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mb-2">Trigger Event</div>
                    <div className="text-xs bg-slate-100 p-2 rounded border font-mono">Any Swift/SEPA Transfer</div>
                  </div>

                  {/* SVG Connector 1 */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path d="M 400 150 L 400 200" stroke="#94A3B8" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                      </marker>
                    </defs>
                  </svg>

                  {/* Condition Node */}
                  <div className="absolute top-[200px] left-[40%] w-[280px] bg-white rounded-xl shadow-md border-2 border-warning/40 p-4">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <Filter className="h-4 w-4 text-warning" /> Amount Condition
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">IF</span>
                      <Badge variant="outline" className="text-xs font-mono bg-warning/10 text-warning-foreground border-warning/30">Amount {'>'} $10,000</Badge>
                    </div>
                  </div>

                  {/* SVG Connector 2 */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path d="M 400 300 L 400 350" stroke="#94A3B8" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  </svg>

                  {/* Logic Split Node */}
                  <div className="absolute top-[350px] left-[31%] w-[420px] bg-white rounded-xl shadow-md border-2 border-indigo-500/40 p-4">
                    <div className="flex items-center justify-between mb-3 border-b pb-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <GitMerge className="h-4 w-4 text-indigo-500" /> And Risk Assessment
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Check 1</span>
                        <Badge variant="outline" className="text-xs bg-white text-indigo-700">Entity is PEP</Badge>
                      </div>
                      <div className="bg-indigo-50/50 p-2 rounded border border-indigo-100 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Check 2</span>
                        <Badge variant="outline" className="text-xs bg-white text-indigo-700">High-Risk Juris.</Badge>
                      </div>
                    </div>
                  </div>

                  {/* SVG Connector 3 */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <path d="M 400 480 L 400 520" stroke="#94A3B8" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
                  </svg>
                  
                  {/* Action Node */}
                  <div className="absolute top-[520px] left-[40%] w-[280px] bg-destructive/5 rounded-xl shadow-md border-2 border-destructive/40 p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-destructive/20 pb-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-destructive">
                        <AlertTriangle className="h-4 w-4" /> Trigger Action
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-destructive/70" />
                    </div>
                    <div className="text-sm font-bold text-slate-800 flex items-center justify-center py-2 bg-white rounded shadow-sm">
                      BLOCK PAYMENT & ALERT
                    </div>
                  </div>

                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PolicyConfig;
