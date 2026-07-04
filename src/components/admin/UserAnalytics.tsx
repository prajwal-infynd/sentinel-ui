import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, AlertTriangle, Search, Filter, Loader2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const fetchUsers = async () => {
  const { data } = await apiClient.get("/admin/users");
  return data;
};

const fetchUserAnalytics = async (userId: string) => {
  const { data } = await apiClient.get(`/admin/users/${userId}/analytics`);
  return data;
};

export default function UserAnalytics() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading: usersLoading } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["user-analytics", selectedUserId],
    queryFn: () => fetchUserAnalytics(selectedUserId),
    enabled: selectedUserId !== "",
  });

  const activeUsers = useMemo(() => users.filter((u: any) => u.status === "Active"), [users]);

  const filteredUsers = useMemo(() => activeUsers.filter((u: any) =>
    !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [activeUsers, searchTerm]);

  const selectedUser = users.find((u: any) => String(u.id) === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-indigo-600" /> Filters
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-9 h-9 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-56 h-9 text-sm">
            <SelectValue placeholder="Select a user..." />
          </SelectTrigger>
          <SelectContent>
            {filteredUsers.length === 0 && !usersLoading && (
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">No users match your search</div>
            )}
            {filteredUsers.map((u: any) => (
              <SelectItem key={u.id} value={String(u.id)}>
                <div className="flex items-center gap-2">
                  <span>{u.name}</span>
                  <span className="text-muted-foreground text-xs">{u.role}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {usersLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Analytics Content */}
      {!selectedUserId && (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Select a user to view their analytics</p>
          <p className="text-sm">Includes daily token usage, cost trends, feature breakdown, and activity metrics.</p>
        </div>
      )}

      {selectedUserId && analyticsLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      )}

      {selectedUserId && analytics && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* User Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{selectedUser?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedUser?.email} · {selectedUser?.role}</p>
            </div>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {selectedUser?.tokensUsed} tokens · {selectedUser?.cost}
            </Badge>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Total API Calls (14d)", value: analytics.daily.reduce((s: number, d: any) => s + d.apiCalls, 0).toLocaleString(), icon: TrendingUp, color: "text-indigo-600" },
              { label: "Avg Daily Tokens", value: Math.round(analytics.daily.reduce((s: number, d: any) => s + d.tokens, 0) / analytics.daily.length).toLocaleString(), icon: BarChart3, color: "text-blue-600" },
              { label: "Alerts Generated", value: analytics.alertsGenerated, icon: AlertTriangle, color: "text-amber-600" },
              { label: "Avg Session Time", value: analytics.avgSessionTime, icon: Clock, color: "text-green-600" },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Daily Token Usage Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Daily Token Usage</CardTitle><CardDescription>Last 14 days of activity for this user.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="userTokens" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [value.toLocaleString(), "Tokens"]} />
                    <Area type="monotone" dataKey="tokens" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#userTokens)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Daily API Calls Bar Chart */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Daily API Calls</CardTitle><CardDescription>API call volume over the last 14 days.</CardDescription></CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [value.toLocaleString(), "API Calls"]} />
                    <Bar dataKey="apiCalls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Feature Breakdown + Daily Cost */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Feature Usage Breakdown</CardTitle><CardDescription>Where this user's tokens are spent.</CardDescription></CardHeader>
              <CardContent className="space-y-5">
                {analytics.featureBreakdown.map((fb: any) => (
                  <div key={fb.feature} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{fb.feature}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-semibold">{fb.cost}</span>
                        <span className="text-muted-foreground">{fb.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${fb.pct}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Daily Cost Trend</CardTitle><CardDescription>Cost per day over the last 14 days.</CardDescription></CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs><linearGradient id="userCost" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => `$${val.toFixed(1)}`} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value: number) => [`$${value.toFixed(2)}`, "Cost"]} />
                      <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#userCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
