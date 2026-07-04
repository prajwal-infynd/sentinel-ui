import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Shield, Building2, BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ManageUsers from "@/components/admin/ManageUsers";
import ManageRoles from "@/components/admin/ManageRoles";
import UserAnalytics from "@/components/admin/UserAnalytics";
import Reporting from "@/pages/Reporting";

export default function AdminPortal() {
  const { hasPermission } = useAuth();
  const isSuperAdmin = hasPermission("admin:*");
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tabFromUrl = params.get("tab") || "dashboard";
  const validTabs = ["dashboard", "users", "roles", "reporting"];
  const allTabs = isSuperAdmin ? [...validTabs, "analytics"] : validTabs;
  
  // Derive active tab directly from URL to allow external navigation to switch tabs dynamically
  const activeTab = allTabs.includes(tabFromUrl) ? tabFromUrl : "dashboard";

  const handleTabChange = (tab: string) => {
    navigate(`/admin?tab=${tab}`, { replace: true });
  };

  return (
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 flex items-center gap-3">
                <Building2 className="h-7 w-7 text-indigo-600" />
                Admin Portal
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage users, organizations, roles, and monitor platform usage.</p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="bg-slate-50 p-1 rounded-xl border border-slate-200 mb-6">
                <TabsTrigger value="dashboard" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Manage Users
                </TabsTrigger>
                {isSuperAdmin && (
                  <>
                    <TabsTrigger value="roles" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Manage Roles
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" /> User Analytics
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger value="reporting" className="rounded-lg px-5 py-2.5 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 text-slate-500 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Reporting
                </TabsTrigger>
              </TabsList>

              <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                <TabsContent value="dashboard" className="m-0">
                  <AdminDashboard />
                </TabsContent>
                <TabsContent value="users" className="m-0">
                  <ManageUsers />
                </TabsContent>
                <TabsContent value="roles" className="m-0">
                  <ManageRoles />
                </TabsContent>
                {isSuperAdmin && (
                  <TabsContent value="analytics" className="m-0">
                    <UserAnalytics />
                  </TabsContent>
                )}
                <TabsContent value="reporting" className="m-0">
                  <Reporting />
                </TabsContent>
              </motion.div>
            </Tabs>
          </motion.div>
        </div>
      </DashboardLayout>
  );
}
