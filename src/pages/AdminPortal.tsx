import { useState } from "react";
import { motion } from "framer-motion";
import { Users, CreditCard, Activity, PieChart, TrendingUp, ShieldAlert, CheckCircle2, UserPlus, Database, MoreHorizontal, ShieldOff, Trash2, Search } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const initialUsersData = [
  { id: 1, name: "Sarah Jenkins", role: "Lead Investigator", email: "sarah.j@sentinel.com", tokensUsed: "1.2M", cost: "$24.00", status: "Active" },
  { id: 2, name: "Michael Chang", role: "Compliance Analyst", email: "m.chang@sentinel.com", tokensUsed: "850k", cost: "$17.00", status: "Active" },
  { id: 3, name: "Elena Rodriguez", role: "Risk Manager", email: "elena.r@sentinel.com", tokensUsed: "2.1M", cost: "$42.00", status: "Active" },
  { id: 4, name: "David Kim", role: "Auditor", email: "dkim@sentinel.com", tokensUsed: "320k", cost: "$6.40", status: "Inactive" },
  { id: 5, name: "Marcus Chen", role: "Data Scientist", email: "m.chen@sentinel.com", tokensUsed: "4.8M", cost: "$96.00", status: "Active" },
];

const spendData = [
  { date: "Jun 10", spend: 45 },
  { date: "Jun 11", spend: 52 },
  { date: "Jun 12", spend: 48 },
  { date: "Jun 13", spend: 61 },
  { date: "Jun 14", spend: 59 },
  { date: "Jun 15", spend: 65 },
  { date: "Jun 16", spend: 72 },
  { date: "Jun 17", spend: 68 },
  { date: "Jun 18", spend: 75 },
  { date: "Jun 19", spend: 82 },
  { date: "Jun 20", spend: 79 },
  { date: "Jun 21", spend: 85 },
  { date: "Jun 22", spend: 89 },
  { date: "Jun 23", spend: 94 },
  { date: "Jun 24", spend: 89 },
];

export default function AdminPortal() {
  const [users, setUsers] = useState(initialUsersData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        toast({ title: "User Updated", description: `${u.name} is now ${newStatus}.` });
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const deleteUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(users.filter(u => u.id !== id));
    toast({ title: "User Removed", description: `${user?.name} has been removed from the workspace.`, variant: "destructive" });
  };
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="mb-2">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Admin Portal</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage users, monitor platform usage, and track AI token spend across the workspace.</p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                <UserPlus className="h-4 w-4" /> Invite New User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User to Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="jane@company.com" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>Analyst</option>
                    <option>Investigator</option>
                    <option>Admin</option>
                  </select>
                </div>
                <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">Send Invitation</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens Used</CardTitle>
                <Database className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.47M</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="h-3 w-3" /> +14.2% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimated AI Spend</CardTitle>
                <CreditCard className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$89.40</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-success font-medium">
                  <TrendingUp className="h-3 w-3" /> +5.4% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 / 15</div>
                <p className="text-xs text-muted-foreground mt-1">Seats currently allocated</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-xs text-muted-foreground mt-1">All sub-systems operational</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Spend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Daily AI Spend</CardTitle>
              <CardDescription>Token cost accumulated over the last 15 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`$${value}`, 'Spend']}
                    />
                    <Area type="monotone" dataKey="spend" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
            <Card className="h-full border-border/50 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <CardTitle>User Management & Spend Breakdown</CardTitle>
                  <CardDescription>Manage workspace members and review their individual AI agent usage costs.</CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 bg-muted/50 border-border/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
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
                        <th className="px-4 py-3 font-medium text-right">Tokens Used</th>
                        <th className="px-4 py-3 font-medium text-right">Cost</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                            No users found matching "{searchTerm}"
                          </td>
                        </tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="bg-white hover:bg-muted/20">
                          <td className="px-4 py-3 font-medium">
                            <div className="flex flex-col">
                              <span>{u.name}</span>
                              <span className="text-xs text-muted-foreground font-normal">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant="secondary" className="text-[10px]">{u.role}</Badge></td>
                          <td className="px-4 py-3">
                            {u.status === 'Active' ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">Inactive</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">{u.tokensUsed}</td>
                          <td className="px-4 py-3 text-right font-mono font-medium text-indigo-600">{u.cost}</td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleUserStatus(u.id)} className="cursor-pointer font-medium">
                                  <ShieldOff className="mr-2 h-4 w-4 text-warning" />
                                  {u.status === 'Active' ? 'Suspend Access' : 'Restore Access'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteUser(u.id)} className="cursor-pointer text-destructive font-medium focus:text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
                                </DropdownMenuItem>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="h-full border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
                <CardDescription>Token spend by feature area</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Data Architecture Embedding</span>
                    <span className="text-muted-foreground">45%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[45%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Swarm Agent Investigations</span>
                    <span className="text-muted-foreground">30%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[30%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Adverse Media Crawling</span>
                    <span className="text-muted-foreground">15%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[15%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">27x.ai PIL Logs / Telemetry</span>
                    <span className="text-muted-foreground">10%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[10%]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
}
