import { Search, Bell, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function GlobalHeader() {

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search entities, alerts, cases..." className="w-80 pl-9 h-9 bg-muted/50 border-0" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="hidden sm:flex gap-1.5 font-mono text-xs px-2.5 py-1 border-primary/30 text-primary">
          <Activity className="h-3 w-3" />
          Cloud
        </Badge>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground hidden sm:flex">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Monitoring Workspace</span>
        </div>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">3</span>
        </Button>
        <button
          type="button"
          className="flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground"
        >
          US
        </button>
      </div>
    </header>
  );
}
