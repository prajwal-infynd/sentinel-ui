import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Users, Shield, Newspaper, FileWarning, Clock, RefreshCw, TrendingUp, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDashboardSummary, fetchEntities, updateEntityStatus } from "@/lib/dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const alertsOverTime = [
  { date: "Mon", alerts: 12 }, { date: "Tue", alerts: 19 }, { date: "Wed", alerts: 8 },
  { date: "Thu", alerts: 24 }, { date: "Fri", alerts: 16 }, { date: "Sat", alerts: 6 }, { date: "Sun", alerts: 14 },
];
const alertsBySeverity = [
  { name: "Critical", value: 8, color: "hsl(0 72% 51%)" },
  { name: "High", value: 23, color: "hsl(38 92% 50%)" },
  { name: "Medium", value: 41, color: "hsl(221 83% 53%)" },
  { name: "Low", value: 67, color: "hsl(220 14% 80%)" },
];
const riskByCategory = [
  { category: "Sanctions", count: 34 }, { category: "PEP", count: 22 },
  { category: "Adverse Media", count: 47 }, { category: "Fraud", count: 18 },
  { category: "Corruption", count: 12 }, { category: "Terrorism", count: 6 },
];

const riskColor = (score: number) =>
  score >= 80 ? "bg-destructive" : score >= 60 ? "bg-warning" : score >= 40 ? "bg-primary" : "bg-success";
