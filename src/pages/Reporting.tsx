import { motion } from "framer-motion";
import { FileText, Send, Download, TrendingUp, TrendingDown, Users, AlertTriangle, Clock, CheckCircle2, BarChart3, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
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
            <Button variant="outline" className="h-9 hover:border-primary/50 transition-colors" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2 text-primary" /> Export PDF
            </Button>
            <Button variant="outline" className="h-9 hover:border-primary/50 transition-colors"><FileText className="h-4 w-4 mr-2 text-primary" /> Board Pack</Button>
            <Button className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"><Send className="h-4 w-4 mr-2" /> Weekly Digest</Button>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
        ) : !data ? null : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.execKpis.map((kpi, i) => {
                const Icon = iconMap[kpi.iconName] || FileText;
                return (
                  <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="p-2.5 w-fit rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 mb-4">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-2xl font-black tracking-tighter mb-1">{kpi.value}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{kpi.label}</div>
                        <div className="inline-flex items-center gap-1 text-[10px] text-success font-medium bg-success/10 px-2 py-0.5 rounded-md border border-success/20">
                          <TrendingDown className="h-3 w-3" />
                          {kpi.trend}
                        </div>
                      </div>
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
                  <LineChart data={data.fpReduction} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" dy={10} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(142 71% 45%)" strokeWidth={3} dot={{ fill: "hsl(142 71% 45%)", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reporting;
