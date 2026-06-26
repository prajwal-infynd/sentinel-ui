import { motion } from "framer-motion";
import { FileText, Send, Download, TrendingUp, TrendingDown, Users, AlertTriangle, Clock, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { fetchReportingMetrics } from "@/lib/reporting-data";

const iconMap: Record<string, any> = {
  Users,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
};

const Reporting = () => {
  const { data, isLoading } = useQuery({ queryKey: ["reporting-metrics"], queryFn: fetchReportingMetrics });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Executive Reporting</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Board-level compliance metrics and performance analytics</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 hover:border-primary/50 transition-colors" onClick={() => {
              toast({ title: "Exporting PDF", description: "Your report is being generated and will download shortly." });
              setTimeout(() => window.print(), 1000);
            }}>
              <Download className="h-4 w-4 mr-2 text-primary" /> Export PDF
            </Button>
            <Button variant="outline" className="h-9 hover:border-emerald-500/50 hover:text-emerald-700 transition-colors" onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8,Date,Entity,Activity,Severity\n2023-10-01,Acme Corp,Risk Escalated to High,High\n2023-10-02,Global Logistics,AI Auto-Resolved False Positive,Low\n2023-10-03,TechNova,Sanctions Match Detected,Critical";
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "activity_change_report.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast({ title: "Exporting CSV", description: "Activity Change Report downloaded successfully." });
            }}>
              <FileText className="h-4 w-4 mr-2 text-emerald-600" /> Export CSV
            </Button>
            <Button variant="outline" className="h-9 hover:border-primary/50 transition-colors" onClick={() => toast({ title: "Board Pack Generated", description: "The board pack has been generated and saved to your files." })}>
              <FileText className="h-4 w-4 mr-2 text-primary" /> Board Pack
            </Button>
            <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" onClick={() => toast({ title: "Weekly Digest Sent", description: "The weekly digest has been dispatched to all stakeholders." })}>
              <Send className="h-4 w-4 mr-2" /> Weekly Digest
            </Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
        ) : !data ? null : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.execKpis.map((kpi, i) => {
                const Icon = iconMap[kpi.iconName] || FileText;
                return (
                  <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-indigo-500/30 p-6 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 w-fit rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 transition-colors group-hover:bg-indigo-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <TrendingDown className="h-3.5 w-3.5" />
                        {kpi.trend}
                      </div>
                    </div>
                    <div>
                      <div className="text-3xl font-black font-mono tracking-tighter text-indigo-900 mb-1">{kpi.value}</div>
                      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
              >
                <h3 className="text-base font-bold tracking-tight mb-6 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Monthly Alert Trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.monthlyAlerts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" dy={10} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" />
                    <Tooltip cursor={{ fill: "hsl(220 14% 96%)" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Bar dataKey="alerts" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
              >
                <h3 className="text-base font-bold tracking-tight mb-6 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" /> False Positive Rate (%)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.fpReduction} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorFp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" dy={10} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Area type="monotone" dataKey="rate" stroke="hsl(142 71% 45%)" strokeWidth={3} fillOpacity={1} fill="url(#colorFp)" activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(142 71% 45%)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
            >
              <h3 className="text-base font-bold tracking-tight mb-6 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Alerts by Business Unit
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-12">
                <ResponsiveContainer width="100%" height={240} className="max-w-[240px]">
                  <PieChart>
                    <Pie data={data.buAlerts} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4}>
                      {data.buAlerts.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                  {data.buAlerts.map(bu => (
                    <div key={bu.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded-full shadow-sm" style={{ background: bu.color }} />
                        <span className="text-sm font-semibold">{bu.name}</span>
                      </div>
                      <span className="text-base font-mono font-bold">{bu.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Activity Change Report */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
              className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-primary/20 hover:shadow-md mt-5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Activity Change Report (Last 30 Days)
                </h3>
                <span className="text-xs font-medium text-muted-foreground">Showing significant portfolio risk changes</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 text-xs uppercase font-bold text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Date</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3 text-right rounded-tr-lg">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      { date: "Oct 01, 2023", entity: "Acme Corp", activity: "Risk Score Escalated (32 → 85) due to Adverse Media.", severity: "High" },
                      { date: "Oct 02, 2023", entity: "Global Logistics", activity: "AI Auto-Resolved 3 False Positive matches.", severity: "Low" },
                      { date: "Oct 03, 2023", entity: "TechNova", activity: "New OFAC Sanctions Match detected.", severity: "Critical" },
                      { date: "Oct 05, 2023", entity: "Apex Holdings", activity: "Entity Onboarded to Continuous Monitoring.", severity: "Info" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{row.entity}</td>
                        <td className="px-4 py-3 text-slate-600">{row.activity}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            row.severity === 'Critical' ? 'bg-destructive/10 text-destructive' :
                            row.severity === 'High' ? 'bg-warning/10 text-warning' :
                            row.severity === 'Info' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {row.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reporting;
