import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <Outlet />
    </SidebarProvider>
  );
}
