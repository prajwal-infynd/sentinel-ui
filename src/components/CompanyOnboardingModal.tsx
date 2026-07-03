import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, FileText, CheckCircle2, Building, 
  MapPin, Calendar, Briefcase, Users, AlertCircle 
} from "lucide-react";

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({
  isOpen,
  onClose,
  companyName,
}) => {
  // Mock unified data
  const data = {
    riskScore: "LOW",
    recommendation: "APPROVE",
    aml: {
      sanctions: { status: "passed", listsChecked: ["OFAC", "UN", "EU", "HMT"] },
      adverseMedia: { status: "passed", sourcesScanned: 15420 },
      pep: { status: "passed", individualsChecked: 4 }
    },
    registry: {
      registrationNumber: `CRN-${Math.floor(Math.random() * 10000000)}`,
      incorporationDate: "2018-05-12",
      jurisdiction: "United Kingdom",
      companyType: "Private Limited Company",
      status: "Active",
      registeredAddress: "123 Business Road, London, UK, EC1A 1BB"
    },
    personnel: {
      directors: [
        { name: "John Doe", role: "Director", appointed: "2018-05-12" },
        { name: "Jane Smith", role: "Secretary", appointed: "2019-11-01" }
      ],
      shareholders: [
        { name: "Global Holdings LLC", percentage: 60 },
        { name: "John Doe", percentage: 40 }
      ]
    },
    filings: [
      { documentType: "Annual Return (Confirmation Statement)", filingDate: "2023-05-15", status: "Filed" },
      { documentType: "Micro entity accounts", filingDate: "2023-02-28", status: "Filed" },
      { documentType: "Appointment of Director", filingDate: "2019-11-01", status: "Filed" }
    ]
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "passed") {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</Badge>;
    }
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1"><AlertCircle className="w-3 h-3" /> Warning</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-slate-50">
        <DialogHeader className="px-6 py-4 bg-white border-b sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2 text-slate-900">
                <Building className="w-6 h-6 text-primary" />
                {companyName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Unified Verification Report (AML & Corporate Registry)
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Risk Level</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 uppercase mt-1">
                  {data.riskScore}
                </Badge>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Decision</span>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase mt-1">
                  {data.recommendation}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            
            {/* Corporate Registry Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Corporate Registry Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Registration Number</p>
                  <p className="text-sm font-semibold text-slate-900">{data.registry.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Status</p>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">{data.registry.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Incorporation Date</p>
                  <p className="text-sm font-semibold text-slate-900">{data.registry.incorporationDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Company Type</p>
                  <p className="text-sm font-semibold text-slate-900">{data.registry.companyType}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Registered Address</p>
                  <p className="text-sm font-semibold text-slate-900">{data.registry.registeredAddress}</p>
                </div>
              </CardContent>
            </Card>

            {/* AML Screening Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <Shield className="w-4 h-4 text-slate-500" />
                  AML & Compliance Screening
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Sanctions Screening</h4>
                      <p className="text-xs text-slate-500 mt-1">Checked against {data.aml.sanctions.listsChecked.join(", ")}</p>
                    </div>
                    <StatusBadge status={data.aml.sanctions.status} />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50/30">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Adverse Media</h4>
                      <p className="text-xs text-slate-500 mt-1">{data.aml.adverseMedia.sourcesScanned.toLocaleString()} global news sources scanned</p>
                    </div>
                    <StatusBadge status={data.aml.adverseMedia.status} />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">PEP (Politically Exposed Persons)</h4>
                      <p className="text-xs text-slate-500 mt-1">{data.aml.pep.individualsChecked} key individuals screened</p>
                    </div>
                    <StatusBadge status={data.aml.pep.status} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Personnel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Directors */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                    Directors & Officers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {data.personnel.directors.map((dir, i) => (
                      <li key={i} className="flex justify-between items-center p-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{dir.name}</p>
                          <p className="text-xs text-slate-500">{dir.role}</p>
                        </div>
                        <span className="text-xs text-slate-400">Appointed: {dir.appointed}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Shareholders */}
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                    <Users className="w-4 h-4 text-slate-500" />
                    Major Shareholders
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {data.personnel.shareholders.map((sh, i) => (
                      <li key={i} className="flex justify-between items-center p-3">
                        <p className="text-sm font-bold text-slate-900">{sh.name}</p>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">{sh.percentage}%</Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Company Filings Section */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Recent Company Filings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {data.filings.map((filing, i) => (
                    <li key={i} className="flex justify-between items-center p-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{filing.documentType}</p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/> Filed on {filing.filingDate}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        {filing.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

