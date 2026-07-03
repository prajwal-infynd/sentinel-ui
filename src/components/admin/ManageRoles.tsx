import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, Trash2, Shield, CheckCircle2, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { ROLE_PAGES, allPagePermissions } from "@/lib/permissions";

const ACTIONS = ["create", "edit", "delete"] as const;

export default function ManageRoles() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Add/Edit dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleName, setRoleName] = useState("");
  const [pagePerms, setPagePerms] = useState<Record<string, { create: boolean; edit: boolean; delete: boolean }>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingRole, setDeletingRole] = useState<any | null>(null);

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => { const { data } = await apiClient.get("/admin/roles"); return data; },
  });

  const filtered = roles.filter((r: any) =>
    !searchTerm || r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddDialog = () => {
    setEditingRole(null);
    setRoleName("");
    setPagePerms(allPagePermissions(false));
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    // Merge saved page perms with all pages (default false)
    const merged = allPagePermissions(false);
    if (role.pagePermissions) {
      for (const [page, perms] of Object.entries(role.pagePermissions)) {
        if (merged[page]) {
          merged[page] = { ...merged[page], ...(perms as any) };
        }
      }
    }
    setPagePerms(merged);
    setIsDialogOpen(true);
  };

  const togglePagePerm = (page: string, action: "create" | "edit" | "delete") => {
    setPagePerms(prev => ({
      ...prev,
      [page]: { ...prev[page], [action]: !prev[page][action] },
    }));
  };

  const handleSave = async () => {
    if (!roleName.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setIsSaving(true);
    try {
      if (editingRole) {
        await apiClient.put(`/admin/roles/${editingRole.id}`, { name: roleName, pagePermissions: pagePerms });
        toast({ title: "Role Updated", description: `"${roleName}" permissions saved.` });
      } else {
        await apiClient.post("/admin/roles", { name: roleName, pagePermissions: pagePerms });
        toast({ title: "Role Created", description: `"${roleName}" added.` });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Failed", description: err.response?.data?.message || "Error", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    try {
      await apiClient.delete(`/admin/roles/${deletingRole.id}`);
      toast({ title: "Role Deleted", description: `"${deletingRole.name}" removed.` });
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      setDeletingRole(null);
    } catch (err: any) {
      toast({ title: "Failed", description: err.response?.data?.message || "Error", variant: "destructive" });
    }
  };

  const countEnabled = (role: any) => {
    if (!role.pagePermissions) return 0;
    let count = 0;
    for (const perms of Object.values(role.pagePermissions) as any) {
      if ((perms as any).create) count++;
      if ((perms as any).edit) count++;
      if ((perms as any).delete) count++;
    }
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search roles..." className="pl-9 h-10 bg-white border-slate-200" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0" onClick={openAddDialog}>
          <Plus className="h-4 w-4" /> Add Role
        </Button>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 gap-5">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No roles found matching "{searchTerm}".</p>
        ) : filtered.map((role: any) => (
          <Card key={role.id} className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Shield className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-base text-slate-900">{role.name}</CardTitle>
                  <p className="text-xs text-slate-500">{countEnabled(role)} permission(s) enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(role)} title="Edit Role">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-red-200 text-red-500 hover:bg-red-50" onClick={() => setDeletingRole(role)} title="Delete Role">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-slate-100 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider">Page</th>
                      <th className="px-4 py-2.5 text-center font-bold uppercase tracking-wider w-24">Create</th>
                      <th className="px-4 py-2.5 text-center font-bold uppercase tracking-wider w-24">Edit</th>
                      <th className="px-4 py-2.5 text-center font-bold uppercase tracking-wider w-24">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ROLE_PAGES.map((page) => {
                      const perms = (role.pagePermissions || {})[page] || { create: false, edit: false, delete: false };
                      return (
                        <tr key={page} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 text-[13px] font-medium text-slate-700">{page}</td>
                          {(["create", "edit", "delete"] as const).map(action => (
                            <td key={action} className="px-4 py-2.5 text-center">
                              {perms[action] ? (
                                <CheckCircle2 className="h-4 w-4 text-blue-500 mx-auto" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-slate-200 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRole ? `Edit Role: ${editingRole.name}` : "Add New Role"}</DialogTitle>
            <DialogDescription>Configure page-level permissions with Create, Edit, and Delete access.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-700">Role Name</Label>
              <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Compliance Analyst" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Page Permissions</p>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase">Page</th>
                      <th className="px-4 py-3 text-center font-bold uppercase">Create</th>
                      <th className="px-4 py-3 text-center font-bold uppercase">Edit</th>
                      <th className="px-4 py-3 text-center font-bold uppercase">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ROLE_PAGES.map((page) => (
                      <tr key={page} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-[13px] font-medium text-slate-700">{page}</td>
                        {ACTIONS.map(action => (
                          <td key={action} className="px-4 py-3 text-center">
                            <Switch
                              checked={pagePerms[page]?.[action] || false}
                              onCheckedChange={() => togglePagePerm(page, action)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !roleName.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingRole ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{deletingRole?.name}"? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingRole(null)}>Cancel</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
