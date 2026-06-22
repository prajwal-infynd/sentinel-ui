import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Key, Database, Mail, Cpu, Bot, Swords, Gavel, ShieldCheck, User, Plus, Webhook, Copy, TerminalSquare } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function Settings() {
  const [personas, setPersonas] = useState([
    { id: 1, role: "Prosecution / Investigator Persona", icon: Swords, color: "text-destructive", prompt: "You are an aggressive financial fraud investigator. Your goal is to identify maximum risk. Look for subtle correlations, mentions of subpoenas, or negative sentiment and argue for the highest possible risk score." },
    { id: 2, role: "Defense / Skeptic Persona", icon: ShieldCheck, color: "text-success", prompt: "You are a skeptical defense attorney. Your goal is to poke holes in the prosecution's argument. Look for hearsay, unverified sources, and lack of direct evidence to argue for a lower risk score." },
    { id: 3, role: "Judge / Compliance Officer Persona", icon: Gavel, color: "text-primary", prompt: "You are a strict but fair compliance officer. Read the arguments from both sides and issue a final ruling. Your ruling must balance regulatory risk with operational false-positive costs." }
  ]);

  const handleAddPersona = () => {
    setPersonas([...personas, { 
      id: Date.now(), 
      role: "New Custom Persona", 
      icon: User, 
      color: "text-foreground", 
      prompt: "Define the specific instructions and constraints for this new agent." 
    }]);
  };

  const handlePromptChange = (id: number, newPrompt: string) => {
    setPersonas(personas.map(p => p.id === id ? { ...p, prompt: newPrompt } : p));
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setPersonas(personas.map(p => p.id === id ? { ...p, role: newRole } : p));
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your platform configuration has been updated.",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight mb-1">System Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your workspace configuration and integrations</p>
        </motion.div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-5 md:w-[750px] bg-muted/50 border border-border p-1 rounded-xl shadow-inner">
            <TabsTrigger value="general" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><SettingsIcon className="h-4 w-4" /> <span className="hidden md:inline">General</span></TabsTrigger>
            <TabsTrigger value="swarm" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"><Cpu className="h-4 w-4" /> <span className="hidden md:inline font-semibold">MiroFish Engine</span></TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Bell className="h-4 w-4" /> <span className="hidden md:inline">Alerts</span></TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Shield className="h-4 w-4" /> <span className="hidden md:inline">Security</span></TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"><Key className="h-4 w-4" /> <span className="hidden md:inline">API Keys</span></TabsTrigger>
          </TabsList>

          <TabsContent value="swarm" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Swarm Sizing</CardTitle>
                    <CardDescription>Configure the number of active agents per article analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Active Agents per Scan</Label>
                        <span className="font-mono font-bold text-primary">15</span>
                      </div>
                      <Slider defaultValue={[15]} max={100} min={3} step={1} />
                      <p className="text-xs text-muted-foreground mt-2">Higher numbers increase API cost but improve consensus accuracy.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardHeader className="bg-primary/5 border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2"><Gavel className="h-4 w-4 text-primary" /> Consensus Rules</CardTitle>
                    <CardDescription>Determine how the swarm reaches a final verdict.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Required Agreement Threshold</Label>
                        <span className="font-mono font-bold text-primary">80%</span>
                      </div>
                      <Slider defaultValue={[80]} max={100} min={51} step={1} />
                      <p className="text-xs text-muted-foreground mt-2">The percentage of agents that must agree to trigger a Critical alert.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border/50 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Agent Personas</CardTitle>
                      <CardDescription>Edit the system instructions for the primary agent roles in the swarm.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddPersona} className="gap-1">
                      <Plus className="h-3.5 w-3.5" /> Add Persona
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {personas.map(persona => {
                    const IconComponent = persona.icon;
                    return (
                      <div key={persona.id} className="grid gap-3 relative group">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${persona.color}`} />
                          <Input 
                            value={persona.role} 
                            onChange={(e) => handleRoleChange(persona.id, e.target.value)} 
                            className={`font-semibold bg-transparent border-transparent hover:border-border focus-visible:ring-0 px-1 py-0 h-7 ${persona.color}`}
                          />
                        </div>
                        <Textarea 
                          value={persona.prompt} 
                          onChange={(e) => handlePromptChange(persona.id, e.target.value)} 
                          className="h-20" 
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                  <CardTitle>Workspace Configuration</CardTitle>
                  <CardDescription>Update your workspace details and regional settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid gap-3">
                    <Label className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">Workspace Name</Label>
                    <Input defaultValue="Sentinel Monitoring Workspace" className="max-w-md focus-visible:ring-primary" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">Default Jurisdiction</Label>
                    <Input defaultValue="Global / Multi-Jurisdiction" className="max-w-md focus-visible:ring-primary" />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">Data Retention Period (Days)</Label>
                    <Input type="number" defaultValue="365" className="max-w-[150px] focus-visible:ring-primary" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Routing</CardTitle>
                <CardDescription>Configure how and when high-risk alerts are delivered.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily digests of critical alerts.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Real-time Webhooks</Label>
                    <p className="text-sm text-muted-foreground">Send critical alerts directly to your internal CRM.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="grid gap-2 pt-4">
                  <Label>Webhook Payload URL</Label>
                  <Input defaultValue="https://api.internal-crm.com/webhooks/sentinel" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Control</CardTitle>
                <CardDescription>Manage authentication and platform access requirements.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all analysts in this workspace.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users after 30 minutes.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 gap-6">
              
              {/* API Keys */}
              <Card className="border-border/50 shadow-sm flex flex-col">
                <CardHeader className="bg-indigo-50/50 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2"><Key className="h-4 w-4 text-indigo-600" /> API Access Keys</CardTitle>
                  <CardDescription>Manage keys for programmatic access to the Sentinel platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 flex-1">
                  <div className="rounded-xl border border-border bg-white p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">Production Core Banking</p>
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-[10px]">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Last used: 2 minutes ago</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-indigo-600"><Copy className="h-4 w-4" /></Button>
                    </div>
                    <div className="bg-slate-50 border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                      sk_live_9f823a...<span className="blur-sm">b839c210d4</span>
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-border bg-white p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">Staging / Development</p>
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-[10px]">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Last used: 3 days ago</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-indigo-600"><Copy className="h-4 w-4" /></Button>
                    </div>
                    <div className="bg-slate-50 border rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground break-all">
                      sk_test_1847cc...<span className="blur-sm">x891ab023</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 border-t bg-muted/20">
                  <Button variant="outline" className="w-full gap-2 border-dashed bg-white"><Plus className="h-4 w-4" /> Generate New Secret Key</Button>
                </div>
              </Card>

              {/* Webhooks */}
              <Card className="border-border/50 shadow-sm flex flex-col">
                <CardHeader className="bg-indigo-50/50 border-b border-border/50 pb-4">
                  <CardTitle className="flex items-center gap-2"><Webhook className="h-4 w-4 text-indigo-600" /> Bi-Directional Webhooks</CardTitle>
                  <CardDescription>Push real-time alerts directly into your internal systems.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6 flex-1">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm border"><Webhook className="h-4 w-4 text-indigo-600" /></div>
                      <div>
                        <p className="text-sm font-bold text-indigo-950">High-Risk Alert Webhook</p>
                        <p className="text-[10px] text-indigo-600 font-mono mt-0.5">https://api.yourbank.com/v1/sentinel/webhook</p>
                      </div>
                    </div>
                    <Switch defaultChecked className="data-[state=checked]:bg-indigo-600" />
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-inner">
                    <div className="bg-slate-800/50 border-b border-slate-700/50 px-3 py-2 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-2"><TerminalSquare className="h-3 w-3" /> Recent Payload (POST)</span>
                      <span className="text-[10px] text-success">200 OK</span>
                    </div>
                    <pre className="p-4 text-[10px] font-mono text-indigo-300 overflow-x-auto">
{`{
  "event": "alert.critical_risk",
  "data": {
    "entity_id": "ent_948194",
    "name": "John Doe",
    "risk_score": 94,
    "trigger": [
      "adverse_media",
      "sanctions_fuzzy_match"
    ],
    "timestamp": "2024-03-15T14:23:00Z"
  }
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

            </motion.div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
