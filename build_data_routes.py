import os

# 1. Update AppSidebar.tsx
with open("src/components/AppSidebar.tsx", "r", encoding="utf-8") as f:
    sidebar_content = f.read()

# Add Collapsible and ChevronRight imports if they don't exist
if "Collapsible" not in sidebar_content:
    sidebar_content = sidebar_content.replace(
        'import {',
        'import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";\nimport { ChevronRight } from "lucide-react";\nimport {'
    )
if "SidebarMenuSub" not in sidebar_content:
    sidebar_content = sidebar_content.replace(
        'SidebarMenuButton, SidebarMenuItem,',
        'SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuAction,'
    )

# Update platformItems to include subItems
platformItems_old = """const platformItems = [
  { title: "AI Agents", url: "/agents", icon: Bot },
  { title: "Data Sources", url: "/architecture", icon: Database },
  { title: "Policy Layer", url: "/policy", icon: Shield },
  { title: "Reporting", url: "/reporting", icon: BarChart3 },
];"""

platformItems_new = """const platformItems = [
  { title: "AI Agents", url: "/agents", icon: Bot },
  { 
    title: "Data Sources", 
    url: "/architecture", 
    icon: Database,
    subItems: [
      { title: "External Data", url: "/architecture/external" },
      { title: "Custom Data", url: "/architecture/custom" },
      { title: "Infynd Data", url: "/architecture/infynd" },
    ]
  },
  { title: "Policy Layer", url: "/policy", icon: Shield },
  { title: "Reporting", url: "/reporting", icon: BarChart3 },
];"""

sidebar_content = sidebar_content.replace(platformItems_old, platformItems_new)

# Update renderGroup
renderGroup_old = """          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                <NavLink to={item.url} end activeClassName="bg-sidebar-accent text-sidebar-primary-foreground" className={cn(collapsed && "justify-center")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}"""

renderGroup_new = """          {items.map((item) => (
            <Collapsible key={item.title} asChild defaultOpen={location.pathname.startsWith(item.url) && item.subItems !== undefined}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(item.url) && !item.subItems} tooltip={item.title}>
                  <NavLink to={item.subItems ? item.subItems[0].url : item.url} end={!item.subItems} activeClassName={item.subItems ? "" : "bg-sidebar-accent text-sidebar-primary-foreground"} className={cn(collapsed && "justify-center")}>
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
                {item.subItems && !collapsed && (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
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
          ))}"""

sidebar_content = sidebar_content.replace(renderGroup_old, renderGroup_new)

with open("src/components/AppSidebar.tsx", "w", encoding="utf-8") as f:
    f.write(sidebar_content)


# 2. Generate pages
os.makedirs("src/pages/data", exist_ok=True)

