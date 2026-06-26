import { useState } from "react";
import { Search, Bell, Activity, CheckCircle2, Trash2, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/context/AuthContext";

export function GlobalHeader() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Critical Alert: PEP Match", desc: "John Doe matched against OFAC list.", time: "2 min ago", unread: true },
    { id: 2, title: "Agent Completed", desc: "News Crawler finished scanning 1,200 sources.", time: "1 hr ago", unread: true },
    { id: 3, title: "System Update", desc: "New scoring policy deployed successfully.", time: "2 hrs ago", unread: true },
    { id: 4, title: "Portfolio Ingested", desc: "154 entities added to monitoring.", time: "1 day ago", unread: false },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  const clearAll = () => setNotifications([]);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white shadow-sm px-4 gap-4 relative z-50">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search entities, alerts, cases..." className="w-80 pl-9 h-9 bg-slate-100 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500" />
        </div>
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
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-2xl border-white/20 overflow-hidden z-[100] glass">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-slate-50/50">
              <span className="font-bold text-sm text-slate-900 flex items-center gap-2"><Bell className="h-4 w-4 text-indigo-500"/> Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{unreadCount} New</span>
              )}
            </div>
            
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-sm font-semibold">You're all caught up!</span>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 p-4 border-b last:border-0 hover:bg-slate-50 cursor-pointer transition-colors ${n.unread ? 'bg-indigo-50/30' : ''}`}>
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
            
            {notifications.length > 0 && (
              <div className="grid grid-cols-2 border-t border-white/20 bg-slate-50/50 divide-x divide-white/20">
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
            <div className="pt-2">
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer rounded-xl font-medium">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
