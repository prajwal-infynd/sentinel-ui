import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalHeader } from "@/components/GlobalHeader";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full relative bg-[#F8FAFC] overflow-hidden">
        {/* Advanced Ambient Glow (Light Mode Optimized) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-blue-400/15 to-purple-400/10 blur-[130px] animate-pulse" style={{ animationDuration: '15s' }} />
          <div className="absolute -bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-success/15 to-transparent blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
        </div>
        
        <div className="z-10 flex w-full h-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <GlobalHeader />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
