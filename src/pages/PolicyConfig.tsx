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
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchPolicyConfig, savePolicyConfig, fetchAuditLogs, rollbackPolicy, type Watchlist, type PolicyConfigData } from "@/lib/policy-data";
import { toast } from "@/components/ui/use-toast";
import Xarrow, { Xwrapper, useXarrow } from "react-xarrows";

const DraggableNode = ({ node, bringToFront }: any) => {
  const updateXarrow = useXarrow();
  return (
    <motion.div
      id={`node-${node.id}`}
      drag
      dragMomentum={false}
      onDrag={updateXarrow}
      onDragEnd={updateXarrow}
      onDragStart={() => bringToFront(node.id)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute w-[280px] bg-white rounded-xl shadow-xl border-2 cursor-grab active:cursor-grabbing p-4 ${
        node.type === 'trigger' ? 'border-primary/40 shadow-primary/10' :
        node.type === 'condition' ? 'border-warning/40 shadow-warning/10' :
        node.type === 'logic' ? 'border-indigo-500/40 w-[420px] shadow-indigo-500/10' :
        'border-destructive/40 shadow-destructive/10'
      }`}
      style={{ top: node.y, left: node.x }}
    >
      {node.type !== 'trigger' && <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-slate-300 border-2 border-white shadow-sm" />}
      {node.type !== 'action' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-slate-300 border-2 border-white shadow-sm" />}

      <div className="flex items-center justify-between mb-3 border-b border-border/50 pb-2">
        <div className={`flex items-center gap-2 text-sm font-bold ${
          node.type === 'trigger' ? 'text-primary' :
          node.type === 'condition' ? 'text-warning-foreground' :
          node.type === 'logic' ? 'text-indigo-600' :
          'text-destructive'
        }`}>
          {node.type === 'trigger' && <Database className="h-4 w-4" />}
          {node.type === 'condition' && <Filter className="h-4 w-4" />}
          {node.type === 'logic' && <GitMerge className="h-4 w-4" />}
          {node.type === 'action' && <AlertTriangle className="h-4 w-4" />}
          {node.title}
        </div>
        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
      </div>
      
      {node.type === 'trigger' && (
        <>
          <div className="text-xs text-muted-foreground font-medium mb-2">Trigger Event</div>
          <div className="text-xs bg-slate-100 p-2 rounded border font-mono text-slate-700">{node.detail}</div>
        </>
      )}
      {node.type === 'condition' && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-bold text-slate-600 uppercase">IF</span>
          <Badge variant="outline" className="text-xs font-mono bg-warning/20 text-yellow-800 border-warning/40 font-bold">{node.detail}</Badge>
        </div>
      )}
      {node.type === 'logic' && (
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
      )}
      {node.type === 'action' && (
        <div className="text-sm font-bold text-slate-800 flex items-center justify-center py-2 bg-white rounded shadow-sm border border-destructive/20">
          {node.detail}
        </div>
      )}
    </motion.div>
  );
};

const PolicyConfig = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entityName = searchParams.get('entity');

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["policy-config"], queryFn: fetchPolicyConfig });

  const [lists, setLists] = useState<Watchlist[]>([]);
  const [confidence, setConfidence] = useState([75]);
  const [severity, setSeverity] = useState([60]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);

  const { data: auditLogs, isLoading: isLogsLoading } = useQuery({ 
    queryKey: ["policy-audit-logs", entityName], 
    queryFn: () => fetchAuditLogs(entityName!),
    enabled: !!entityName
  });

  // Add Policy State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPolicyName, setNewPolicyName] = useState("");
  const [newPolicyRegion, setNewPolicyRegion] = useState("");

  // Visual Rule Builder State
  const [nodes, setNodes] = useState([
    { id: "1", type: "trigger", title: "Data Sources", x: 150, y: 40, detail: "Ingest CSV/PDF/API" },
    { id: "2", type: "condition", title: "Policy Routing", x: 150, y: 180, detail: "Apply KYB Rules & Thresholds" },
    { id: "3", type: "logic", title: "Output Stage", x: 80, y: 320, detail: "Standardize Data Schema" },
    { id: "4", type: "action", title: "Agents Pipeline", x: 150, y: 480, detail: "DISPATCH TO SWARM" }
  ]);

  const bringToFront = (id: string) => {
    setNodes(prev => {
      const node = prev.find(n => n.id === id);
      if (!node) return prev;
      return [...prev.filter(n => n.id !== id), node];
    });
  };

  const handleAddNode = () => {
    const newNode = {
      id: Date.now().toString(),
      type: "condition",
      title: "New Condition",
      x: 350 + Math.random() * 40,
      y: 250 + Math.random() * 40,
      detail: "Unconfigured"
    };
    setNodes([...nodes, newNode]);
  };

  useEffect(() => {
    if (data) {
      setLists(data.watchlists);
      setConfidence(data.confidence);
      setSeverity(data.severity);
      setSelectedMedia(data.selectedMedia);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (config: PolicyConfigData) => savePolicyConfig(entityName!, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-config"] });
      queryClient.invalidateQueries({ queryKey: ["policy-audit-logs"] });
      toast({ title: "Policy Saved", description: "Your policy configuration has been updated.", variant: "default" });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: (logId: string) => rollbackPolicy(entityName!, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy-config"] });
      queryClient.invalidateQueries({ queryKey: ["policy-audit-logs"] });
      toast({ title: "Policy Rolled Back", description: "Successfully reverted to the selected historical version.", variant: "default" });
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

  if (!entityName) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center mt-32">
          <Shield className="h-16 w-16 text-indigo-300 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight mb-3">No Data Source Selected</h1>
          <p className="text-muted-foreground mb-8 max-w-md">The policy layer is dynamically configured per data source. Please select an uploaded data source or API from the Data Sources page to configure its specific rules and thresholds.</p>
          <Button onClick={() => navigate('/architecture')} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">Go to Data Sources</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-indigo-950 flex items-center gap-2">
              <span className="text-muted-foreground font-normal text-lg">Policy Layer /</span> {entityName}
            </h1>
            <p className="text-sm text-muted-foreground">Configure entity-specific screening rules, watchlists, and alert thresholds.</p>
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
              <TabsList className="bg-transparent border-b border-border/50 rounded-none p-0 w-full justify-start overflow-x-auto h-auto gap-4 mb-6">
                <TabsTrigger value="global" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1">Global Thresholds</TabsTrigger>
                <TabsTrigger value="builder" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1 gap-2">
                  <Workflow className="h-4 w-4" /> Visual Rule Builder
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:text-indigo-600 data-[state=active]:shadow-none py-3 px-1 gap-2">
                  Audit Logs
                </TabsTrigger>
              </TabsList>

            <TabsContent value="audit" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-6">
                <h3 className="text-base font-bold tracking-tight mb-5">Policy Change History</h3>
                <div className="space-y-4">
                  {isLogsLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-muted-foreground h-6 w-6" /></div>
                  ) : !auditLogs || auditLogs.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">No historical changes found for this entity.</div>
                  ) : (
                    auditLogs.map((log, i) => (
                      <div key={log.id} className="flex justify-between items-center border-b border-border/50 pb-4 last:border-0 last:pb-0 group">
                        <div>
                          <div className="text-sm font-semibold">{log.action}</div>
                          <div className="text-xs text-muted-foreground mt-1">by {log.user}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-xs font-mono text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                          {i !== 0 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              onClick={() => rollbackMutation.mutate(log.id)}
                              disabled={rollbackMutation.isPending}
                            >
                              {rollbackMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                              Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="global" className="space-y-6">
            {/* Watchlists */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-6"
            >
              <h3 className="text-base font-bold tracking-tight mb-5 flex items-center gap-2"><Shield className="h-5 w-5 text-indigo-500" /> Watchlist Sources</h3>
              <div className="space-y-4">
                {lists.map((list, i) => (
                  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={list.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-white shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground tracking-tight">{list.name}</div>
                        <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5 uppercase tracking-wider">
                          {list.region}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Switch checked={list.enabled} onCheckedChange={() => toggle(i)} className="data-[state=checked]:bg-indigo-600" />
                      <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDeletePolicy(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Thresholds */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border/50 bg-white/50 shadow-sm p-6 space-y-6"
            >
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warning" /> Alert Thresholds</h3>
              <div className="p-5 rounded-xl border border-border/50 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">Matching Confidence Threshold</span>
                  <span className="text-lg font-black tracking-tighter text-indigo-600">{confidence[0]}%</span>
                </div>
                <Slider value={confidence} onValueChange={setConfidence} max={100} min={30} step={5} />
                <p className="text-[11px] font-medium text-muted-foreground mt-4">Matches below this threshold will <span className="font-bold text-foreground">not generate alerts</span>.</p>
              </div>
              <div className="p-5 rounded-xl border border-border/50 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-foreground">Alert Severity Escalation</span>
                  <span className="text-lg font-black tracking-tighter text-warning">{severity[0]}%</span>
                </div>
                <Slider value={severity} onValueChange={setSeverity} max={100} min={20} step={5} />
                <p className="text-[11px] font-medium text-muted-foreground mt-4">Scores above this threshold trigger <span className="font-bold text-foreground">high-severity escalation</span>.</p>
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
              <div className="rounded-2xl border border-border/50 bg-[#F8FAFC] shadow-sm overflow-hidden h-[700px] flex flex-col relative">
                
                {/* Header / Toolbar */}
                <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-20 relative">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold shadow-sm">
                      <MousePointerSquareDashed className="h-3.5 w-3.5" /> Select
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddNode} className="gap-2 h-8 text-xs font-bold shadow-sm text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      <Plus className="h-3.5 w-3.5" /> Add Node
                    </Button>
                    <div className="h-4 w-px bg-border/50 mx-1" />
                    <Button variant="ghost" size="sm" className="gap-2 h-8 text-xs font-bold text-muted-foreground">
                      <Settings className="h-3.5 w-3.5" /> Rule Settings
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-bold" onClick={() => toast({ title: "Draft Discarded", description: "Your changes have been discarded." })}>Discard Draft</Button>
                    <Button size="sm" className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md" onClick={() => toast({ title: "Rule Deployed", description: "The new rule is now active in the pipeline." })}>Deploy Rule</Button>
                  </div>
                </div>

                <div className="flex flex-1 relative overflow-hidden">
                  {/* Toolbox Sidebar */}
                  <div className="w-64 bg-white border-r border-border/50 p-4 shadow-sm z-10 flex flex-col gap-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Triggers</h4>
                      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-center gap-3 cursor-grab hover:shadow-md transition-shadow">
                        <Database className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Incoming Tx</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Conditions</h4>
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-center gap-3 cursor-grab hover:shadow-md transition-shadow">
                          <Filter className="h-4 w-4 text-warning" />
                          <span className="text-sm font-semibold">Amount Filter</span>
                        </div>
                        <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center gap-3 cursor-grab hover:shadow-md transition-shadow">
                          <GitMerge className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-semibold">Risk Engine</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Actions</h4>
                      <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center gap-3 cursor-grab hover:shadow-md transition-shadow">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-semibold">Block Payment</span>
                      </div>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#E2E8F0_1px,transparent_1px)] [background-size:20px_20px]">
                    <Xwrapper>
                      {nodes.map((node) => (
                        <DraggableNode key={node.id} node={node} bringToFront={bringToFront} />
                      ))}
                      <Xarrow start="node-1" end="node-2" color="#94A3B8" strokeWidth={2} path="smooth" startAnchor="bottom" endAnchor="top" />
                      <Xarrow start="node-2" end="node-3" color="#94A3B8" strokeWidth={2} path="smooth" startAnchor="bottom" endAnchor="top" />
                      <Xarrow start="node-3" end="node-4" color="#ef4444" strokeWidth={2} path="smooth" dashness={{ animation: true }} startAnchor="bottom" endAnchor="top" />
                    </Xwrapper>
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
