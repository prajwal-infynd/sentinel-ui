import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowLeft, User, Shield, Mail, Building, CheckCircle2, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";

export default function UserDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/users"); return data; },
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/organizations"); return data; },
  });

  const user = users.find((u: any) => u.id === id) || null;
  const orgName = organizations.find((o: any) => o.id === user?.organizationId)?.name || "Unknown";

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-slate-500 animate-pulse font-medium">Loading user details...</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleAction = (action: string) => {
    if (!note.trim()) {
      toast({ title: "Note Required", description: "Please add a note before taking action.", variant: "destructive" });
      return;
    }
    toast({ title: `User ${action}`, description: `${user.name} has been ${action.toLowerCase()}.` });
    setTimeout(() => navigate('/admin?tab=users'), 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin?tab=users')}>
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                {user.status === "Active" ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-50 text-slate-500">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <User className="w-4 h-4" /> {user.id}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => navigate('/admin?tab=users')}>
              Return to Users
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Key Data */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2">User Profile & Access</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Mail className="w-4 h-4" /> Email Address</p>
                      <p className="font-semibold text-slate-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Building className="w-4 h-4" /> Organization</p>
                      <p className="font-semibold text-slate-900">{orgName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Shield className="w-4 h-4" /> Assigned Role</p>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{user.role || "Standard User"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Clock className="w-4 h-4" /> Last Active</p>
                      <p className="font-semibold text-slate-900">Today, 10:45 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">Security Verification</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Email Verified</p>
                        <p className="text-xs text-slate-500">Completed on Registration</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-600">Passed</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Authenticator App Enabled</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-200 text-blue-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Workflow Actions */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Admin Action
              </h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-800 font-medium mb-1">Status Overview</p>
                  <p className="text-sm text-slate-600">Review the user's permissions and activity before changing their account status. A note is required.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Administrator Note</label>
                  <Textarea 
                    placeholder="Enter reason for activation, suspension, or approval..."
                    className="min-h-[120px] resize-none focus-visible:ring-blue-500"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <Button 
                    onClick={() => handleAction("Activated")}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6"
                  >
                    Activate / Approve User
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleAction("Suspended")}
                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold py-6"
                  >
                    Suspend User Access
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
