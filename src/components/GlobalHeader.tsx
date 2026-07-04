import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Activity, CheckCircle2, Trash2, LogOut, Clock, UserCheck, X, Loader2, Users, Shield, Building2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/components/ui/use-toast";

const fetchPendingUsers = async () => {
  try {
    const { data } = await apiClient.get("/admin/pending-users");
    return data as any[];
  } catch {
    return [];
  }
};

export function GlobalHeader() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = hasPermission("invite_user");
  const isSuperAdmin = hasPermission("admin:*");
  const isAdminPage = location.pathname === "/admin";

  const params = new URLSearchParams(location.search);
  const orgParam = params.get("org") || "all";

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/organizations"); return data; },
    enabled: isSuperAdmin && isAdminPage,
  });

  const handleOrgChange = (orgId: string) => {
    const p = new URLSearchParams(location.search);
    if (orgId === "all") { p.delete("org"); } else { p.set("org", orgId); }
    navigate(`${location.pathname}?${p.toString()}`, { replace: true });
  };

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Critical Risk: Adverse Media", desc: "Atos SE flagged for potential default risk based on recent executive turnover and credit downgrades.", time: "2 min ago", unread: true },
    { id: 2, title: "Agent Crawler Completed", desc: "AI Agent finished deep-dive screening on 34 recently onboarded entities. 2 high-risk signals detected.", time: "15 min ago", unread: true },
    { id: 3, title: "Sanctions List Update", desc: "Global OFAC/SDN lists updated. Running background delta-scan across portfolio...", time: "1 hr ago", unread: true },
    { id: 4, title: "Case Assigned", desc: "You have been assigned to review 'Volkswagen AG' compliance breach.", time: "3 hrs ago", unread: false },
    { id: 5, title: "Portfolio Sync", desc: "Successfully imported 12 new CRM records into the monitoring pipeline.", time: "1 day ago", unread: false },
  ]);

  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Poll pending approvals every 5s — only for admins
  const { data: pendingUsers = [], refetch: refetchPending } = useQuery({
    queryKey: ["header-pending-users"],
    queryFn: fetchPendingUsers,
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter(n => n.unread).length;
  const totalBadge = unreadCount + (isAdmin ? pendingUsers.length : 0);

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const clearAll = () => setNotifications([]);

  const approveUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setApprovingId(id);
    try {
      await apiClient.post(`/admin/users/${id}/approve`);
      await refetchPending();
      toast({ title: "User Approved ✓", description: "User is now Active. Welcome email sent via SES." });
    } catch {
      toast({ title: "Error", description: "Could not approve user.", variant: "destructive" });
    }
    setApprovingId(null);
  };

  const rejectUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await apiClient.post(`/admin/users/${id}/reject`);
    await refetchPending();
    toast({ title: "User Rejected", description: "User removed from approval queue.", variant: "destructive" });
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white shadow-sm px-4 gap-4 relative z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search entities, alerts, cases..." className="w-80 pl-9 h-9 bg-slate-100 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500" />
        </div>
        {isAdminPage && isSuperAdmin && (
          <Select value={orgParam} onValueChange={handleOrgChange}>
            <SelectTrigger className="w-[200px] h-9 bg-white border-slate-200 text-sm hidden md:flex">
              <Building2 className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map((org: any) => (
                <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="hidden sm:flex gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 border-emerald-200 text-emerald-700 bg-emerald-50">
          <Activity className="h-3 w-3" />
          Cloud Live
        </Badge>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 hidden sm:flex bg-slate-100 px-3 py-1.5 rounded-full">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
          <span>Monitoring Workspace</span>
        </div>
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* ── Notification Bell ─────────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
              <Bell className="h-4 w-4" />
              {totalBadge > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {totalBadge > 9 ? "9+" : totalBadge}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 rounded-2xl p-0 shadow-2xl border border-slate-100 overflow-hidden z-[100]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" /> Notifications
              </span>
              {totalBadge > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {totalBadge} New
                </span>
              )}
            </div>

            <div className="flex flex-col max-h-[420px] overflow-y-auto divide-y divide-slate-100">

              {/* ── Pending Approvals Section (admin only) ── */}
              {isAdmin && pendingUsers.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-amber-50 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Pending Approvals · {pendingUsers.length}
                    </span>
                  </div>
                  {pendingUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-50/50 hover:bg-amber-50 transition-colors border-b border-amber-100/60 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          {u.companyName && (
                            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">{u.companyName}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => rejectUser(u.id, e)}
                          className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => approveUser(u.id, e)}
                          disabled={approvingId === u.id}
                          className="h-7 px-2.5 flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-60"
                          title="Approve"
                        >
                          {approvingId === u.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <><UserCheck className="w-3 h-3" /> Approve</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Go to Admin Portal */}
                  <button
                    onClick={() => navigate("/admin")}
                    className="w-full px-4 py-2 text-xs text-indigo-600 font-bold hover:bg-indigo-50 text-left transition-colors border-b border-amber-100"
                  >
                    View all in Admin Portal →
                  </button>
                </div>
              )}

              {/* ── Regular Notifications ── */}
              {notifications.length === 0 && pendingUsers.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-sm font-semibold">You're all caught up!</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-indigo-50/30' : ''}`}>
                    <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-transparent'}`} />
                    <div>
                      <div className={`text-sm ${n.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-500'}`}>{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</div>
                      <div className="text-[10px] text-slate-400 mt-1.5 font-bold tracking-wide uppercase">{n.time}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer actions */}
            {(notifications.length > 0) && (
              <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50/50 divide-x divide-slate-100">
                <Button variant="ghost" onClick={markAllAsRead} className="rounded-none text-xs h-10 font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark read
                </Button>
                <Button variant="ghost" onClick={clearAll} className="rounded-none text-xs h-10 font-bold text-slate-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear all
                </Button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User Avatar ──────────────────────────────────────────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-8 min-w-8 items-center justify-center rounded-full bg-indigo-100 px-2 text-xs font-bold text-indigo-700 hover:bg-indigo-200 transition-colors border border-indigo-200 shadow-sm"
            >
              {user?.name?.substring(0, 2).toUpperCase() || "US"}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-xl border border-slate-100">
            <div className="flex flex-col space-y-1 p-2 pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">{user?.name}</span>
              <span className="text-xs text-slate-500 truncate">{user?.email}</span>
              <Badge variant="outline" className="w-fit mt-1 text-[10px] uppercase font-bold bg-slate-50 text-slate-600">{user?.role}</Badge>
            </div>
            <div className="pt-2 pb-1 border-b border-slate-100 mb-2">
                <button
                  onClick={() => navigate("/admin?tab=users")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl hover:bg-indigo-50 text-indigo-700 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </button>
                {hasPermission("admin:*") && (
                  <button
                    onClick={() => navigate("/admin?tab=roles")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl hover:bg-indigo-50 text-indigo-700 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Manage Roles
                  </button>
                )}
              </div>
            <div className="pt-1">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
