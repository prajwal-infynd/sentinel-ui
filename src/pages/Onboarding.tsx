import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Bot, CheckCircle2, AlertCircle, Clock, 
  ChevronRight, Plus, FileText 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CompanyOnboardingModal } from "@/components/CompanyOnboardingModal";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const MOCK_DATA = [
  {
    id: "APP-024",
    name: "Nova Grid Solutions Ltd",
    industry: "Clean Energy & Utility",
    applied: "Today, 14:15 PM",
    creditLimit: "£120,000",
    safetyScore: 88,
    checks: ["passed", "passed", "passed", "passed"],
    status: "Pending",
  },
  {
    id: "APP-023",
    name: "Zephyr Ocean Shipping",
    industry: "Logistics & Maritime",
    applied: "Today, 11:30 AM",
    creditLimit: "£250,000",
    safetyScore: 48,
    checks: ["passed", "passed", "pending", "passed"],
    status: "Flagged",
  },
  {
    id: "APP-022",
    name: "Titanium CyberSec Corp",
    industry: "SaaS & Security",
    applied: "Today, 09:05 AM",
    creditLimit: "£50,000",
    safetyScore: 92,
    checks: ["passed", "passed", "passed", "passed"],
    status: "Approved",
  },
  {
    id: "APP-021",
    name: "AeroDynamics Global",
    industry: "Aerospace",
    applied: "Yesterday, 16:45 PM",
    creditLimit: "£850,000",
    safetyScore: 95,
    checks: ["passed", "passed", "passed", "passed"],
    status: "Approved",
  },
  {
    id: "APP-020",
    name: "FinTech Hub Innovations",
    industry: "Financial Services",
    applied: "Yesterday, 14:20 PM",
    creditLimit: "£300,000",
    safetyScore: 68,
    checks: ["passed", "passed", "pending", "passed"],
    status: "Pending",
  },
  {
    id: "APP-019",
    name: "Nexus Supply Chain",
    industry: "Logistics",
    applied: "Yesterday, 10:15 AM",
    creditLimit: "£55,000",
    safetyScore: 35,
    checks: ["failed", "passed", "passed", "passed"],
    status: "Flagged",
  },
  {
    id: "APP-018",
    name: "Quantum BioPharma",
    industry: "Pharmaceuticals",
    applied: "Jul 05, 11:30 AM",
    creditLimit: "£1,200,000",
    safetyScore: 91,
    checks: ["passed", "passed", "passed", "passed"],
    status: "Approved",
  },
  {
    id: "APP-017",
    name: "GreenEarth Constructors",
    industry: "Real Estate & Construction",
    applied: "Jul 04, 09:00 AM",
    creditLimit: "£400,000",
    safetyScore: 72,
    checks: ["passed", "pending", "passed", "passed"],
    status: "Pending",
  }
];

export default function Onboarding() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [applications, setApplications] = useState(MOCK_DATA);

  const handleAddCompanySubmit = () => {
    if (!newCompanyName.trim()) return;
    const newCompany = {
      id: `APP-0${applications.length + 17}`,
      name: newCompanyName,
      industry: "Unknown",
      applied: "Just now",
      creditLimit: "£0",
      safetyScore: 50,
      checks: ["pending", "pending", "pending", "pending"],
      status: "Pending",
    };
    setApplications([newCompany, ...applications]);
    toast({
      title: "Company Added",
      description: `${newCompanyName} has been successfully added to onboarding.`,
    });
    setIsAddCompanyOpen(false);
    setNewCompanyName("");
  };

  const filteredData = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "All" || app.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDocumentVerification = () => {
    toast({
      title: "Coming soon",
      description: "Document verification feature is currently under development.",
    });
  };

  const handleAddToMonitor = (e: React.MouseEvent, companyName: string) => {
    e.stopPropagation();
    toast({
      title: "Added to Monitor",
      description: `${companyName} has been added to your monitoring list.`,
    });
  };

  const renderChecks = (checks: string[]) => {
    return (
      <div className="flex gap-1">
        {checks.map((check, idx) => (
          check === "passed" ? 
            <CheckCircle2 key={idx} className="w-4 h-4 text-emerald-500" /> : 
            <Clock key={idx} className="w-4 h-4 text-amber-500" />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending": return "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "Flagged": return "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      case "Approved": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400";
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400";
  };

  return (
    <DashboardLayout>
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Header section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddCompanyOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
            <Button onClick={handleDocumentVerification} variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Document Verification
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Total Applications</p>
              <div className="text-3xl font-bold">6</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Pending Review</p>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">2</div>
              <p className="text-xs text-muted-foreground mt-1">SLA: &lt; 24 hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Risk Flagged</p>
              <div className="text-3xl font-bold text-amber-500">2</div>
              <p className="text-xs text-muted-foreground mt-1">Requires manual escalation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Approved</p>
              <div className="text-3xl font-bold text-emerald-500">1</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for trading</p>
            </CardContent>
          </Card>
        </div>


        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search company or application ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {["All", "Pending (2)", "Flagged (2)", "Approved (1)", "Rejected (1)"].map((filter) => {
              const baseName = filter.split(" ")[0];
              const isActive = selectedFilter === baseName;
              return (
                <Button
                  key={filter}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(baseName)}
                  className={isActive ? "bg-pink-600 hover:bg-pink-700 text-white" : ""}
                >
                  {filter}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">App ID</th>
                  <th className="px-4 py-3 font-medium">Company Name</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Applied</th>
                  <th className="px-4 py-3 font-medium">Credit Limit</th>
                  <th className="px-4 py-3 font-medium text-center">Safety Score</th>
                  <th className="px-4 py-3 font-medium">Checks</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredData.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCompany(row.name)}
                  >
                    <td className="px-4 py-3 font-medium">{row.id}</td>
                    <td className="px-4 py-3 font-semibold">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.industry}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.applied}</td>
                    <td className="px-4 py-3 font-medium">{row.creditLimit}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold border ${getScoreColor(row.safetyScore)}`}>
                        {row.safetyScore} / 100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderChecks(row.checks)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getStatusColor(row.status)}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs gap-1"
                          onClick={(e) => handleAddToMonitor(e, row.name)}
                        >
                          <Plus className="w-3 h-3" />
                          Add to Monitor
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {selectedCompany && (
        <CompanyOnboardingModal
          isOpen={!!selectedCompany}
          onClose={() => setSelectedCompany(null)}
          companyName={selectedCompany}
        />
      )}

      {/* Add Company Dialog */}
      <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter the domain name or company name to begin the onboarding and verification process.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="company-name"
              placeholder="e.g. Acme Corp or acme.com"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCompanySubmit()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCompanySubmit} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