const statusColor = (s: string) =>
  s === "Critical" ? "text-destructive bg-destructive/10" : s === "High Risk" ? "text-warning bg-warning/10" :
  s === "Medium Risk" ? "text-primary bg-primary/10" : "text-success bg-success/10";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mutedEntities, setMutedEntities] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });
  const { data: entities = [] } = useQuery({ queryKey: ["dashboard-entities"], queryFn: fetchEntities });

  const filteredEntities = entities.filter((e: any) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || e.entity_type === typeFilter;
    const matchesJurisdiction = jurisdictionFilter === "all" || e.jurisdiction === jurisdictionFilter;
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesType && matchesJurisdiction && matchesStatus;
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateEntityStatus(id, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-entities"] });
      toast({ title: "Status Updated", description: `Entity status changed to ${variables.status}` });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update entity status", variant: "destructive" });
    }
  });

  const kpis = [
    { label: "Entities Monitored", value: String(summary?.entityCount ?? 0), icon: Users, delta: "live portfolio" },
    { label: "Alerts Open", value: String(summary?.alertCount ?? 0), icon: AlertTriangle, delta: "triage queue" },
    { label: "High-Risk Alerts", value: String(summary?.highRiskAlertCount ?? 0), icon: FileWarning, delta: "high + critical" },
    { label: "Open Cases", value: String(summary?.openCaseCount ?? 0), icon: Shield, delta: "investigations active" },
    { label: "Media Articles", value: String(summary?.articleCount ?? 0), icon: Newspaper, delta: "articles ingested" },
    { label: "Active Agents", value: String(summary?.activeAgentRuns ?? 0), icon: AlertTriangle, delta: "running now" },
    { label: "Avg Risk Score", value: String(summary?.avgRiskScore ?? 0), icon: Clock, delta: "portfolio average" },
    { label: "Sync State", value: "Live", icon: RefreshCw, delta: "Cloud-backed" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Portfolio Overview</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-success/15 text-success border-success/30 gap-1.5 px-2 py-0 h-5">
                  <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live Sync
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">{summary?.organizationName ?? "Monitoring Workspace"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-xl border">
          <div className="px-3 py-1 flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Entities</span>
            <span className="font-mono text-sm font-bold text-foreground">{summary?.entityCount ?? 0}</span>
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <kpi.icon className="h-4 w-4" />
                </div>
                {i % 3 === 0 ? <TrendingUp className="h-4 w-4 text-success" /> : null}
              </div>
              <div className="text-3xl font-black tracking-tighter mb-1">{kpi.value}</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
              <div className="text-[10px] text-primary/80 mt-1.5 font-medium bg-primary/5 inline-block px-2 py-0.5 rounded-md border border-primary/10">{kpi.delta}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="md:col-span-2 rounded-xl bg-card p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-4">Alerts Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={alertsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
              <Tooltip />
              <Area type="monotone" dataKey="alerts" stroke="hsl(221 83% 53%)" fill="hsl(221 83% 53% / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="rounded-xl bg-card p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-4">By Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={alertsBySeverity} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {alertsBySeverity.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-xl bg-card p-5 shadow-sm border border-border/50"
      >
        <h3 className="text-sm font-semibold mb-4">Global Risk Concentration Heatmap</h3>
        <div className="w-full h-[250px] bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center relative">
          {/* Topography map */}
          <ComposableMap 
            projectionConfig={{ scale: 140, center: [0, 20] }} 
            width={800} height={400} 
            className="w-full h-full"
          >
            <Geographies geography="https://unpkg.com/world-atlas@2.0.2/countries-110m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  // Dummy risk logic
                  let riskColor = "#E2E8F0"; // Default slate-200
                  if (["Russia", "Iran", "North Korea"].includes(name)) riskColor = "#EF4444"; // Red for Critical
                  else if (["China", "Venezuela", "Syria"].includes(name)) riskColor = "#F59E0B"; // Amber for High
                  else if (["United Kingdom", "Switzerland", "United Arab Emirates", "British Virgin Islands", "Panama"].includes(name)) riskColor = "#6366F1"; // Indigo for Media hits

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={riskColor}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: riskColor, opacity: 0.8, cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-[10px] font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Sanctioned List</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> Elevated Risk</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-500"></div> Active Investigations</div>
          </div>
        </div>
      </motion.div>

      {/* Entity Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-xl bg-card shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold whitespace-nowrap">Monitored Entities</h3>
            <Badge variant="outline" className="text-xs font-mono">{filteredEntities.length} shown</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entities..."
                className="pl-8 h-8 w-[200px] text-xs bg-muted/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 text-xs w-[110px] bg-muted/30 border-dashed">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Types</SelectItem>
                <SelectItem value="company" className="text-xs">Company</SelectItem>
                <SelectItem value="individual" className="text-xs">Individual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="h-8 text-xs w-[110px] bg-muted/30 border-dashed">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Locations</SelectItem>
                <SelectItem value="US" className="text-xs">US</SelectItem>
                <SelectItem value="UK" className="text-xs">UK</SelectItem>
                <SelectItem value="EU" className="text-xs">EU</SelectItem>
                <SelectItem value="QA" className="text-xs">QA</SelectItem>
                <SelectItem value="RU" className="text-xs">RU</SelectItem>
                <SelectItem value="MX" className="text-xs">MX</SelectItem>
                <SelectItem value="HK" className="text-xs">HK</SelectItem>
                <SelectItem value="PA" className="text-xs">PA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs w-[110px] bg-muted/30 border-dashed">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="Active" className="text-xs">Active</SelectItem>
                <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                <SelectItem value="High Risk" className="text-xs">High Risk</SelectItem>
                <SelectItem value="Dormant" className="text-xs">Dormant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Entity</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Jurisdiction</TableHead>
              <TableHead className="text-xs">Risk Score</TableHead>
              <TableHead className="text-xs">Latest Signal</TableHead>
              <TableHead className="text-xs">Last Checked</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntities.map((e: any) => (
              <TableRow key={e.id} className={`cursor-pointer hover:bg-muted/50 group ${mutedEntities.has(e.id) ? 'opacity-60 bg-muted/20' : ''}`}>
                <TableCell className="font-medium text-sm">
                  <div className="flex items-center gap-2">
                    {e.name}
                    {mutedEntities.has(e.id) && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Muted</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground capitalize">{e.entity_type}</TableCell>
                <TableCell className="text-xs">{e.jurisdiction}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${riskColor(Number(e.risk_score))}`} style={{ width: `${Number(e.risk_score)}%` }} />
                    </div>
                    <span className="text-xs font-mono">{Number(e.risk_score).toFixed(0)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">{e.latest_signal ?? "Awaiting fresh signal"}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{e.last_screened_at ? new Date(e.last_screened_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</TableCell>
                <TableCell>
                  {mutedEntities.has(e.id) ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Muted</span>
                  ) : (
                    <Select
                      defaultValue={e.status}
                      onValueChange={(val) => statusMutation.mutate({ id: e.id, status: val })}
                    >
                      <SelectTrigger className={`h-6 text-[10px] font-semibold px-2 py-0.5 rounded-full border-none shadow-none w-[110px] focus:ring-0 ${statusColor(e.status === "Critical" ? "Critical" : e.status === "High Risk" ? "High Risk" : e.status === "Active" ? "Medium Risk" : "Low Risk")}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active" className="text-xs">Active</SelectItem>
                        <SelectItem value="Critical" className="text-xs">Critical</SelectItem>
                        <SelectItem value="High Risk" className="text-xs">High Risk</SelectItem>
                        <SelectItem value="Dormant" className="text-xs">Dormant</SelectItem>
                        <SelectItem value="Inactive" className="text-xs">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground relative">
                  <div className="flex items-center justify-between">
                    <span>Assigned</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur rounded shadow-sm border border-slate-200 px-1 absolute right-2 top-1/2 -translate-y-1/2">
                      <button className="px-2 py-1 text-[10px] font-bold uppercase text-indigo-600 hover:bg-indigo-50 rounded" onClick={(ev) => { ev.stopPropagation(); navigate("/investigations", { state: { entity: e } }); }}>Investigate</button>
                      <button className="px-2 py-1 text-[10px] font-bold uppercase text-slate-500 hover:bg-slate-100 rounded" onClick={(ev) => { 
                        ev.stopPropagation(); 
                        setMutedEntities(prev => {
                          const next = new Set(prev);
                          if (next.has(e.id)) {
                            next.delete(e.id);
                            toast({ title: "Entity Unmuted", description: `${e.name} has been unmuted.` });
                          } else {
                            next.add(e.id);
                            toast({ title: "Entity Muted", description: `${e.name} will not trigger new alerts for 30 days.` });
                          }
                          return next;
                        });
                      }}>
                        {mutedEntities.has(e.id) ? "Unmute" : "Mute"}
                      </button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  </DashboardLayout>
  );
};

export default Dashboard;
