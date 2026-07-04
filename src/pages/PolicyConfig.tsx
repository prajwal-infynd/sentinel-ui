import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Shield, ShieldAlert, Plus, Checkbox, Search, MoreHorizontal, Database, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

type Policy = {
  id: string;
  name: string;
  status: "Active" | "Draft" | "Inactive";
  sources: string[];
  fields: string[];
  instructions: string;
  lastUpdated: string;
};

const MOCK_POLICIES: Policy[] = [
  {
    id: "POL-001",
    name: "Standard KYB Onboarding",
    status: "Active",
    sources: ["Infynd Corporate Data", "UK Companies House"],
    fields: ["Director Name Match", "Registration Number Valid", "Company Status Active"],
    instructions: "Ensure all core corporate registry fields match before routing to manual review.",
    lastUpdated: "2026-07-01",
  },
  {
    id: "POL-002",
    name: "High-Risk Jurisdiction Sanctions",
    status: "Active",
    sources: ["OFAC Sanctions List", "EU Consolidated List", "UN Security Council"],
    fields: ["Exact Name Match", "Fuzzy Name Match (90%)", "DOB Match"],
    instructions: "Strict matching for any entities originating from high-risk jurisdictions. Automatically block if exact name match occurs.",
    lastUpdated: "2026-07-03",
  },
  {
    id: "POL-003",
    name: "Adverse Media Screening (FinCrime)",
    status: "Draft",
    sources: ["Global News API", "Infynd Adverse Media Engine"],
    fields: ["Financial Crime Category", "Regulatory Penalty Category", "Sentiment Score < 30"],
    instructions: "Flag all entities with recent negative news related to financial crime for analyst review.",
    lastUpdated: "2026-07-04",
  }
];

const AVAILABLE_SOURCES_GROUPED = {
  "Infynd Data": [
    "Infynd Corporate Data",
    "Infynd Adverse Media Engine"
  ],
  "External Data": [
    "UK Companies House",
    "OFAC Sanctions List",
    "EU Consolidated List",
    "UN Security Council",
    "Global News API"
  ],
  "Custom Data": [
    "Custom CRM Upload"
  ]
};

const SOURCE_FIELD_MAP: Record<string, Record<string, string[]>> = {
  "Infynd Corporate Data": { "Identity & Registry": ["Director Name Match", "Registration Number Valid", "Company Status Active", "UBO Identified"] },
  "UK Companies House": { "Identity & Registry": ["Director Name Match", "Registration Number Valid", "Company Status Active", "Address Verified"] },
  "OFAC Sanctions List": { "Screening & Risk": ["Exact Name Match", "Fuzzy Name Match (90%)", "DOB Match"] },
  "EU Consolidated List": { "Screening & Risk": ["Exact Name Match", "Fuzzy Name Match (90%)"] },
  "UN Security Council": { "Screening & Risk": ["Exact Name Match"] },
  "Infynd Adverse Media Engine": { "Screening & Risk": ["Financial Crime Category", "Regulatory Penalty Category"] },
  "Global News API": { "Screening & Risk": ["Sentiment Score < 30"] },
  "Custom CRM Upload": { "Identity & Registry": ["Address Verified"] }
};

