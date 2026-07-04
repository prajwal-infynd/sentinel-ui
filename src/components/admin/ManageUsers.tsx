import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle2, MoreHorizontal, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/context/AuthContext";
import { ROLE_UUIDS } from "@/lib/mock-api";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const selectedOrgId = new URLSearchParams(location.search).get("org") || "all";
  const [confirmAction, setConfirmAction] = useState<{ type: "suspend" | "delete"; user: any } | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ firstName: "", lastName: "", email: "", roleId: ROLE_UUIDS.USER });
  const [isInviting, setIsInviting] = useState(false);
  const { hasPermission } = useAuth();
  const isSuperAdmin = hasPermission("admin:*");

  const { data: users = [], refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/users"); return data; },
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/organizations"); return data; },
  });

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    try {
      if (type === "delete") {
        await apiClient.delete(`/admin/users/${user.id}`);
        toast({ title: "User Deleted", description: `${user.name} has been removed.` });
      } else {
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        await apiClient.patch(`/admin/users/${user.id}/status`, { status: newStatus });
        toast({ title: "User Updated", description: `${user.name} is now ${newStatus}.` });
      }
      refetch();
    } catch {
      toast({ title: "Error", description: "Action failed.", variant: "destructive" });
    }
    setConfirmAction(null);
  };

  const handleInvite = async () => {
    if (!inviteForm.firstName || !inviteForm.email) return;
    setIsInviting(true);
    try {
      await apiClient.post("/admin/users/invite", {
        name: `${inviteForm.firstName} ${inviteForm.lastName}`.trim(),
        email: inviteForm.email,
        roleId: inviteForm.roleId,
      });
      toast({ title: "Invitation Sent", description: `Invite sent to ${inviteForm.email}.` });
      setIsInviteOpen(false);
      setInviteForm({ firstName: "", lastName: "", email: "", roleId: "3" });
      refetch();
    } catch (e: any) {
      toast({ title: "Invite Failed", description: e?.response?.data?.message || "Could not send invite.", variant: "destructive" });
    }
    setIsInviting(false);
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = !searchTerm || u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrg = selectedOrgId === "all" || String(u.organizationId) === selectedOrgId;
    return matchesSearch && matchesOrg;
  });

  const getOrgName = (orgId: string | null) => {
    if (!orgId) return "—";
    const org = organizations.find((o: any) => o.id === orgId);
    return org?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Search + Invite */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search by name or email..." className="pl-9 h-10 bg-white border-slate-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <UserPlus className="h-4 w-4" /> Invite User
          </Button>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Organization</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">No users found matching your filters.</td></tr>
                ) : filteredUsers.map((u: any) => (
                  <tr key={u.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                          {u.name?.split(" ").map((s: string) => s[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 text-[13px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5"><Badge variant="secondary" className="text-[10px] font-bold uppercase">{u.role || "User"}</Badge></td>
                    <td className="px-5 py-3.5 text-[13px] text-slate-600">{getOrgName(u.organizationId)}</td>
                    <td className="px-5 py-3.5">
                      {u.status === "Active" ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setConfirmAction({ type: "suspend", user: u })}>
                            <ShieldOff className="mr-2 h-4 w-4" /> {u.status === "Active" ? "Suspend User" : "Activate User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive font-medium" onClick={() => setConfirmAction({ type: "delete", user: u })}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
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

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete" ? "Delete User" : confirmAction?.user?.status === "Active" ? "Suspend User" : "Activate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? `Are you sure you want to permanently delete ${confirmAction?.user?.name}? This action cannot be undone.`
                : confirmAction?.user?.status === "Active"
                  ? `Are you sure you want to suspend ${confirmAction?.user?.name}? They will lose access to the platform.`
                  : `Are you sure you want to activate ${confirmAction?.user?.name}? They will regain access to the platform.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className={confirmAction?.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"}>
              {confirmAction?.type === "delete" ? "Delete" : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Invite User Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation email. The user will verify via OTP and be added to your organization.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">First Name</Label>
                <Input value={inviteForm.firstName} onChange={e => setInviteForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Last Name</Label>
                <Input value={inviteForm.lastName} onChange={e => setInviteForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Email</Label>
              <Input type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="john@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Role</Label>
              <Select value={inviteForm.roleId} onValueChange={v => setInviteForm(f => ({ ...f, roleId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLE_UUIDS.USER}>User</SelectItem>
                  <SelectItem value={ROLE_UUIDS.OWNER}>Owner</SelectItem>
                  <SelectItem value={ROLE_UUIDS.SUPER_ADMIN}>Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteForm.firstName || !inviteForm.email || isInviting} className="bg-indigo-600 hover:bg-indigo-700">
              {isInviting ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