# Generate ExternalData.tsx
external_data = """import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, FileSpreadsheet, UploadCloud, Server, Key, Plus, File, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export const ExternalData = () => {
  const { toast } = useToast();
  
  const mockFiles = [
    { name: "Historical_SAR_Filings_2023.csv", type: "csv-excel", size: "12.4 MB", date: "2 days ago", status: "Indexed" },
    { name: "Global_Sanctions_List_Update.pdf", type: "pdf", size: "4.1 MB", date: "5 days ago", status: "Indexed" },
    { name: "Internal_Compliance_Policy_v4.docx", type: "docs", size: "1.2 MB", date: "1 week ago", status: "Indexed" },
    { name: "Transaction_Logs_Q3.csv", type: "csv-excel", size: "45.8 MB", date: "1 week ago", status: "Indexed" }
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">External Data</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your uploaded historical records, policies, and API connections.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Universal Drag and Drop */}
          <div className="border-2 border-dashed border-indigo-200/60 rounded-[2rem] bg-indigo-50/30 p-10 flex flex-col items-center justify-center hover:bg-indigo-50/60 hover:border-indigo-400 transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[320px]">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.csv,.xlsx,.txt" onChange={(e) => e.target.files && toast({ title: "Upload Started", description: `File ${e.target.files[0].name} is being ingested.` })} />
            <div className="h-20 w-20 rounded-2xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform duration-300 relative">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl animate-ping opacity-0 group-hover:opacity-100 duration-1000" />
              <UploadCloud className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-3 text-slate-900">Drag & Drop Documents</h3>
            <p className="text-muted-foreground text-sm max-w-md text-center mb-6">
              Upload policies, historical cases, or CSV exports. The AI will instantly embed them into its neural search graph.
            </p>
            <div className="flex gap-3">
              <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-red-500" /> PDF</Badge>
              <Badge variant="outline" className="bg-white"><FileText className="h-3 w-3 mr-1 text-blue-500" /> DOCX</Badge>
              <Badge variant="outline" className="bg-white"><FileSpreadsheet className="h-3 w-3 mr-1 text-emerald-500" /> CSV</Badge>
            </div>
          </div>

          {/* API Connect */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">API Integrations</h3>
            <p className="text-muted-foreground text-sm">Connect internal systems directly to the data architecture.</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shadow-sm bg-white text-slate-700 w-fit">
                  <Server className="h-4 w-4" /> Connect New API
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect Internal API</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Name</label>
                    <Input placeholder="e.g. Core Banking System" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endpoint URL</label>
                    <Input placeholder="https://api.internal-bank.com/v1/customers" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Auth Token</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="sk_live_..." className="pl-9" />
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" onClick={() => toast({ title: "Stream Connected", description: "API data source has been connected." })}>Connect Data Stream</Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="mt-4 rounded-xl border bg-white shadow-sm p-4 flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                   <Server className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div>
                   <h4 className="font-semibold text-sm text-slate-900">Core Banking DB</h4>
                   <p className="text-xs text-muted-foreground">Connected • Synced 2m ago</p>
                 </div>
               </div>
               <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Active</Badge>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6">Indexed Files</h3>
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">File Name</th>
                  <th className="px-6 py-4 font-medium">Size</th>
                  <th className="px-6 py-4 font-medium">Date Added</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockFiles.map((file, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                      <File className="h-4 w-4 text-indigo-500" />
                      {file.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{file.size}</td>
                    <td className="px-6 py-4 text-muted-foreground">{file.date}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{file.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default ExternalData;
"""

with open("src/pages/data/ExternalData.tsx", "w", encoding="utf-8") as f:
    f.write(external_data)

# Generate CustomData.tsx
custom_data = """import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Crown } from 'lucide-react';
import { InFyndLogo } from '@/components/InFyndLogo';

export const CustomData = () => {
  const { toast } = useToast();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Request Custom Data</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Our intelligence team builds custom datasets tailored to your precise use case.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200 mt-8 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-rose-500 to-indigo-600 opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
          
          <div className="bg-gradient-to-b from-slate-50 to-white px-8 py-10 border-b border-slate-100 flex flex-col items-center text-center relative z-10">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none" />
            
            <div className="h-16 w-16 bg-gradient-to-br from-amber-400/20 to-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.2)] mb-6">
              <Crown className="h-8 w-8 text-amber-500 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Can't find the dataset you need?</h2>
            <p className="text-base text-slate-500 leading-relaxed max-w-lg">
              We know the feeling. The <InFyndLogo className="text-base text-slate-700 mx-0.5" /> data intelligence team will scout, compile, and build a bespoke dataset exclusively for you.
            </p>
          </div>
          
          <div className="px-8 py-8 bg-white space-y-6 relative z-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Entity or Industry Description</label>
              <Textarea 
                placeholder="e.g. 'I need a comprehensive list of high-risk fintech startups in Southeast Asia with regulatory fines in the last 5 years...'" 
                className="resize-none h-32 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-400 text-base"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Email</label>
              <Input 
                placeholder="you@company.com" 
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 placeholder:text-slate-400 h-12 text-base"
              />
            </div>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-xl h-14 text-lg font-semibold transition-all group-hover:shadow-[0_0_30px_rgba(0,0,0,0.1)]" 
              onClick={() => toast({ title: "Request Submitted to InFynd", description: "Our intelligence team will review your request and reach out within 24 hours." })}
            >
              Submit Intelligence Request
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default CustomData;
"""

with open("src/pages/data/CustomData.tsx", "w", encoding="utf-8") as f:
    f.write(custom_data)


