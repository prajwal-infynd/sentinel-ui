import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CreditCard, Activity, TrendingUp, CheckCircle2, Search, Loader2, X, UserCheck, MoreHorizontal, ShieldOff, Trash2, Database, Building2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { fetchAuditLogs } from "@/lib/policy-data";

const fetchUsers = async () => {
  const { data } = await apiClient.get("/admin/users");
  return data;
};

const fetchPendingUsers = async () => {
  const { data } = await apiClient.get("/admin/pending-users");
  return data;
};

const spendData = [
  { date: "Jun 10", spend: 45 }, { date: "Jun 11", spend: 52 }, { date: "Jun 12", spend: 48 },
  { date: "Jun 13", spend: 61 }, { date: "Jun 14", spend: 59 }, { date: "Jun 15", spend: 65 },
  { date: "Jun 16", spend: 72 }, { date: "Jun 17", spend: 68 }, { date: "Jun 18", spend: 75 },
  { date: "Jun 19", spend: 82 }, { date: "Jun 20", spend: 79 }, { date: "Jun 21", spend: 85 },
  { date: "Jun 22", spend: 89 }, { date: "Jun 23", spend: 94 }, { date: "Jun 24", spend: 89 },
];

export default function AdminDashboard() {
  const { hasPermission } = useAuth();
  const isSuperAdmin = hasPermission("admin:*");
  const location = useLocation();
  const orgParam = new URLSearchParams(location.search).get("org") || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const { data: users = [], refetch } = useQuery({ queryKey: ["admin-users"], queryFn: fetchUsers });
  const { data: pendingUsers = [], refetch: refetchPending } = useQuery({ queryKey: ["admin-pending-users"], queryFn: fetchPendingUsers, refetchInterval: 5000 });
  const { data: globalLogs, isLoading: isLogsLoading } = useQuery({ queryKey: ["global-audit-logs"], queryFn: () => fetchAuditLogs() });

  const approveUser = async (id: number) => {
    setApprovingId(id);
    await apiClient.post(`/admin/users/${id}/approve`);
    refetch(); refetchPending();
    toast({ title: "User Approved", description: "User is now Active." });
    setApprovingId(null);
  };

  const rejectUser = async (id: number) => {
    await apiClient.post(`/admin/users/${id}/reject`);
    refetch(); refetchPending();
    toast({ title: "User Rejected", description: "User removed.", variant: "destructive" });
  };

  const toggleUserStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    await apiClient.patch(`/admin/users/${id}/status`, { status: newStatus });
    refetch();
    toast({ title: "User Updated", description: `User is now ${newStatus}.` });
  };

  const deleteUser = async (id: number) => {
    await apiClient.delete(`/admin/users/${id}`);
    refetch();
    toast({ title: "User Removed", description: "User deleted.", variant: "destructive" });
  };

  // Apply org filter from URL params
  const filteredByAdmin = users.filter((u: any) => {
    if (orgParam !== "all" && String(u.organizationId) !== orgParam) return false;
    return true;
  });

  // Apply local search
  const filteredUsers = filteredByAdmin.filter((u: any) =>
    !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats computed from filtered set
  const totalTokens = filteredByAdmin.reduce((sum: number, u: any) => sum + parseFloat((u.tokensUsed || "0").replace(/[^0-9.]/g, "")) || 0, 0);
  const totalCost = filteredByAdmin.reduce((sum: number, u: any) => sum + parseFloat((u.cost || "$0").replace(/[^0-9.]/g, "")) || 0, 0);
  const activeCount = filteredByAdmin.filter((u: any) => u.status === "Active").length;
  const formatTokens = (v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : `${v}`;

  return (
    <div className="space-y-8">
      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center"><Database className="h-4 w-4 text-amber-600" /></div>
                  <div>
                    <CardTitle className="text-base text-amber-900">Pending Approvals</CardTitle>
                    <CardDescription className="text-amber-700 text-xs">{pendingUsers.length} account{pendingUsers.length > 1 ? "s" : ""} awaiting admin sign-off</CardDescription>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-none font-bold">{pendingUsers.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingUsers.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{u.email}</span>
                          {u.companyName && <><span>·</span><span className="flex items-center gap-0.5"><Building2 className="w-3 h-3" />{u.companyName}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => rejectUser(u.id)} className="h-8 border-red-200 text-red-600 hover:bg-red-50 gap-1 font-medium"><X className="w-3.5 h-3.5" /> Reject</Button>
                      <Button size="sm" onClick={() => approveUser(u.id)} disabled={approvingId === u.id} className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-1 font-medium">{approvingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />} Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Tokens Used", value: formatTokens(totalTokens), icon: Database, color: "text-indigo-600" },
          { title: "Estimated AI Spend", value: `$${totalCost.toFixed(2)}`, icon: CreditCard, color: "text-blue-600" },
          { title: "Active Users", value: `${activeCount} / ${filteredByAdmin.length}`, icon: Users, color: "text-blue-600" },
          { title: "System Health", value: "100%", icon: Activity, color: "text-success" },
        ].map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Spend Chart */}
      <Card>
        <CardHeader className="pb-2"><CardTitle>Daily AI Spend</CardTitle><CardDescription>Token cost over the last 15 days.</CardDescription></CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} formatter={(value) => [`$${value}`, "Spend"]} />
                <Area type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* User Management Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage workspace members.</CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9 bg-muted/50 border-border/50" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Tokens</th>
                  <th className="px-4 py-3 font-medium text-right">Cost</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>
                ) : filteredUsers.map((u: any) => (
                  <tr key={u.id} className="bg-white hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium"><div className="flex flex-col"><span>{u.name}</span><span className="text-xs text-muted-foreground font-normal">{u.email}</span></div></td>
                    <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{u.role}</Badge></td>
                    <td className="px-4 py-3">{u.status === "Active" ? <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge> : <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>}</td>
                    <td className="px-4 py-3 text-right font-mono">{u.tokensUsed}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-indigo-600">{u.cost}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleUserStatus(u.id, u.status || "Active")}>{u.status === "Active" ? <><ShieldOff className="mr-2 h-4 w-4" /> Suspend</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Activate</>}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive font-medium" onClick={() => deleteUser(u.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Spend Breakdown + Usage Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Spend Breakdown</CardTitle><CardDescription>Token spend by feature area across workspace members.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: "Data Architecture Embedding", pct: 45, color: "bg-indigo-500" },
              { label: "Swarm Agent Investigations", pct: 30, color: "bg-blue-500" },
              { label: "Adverse Media Crawling", pct: 15, color: "bg-blue-400" },
              { label: "27x.ai PIL Logs / Telemetry", pct: 10, color: "bg-blue-300" },
            ].map(item => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-muted-foreground">{item.pct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} w-[${item.pct}%]`} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Usage Distribution</CardTitle><CardDescription>Member cost breakdown</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Super Admin", cost: "$24.00", pct: 27, color: "bg-indigo-500" },
              { name: "Owner User", cost: "$17.00", pct: 19, color: "bg-blue-500" },
              { name: "Standard User", cost: "$42.00", pct: 47, color: "bg-blue-400" },
            ].map(member => (
              <div key={member.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.cost}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${member.color}`} style={{ width: `${member.pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{member.pct}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Policy Audit Logs */}
      <Card>
        <CardHeader><CardTitle>Global Policy Changes</CardTitle><CardDescription>Audit log of compliance policy configurations.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 border-y border-border/50">
                <tr><th className="px-4 py-3 font-semibold">Date & Time</th><th className="px-4 py-3 font-semibold">Entity</th><th className="px-4 py-3 font-semibold">Action</th><th className="px-4 py-3 font-semibold">User</th></tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLogsLoading ? <tr><td colSpan={4} className="px-4 py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></td></tr>
                  : !globalLogs?.length ? <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No changes recorded.</td></tr>
                  : globalLogs.map((log: any) => (
                    <tr key={log.id} className="bg-white hover:bg-muted/20">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-indigo-700">{log.entity}</td>
                      <td className="px-4 py-3">{log.action}</td>
                      <td className="px-4 py-3 text-muted-foreground">{log.user}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
