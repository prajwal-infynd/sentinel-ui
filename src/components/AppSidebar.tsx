import {
  LayoutDashboard, Briefcase, AlertTriangle, Search, Bot, Database, Shield, BarChart3, Settings, Zap, Users
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Portfolio", url: "/portfolio", icon: Briefcase },
  { title: "Live Alerts", url: "/alerts", icon: AlertTriangle },
  { title: "Investigations", url: "/investigations", icon: Search },
];

const platformItems = [
  { title: "AI Agents", url: "/agents", icon: Bot },
  { title: "Data Sources", url: "/architecture", icon: Database },
  { title: "Policy Layer", url: "/policy", icon: Shield },
  { title: "Reporting", url: "/reporting", icon: BarChart3 },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Admin Portal", url: "/admin", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className={cn("text-sidebar-muted text-[10px] font-semibold uppercase tracking-[0.15em]", collapsed && "hidden")}>
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className={cn(collapsed && "items-center")}>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-primary-foreground" className={cn(collapsed && "justify-center")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className={cn("p-4", collapsed && "p-2 items-center justify-center")}>
        <NavLink to="/" className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">Sentinel</span>
              <span className="text-[10px] text-sidebar-muted tracking-wide">KYB & Agentic Management</span>
            </div>
          )}
        </NavLink>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {renderGroup("Monitoring", mainItems)}
        {renderGroup("Platform", platformItems)}
        {renderGroup("System", systemItems)}
      </SidebarContent>
      <SidebarFooter className={cn("p-4", collapsed && "p-2 items-center justify-center")}>
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 shrink-0 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-sidebar-foreground">All systems operational</span>
            </div>
          </div>
        ) : (
          <div className="h-2 w-2 shrink-0 rounded-full bg-success animate-pulse" title="All systems operational" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
