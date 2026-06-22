import { motion } from "framer-motion";
import { Activity, AlertTriangle, Users, Shield, Newspaper, FileWarning, Clock, RefreshCw, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardSummary, fetchEntities } from "@/lib/dashboard-data";

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
  const { data: summary } = useQuery({ queryKey: ["dashboard-summary"], queryFn: fetchDashboardSummary });
  const { data: entities = [] } = useQuery({ queryKey: ["dashboard-entities"], queryFn: fetchEntities });

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
        className="rounded-xl bg-card p-5 shadow-sm"
      >
        <h3 className="text-sm font-semibold mb-4">Risk Events by Category</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={riskByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Entity Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-xl bg-card shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Monitored Entities</h3>
          <Badge variant="outline" className="text-xs font-mono">{entities.length} shown</Badge>
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
            {entities.map((e) => (
              <TableRow key={e.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium text-sm">{e.name}</TableCell>
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
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(Number(e.risk_score) >= 80 ? "Critical" : Number(e.risk_score) >= 60 ? "High Risk" : Number(e.risk_score) >= 40 ? "Medium Risk" : "Low Risk")}`}>{e.status}</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">Assigned</TableCell>
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