# Generate InfyndData.tsx
infynd_data = """import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { Database, Search, Download, RefreshCw, FileText, FileSpreadsheet, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type EntityRecord = {
  id: string;
  entity: string;
  sourceType: 'pdf' | 'csv-excel' | 'docs' | 'api';
  sourceName: string;
  confidence: number;
  contextSnippet: string;
  timestamp: Date;
};

const initialRecords: EntityRecord[] = [
  { id: "1", entity: "Oleg Deripaska", sourceType: "pdf", sourceName: "Global_Sanctions_List_Update.pdf", confidence: 99, contextSnippet: "...added to the OFAC SDN list under executive order...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "2", entity: "Mirage Financial Corp", sourceType: "csv-excel", sourceName: "Historical_SAR_Filings_2023.csv", confidence: 94, contextSnippet: "Multiple structuring events reported by teller 04...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) },
  { id: "3", entity: "John Doe", sourceType: "api", sourceName: "Core Banking API", confidence: 88, contextSnippet: "Account 4091929 flagged for velocity limits...", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "4", entity: "Nexus Shell LLC", sourceType: "docs", sourceName: "Internal_Compliance_Policy_v4.docx", confidence: 91, contextSnippet: "Refer to section 4.1 regarding entities like Nexus Shell...", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) },
];

export const InfyndData = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [unifiedRecords, setUnifiedRecords] = useState<EntityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUnifiedRecords(initialRecords);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'csv-excel': return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />;
      case 'docs': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'api': return <Server className="h-4 w-4 text-amber-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">InFynd Data Index</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Explore the Unified Master Data Index compiled from all ingested sources.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-2xl border border-border/50 bg-white shadow-sm overflow-hidden flex flex-col relative">
            <div className="p-4 border-b bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600" />
                  Unified Master Data Index
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Every extracted entity and record across all APIs and file uploads, merged under one roof.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search entities or sources..." 
                    className="pl-9 bg-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-lg">
                  <Switch 
                    id="live-sync" 
                    defaultChecked 
                    onCheckedChange={(checked) => toast({ 
                      title: checked ? "Live Sync Enabled" : "Live Sync Paused", 
                      description: checked ? "The Master Data Index is now actively syncing." : "Real-time syncing has been paused." 
                    })} 
                  />
                  <label htmlFor="live-sync" className="text-sm font-medium text-slate-700 flex items-center gap-1.5 cursor-pointer">
                    Live Sync
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </label>
                </div>

                <Button variant="outline" className="gap-2 bg-white hover:bg-slate-50 text-slate-700 border-slate-200" onClick={() => toast({ title: "Export Started", description: "Downloading unified index as CSV..." })}>
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Extracted Entity</th>
                    <th className="px-6 py-4 font-medium">Context / Snippet</th>
                    <th className="px-6 py-4 font-medium">Source</th>
                    <th className="px-6 py-4 font-medium text-right">Confidence</th>
                    <th className="px-6 py-4 font-medium text-right">Ingested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-5 w-5 animate-spin text-indigo-500" />
                          Loading Master Index...
                        </div>
                      </td>
                    </tr>
                  ) : unifiedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No records found.</td>
                    </tr>
                  ) : (
                    unifiedRecords
                      .filter(r => 
                        r.entity.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.sourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.contextSnippet.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(record => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                          {record.entity}
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                          {record.contextSnippet}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getIcon(record.sourceType)}
                            <span className="font-mono text-xs">{record.sourceName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge variant="outline" className={record.confidence > 90 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                            {record.confidence}%
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(record.timestamp)} ago
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default InfyndData;
"""

with open("src/pages/data/InfyndData.tsx", "w", encoding="utf-8") as f:
    f.write(infynd_data)

# 3. Update App.tsx
with open("src/App.tsx", "r", encoding="utf-8") as f:
    app_content = f.read()

if "import ExternalData" not in app_content:
    app_content = app_content.replace(
        'import DataArchitecture from "@/pages/DataArchitecture";',
        'import ExternalData from "@/pages/data/ExternalData";\nimport CustomData from "@/pages/data/CustomData";\nimport InfyndData from "@/pages/data/InfyndData";'
    )
    # Remove old DataArchitecture route if exists, and add the new routes
    app_content = app_content.replace(
        '<Route path="/architecture" element={<DataArchitecture />} />',
        '<Route path="/architecture" element={<Navigate to="/architecture/external" replace />} />\n            <Route path="/architecture/external" element={<ExternalData />} />\n            <Route path="/architecture/custom" element={<CustomData />} />\n            <Route path="/architecture/infynd" element={<InfyndData />} />'
    )

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(app_content)

print("Created data routes and updated AppSidebar")
