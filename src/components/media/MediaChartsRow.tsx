import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RiskCategoryPoint, SignalsPoint } from "@/lib/media-agent-data";

const chartStroke = "hsl(var(--muted-foreground))";
const chartGrid = "hsl(var(--border))";

export function MediaChartsRow({ signals, categories }: { signals: SignalsPoint[]; categories: RiskCategoryPoint[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-indigo-500/20 hover:shadow-md h-full">
          <h3 className="text-base font-bold tracking-tight mb-6 flex items-center gap-2">
             Media Signals Over Time
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={signals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="signalGradLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="alertGradLive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" dy={10} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} stroke="hsl(220 10% 46%)" />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Area type="monotone" dataKey="signals" stroke="hsl(var(--primary))" fill="url(#signalGradLive)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="alerts" stroke="hsl(var(--destructive))" fill="url(#alertGradLive)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-indigo-500/20 hover:shadow-md h-full flex flex-col">
        <h3 className="text-base font-bold tracking-tight mb-2">Risk Categories</h3>
        <div className="flex-1 min-h-[200px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4}>
                {categories.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(220 13% 91%)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {categories.slice(0, 4).map((category) => (
            <div key={category.category} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: category.color }} />
              <span className="truncate text-xs font-semibold text-foreground/80">{category.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