export default function PolicyConfig() {
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  // New Policy State
  const [newName, setNewName] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");

  const toggleSource = (source: string) => {
    setSelectedSources(prev => prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingPolicyId(null);
      setNewName("");
      setSelectedSources([]);
      setSelectedFields([]);
      setInstructions("");
    }
  };

  const handleManage = (policy: Policy) => {
    setEditingPolicyId(policy.id);
    setNewName(policy.name);
    setSelectedSources(policy.sources);
    setSelectedFields(policy.fields);
    setInstructions(policy.instructions);
    setIsAddOpen(true);
  };

  const handleToggleStatus = (id: string, checked: boolean) => {
    setPolicies(policies.map(p => p.id === id ? { ...p, status: checked ? "Active" : "Inactive" } : p));
  };

  const handleAddPolicy = () => {
    if (!newName) {
      toast({ title: "Validation Error", description: "Policy name is required.", variant: "destructive" });
      return;
    }

    if (editingPolicyId) {
      setPolicies(policies.map(p => p.id === editingPolicyId ? { ...p, name: newName, sources: selectedSources, fields: selectedFields, instructions } : p));
      toast({ title: "Policy Updated", description: "The policy has been updated successfully." });
    } else {
      const newPolicy: Policy = {
        id: `POL-00${policies.length + 1}`,
        name: newName,
        status: "Active",
        sources: selectedSources,
        fields: selectedFields,
        instructions,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setPolicies([newPolicy, ...policies]);
      toast({ title: "Policy Added", description: "The new policy has been deployed successfully." });
    }

    handleOpenChange(false);
  };

  const filteredPolicies = policies.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="p-8 max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Policy Hub
            </h1>
            <p className="text-base text-slate-500 font-medium max-w-2xl">
              Centralized management for routing rules, matching configurations, and data source utilization across the platform.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input 
                placeholder="Search policies..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-indigo-500 transition-shadow hover:shadow-md w-full"
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-bold px-6 rounded-xl shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all">
                  <Plus className="h-4 w-4" strokeWidth={3} /> Add Policy
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">{editingPolicyId ? "Edit Policy" : "Create New Policy"}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8 py-4">
                {/* 1. Basic Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Policy Details</h3>
                  <Input 
                    placeholder="Enter Policy Name (e.g. High-Risk Sanctions)" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="text-lg font-semibold h-12"
                  />
                </div>

                {/* 2. Select Sources */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Select Data Sources</h3>
                  <div className="space-y-6">
                    {Object.entries(AVAILABLE_SOURCES_GROUPED).map(([groupName, sources]) => (
                      <div key={groupName} className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{groupName}</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {sources.map(source => (
                            <div 
                              key={source} 
                              onClick={() => toggleSource(source)}
                              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                                selectedSources.includes(source) ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-100 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 border ${selectedSources.includes(source) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                 {selectedSources.includes(source) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                              </div>
                              <span className={`text-sm font-semibold ${selectedSources.includes(source) ? 'text-indigo-900' : 'text-slate-700'}`}>{source}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Select Fields */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Configure Fields to Evaluate</h3>
                  <div className="space-y-6">
                    {selectedSources.length === 0 ? (
                      <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        Please select at least one data source above to configure its fields.
                      </div>
                    ) : (
                      Object.entries(
                        selectedSources.reduce((acc, source) => {
                          const fieldsForSource = SOURCE_FIELD_MAP[source] || {};
                          Object.entries(fieldsForSource).forEach(([category, fields]) => {
                            if (!acc[category]) acc[category] = new Set();
                            fields.forEach(f => acc[category].add(f));
                          });
                          return acc;
                        }, {} as Record<string, Set<string>>)
                      ).map(([category, fieldSet]) => {
                        const fields = Array.from(fieldSet);
                        return (
                          <div key={category} className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-500">{category}</h4>
                            <div className="flex flex-wrap gap-2">
                              {fields.map(field => (
                                <div
                                  key={field}
                                  onClick={() => toggleField(field)}
                                  className={`px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 ${
                                    selectedFields.includes(field) ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                                >
                                  {selectedFields.includes(field) && <CheckCircle2 className="h-3 w-3" />}
                                  {field}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 4. Instructions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">4. Policy Instructions / Rules</h3>
                  <Textarea 
                    placeholder="Enter instructions or context for analysts regarding this policy..." 
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    className="min-h-[100px] resize-none text-sm"
                  />
                </div>

              </div>

              <DialogFooter className="border-t border-slate-100 pt-4">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button onClick={handleAddPolicy} className="bg-indigo-600 hover:bg-indigo-700">
                  {editingPolicyId ? "Update Policy" : "Deploy Policy"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>



        {/* Policy List */}
        <div className="space-y-4">
          {filteredPolicies.map((policy) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={policy.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col"
            >
              {/* Top Section: Header & Actions */}
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{policy.id}</span>
                    <Badge variant="secondary" className={`text-xs ${
                      policy.status === 'Active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      policy.status === 'Draft' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {policy.status}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{policy.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                    <Switch checked={policy.status === "Active"} onCheckedChange={(checked) => handleToggleStatus(policy.id, checked)} className="data-[state=checked]:bg-emerald-500" />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleManage(policy)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold shadow-sm transition-all h-9 px-4">
                    Edit Policy
                  </Button>
                </div>
              </div>

              {/* Middle Section: Instructions */}
              <div className="p-6 border-b border-slate-100">
                <div className="relative border-l-4 border-indigo-400 pl-5 py-1 ml-2">
                  <FileText className="absolute -left-9 top-0.5 h-5 w-5 text-indigo-300" />
                  <p className="text-slate-700 font-medium leading-relaxed italic">
                    "{policy.instructions}"
                  </p>
                </div>
              </div>

              {/* Bottom Section: Sources & Fields */}
              <div className="p-6 bg-white flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-300" /> Data Sources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {policy.sources.map(s => (
                      <span key={s} className="bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-300" /> Configured Fields
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {policy.fields.map(f => (
                      <span key={f} className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                <span>Last updated: {policy.lastUpdated}</span>
              </div>
            </motion.div>
          ))}
          
          {filteredPolicies.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No policies found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search query.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
