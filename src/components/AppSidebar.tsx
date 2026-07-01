import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import {
  LayoutDashboard, Briefcase, AlertTriangle, Search, Bot, Database, Shield, BarChart3, Settings, Zap, Users, Newspaper, ShieldAlert, Activity, Brain, UserPlus
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuAction, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const mainItems = [
  { title: "Onboarding", url: "/onboarding", icon: UserPlus },
  { title: "Monitoring", url: "/monitor/dashboard", icon: Briefcase },
];

const platformItems = [
  { 
    title: "Data Sources", 
    url: "/architecture", 
    icon: Database,
    subItems: [
      { title: "External Data", url: "/architecture/external" },
      { title: "Custom Data", url: "/architecture/custom" },
      { title: "Infynd Data", url: "/architecture/infynd" },
      { title: "Crawling Data", url: "/architecture/crawling" },
    ]
  },
  { title: "Policy Layer", url: "/policy", icon: Shield },
  { title: "AI Governance", url: "/governance", icon: ShieldAlert },
  { title: "AI Agent", url: "/ai-agent", icon: Bot },
  { title: "Reporting", url: "/reporting", icon: BarChart3 },
];

const mediaItems = [
  { title: "Data Engine", url: "/media", icon: Newspaper },
];

const crawlItems = [
  { title: "Live Crawl Engine", url: "/crawl", icon: Activity },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings, permission: "manage_subscription" },
  { title: "Admin Portal", url: "/admin", icon: Users, permission: "invite_user" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { hasPermission } = useAuth();

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className={cn("text-sidebar-muted text-[10px] font-semibold uppercase tracking-[0.15em]", collapsed && "hidden")}>
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className={cn(collapsed && "items-center")}>
          {items.map((item) => {
            if ((item as any).permission && !hasPermission("admin:*") && !hasPermission((item as any).permission)) {
              return null;
            }
            return (
              <Collapsible key={item.title} asChild defaultOpen={location.pathname.startsWith(item.url) && (item as any).subItems !== undefined}>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive(item.url) && !(item as any).subItems} tooltip={item.title}>
                    <NavLink to={(item as any).subItems ? (item as any).subItems[0].url : item.url} end={!(item as any).subItems} activeClassName={(item as any).subItems ? "" : "bg-sidebar-accent text-sidebar-primary-foreground"} className={cn(collapsed && "justify-center")}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                  {(item as any).subItems && !collapsed && (
                    <>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="data-[state=open]:rotate-90">
                          <ChevronRight />
                          <span className="sr-only">Toggle</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {(item as any).subItems.map((subItem: any) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                <NavLink to={subItem.url}>
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
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
