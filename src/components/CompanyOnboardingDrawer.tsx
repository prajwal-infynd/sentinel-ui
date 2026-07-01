import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Printer, Download, ChevronDown, ChevronRight, Globe, AlertCircle, 
  CheckCircle2, Search, FileText, Activity, ShieldAlert, FileWarning, HelpCircle
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";

interface CompanyOnboardingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export const CompanyOnboardingDrawer: React.FC<CompanyOnboardingDrawerProps> = ({
  isOpen,
  onClose,
  companyName,
}) => {
  const [activeTab, setActiveTab] = useState("Risk Analysis");
  
  // Use a hardcoded person's name as requested to match UI
  const displayName = companyName.includes("APP-") ? "Martin Pescador" : companyName;

  const radarData = [
    { subject: 'Criminal Record', A: 80, fullMark: 100 },
    { subject: 'Country', A: 40, fullMark: 100 },
    { subject: 'PEP', A: 20, fullMark: 100 },
    { subject: 'Adverse Media', A: 60, fullMark: 100 },
    { subject: 'Sanctions', A: 90, fullMark: 100 },
  ];

  const data = {
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
    }
  };

  const renderSidebar = () => (
    <div className="w-80 border-r bg-slate-50/50 p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="h-20 w-20 rounded-full bg-slate-300 flex items-center justify-center mb-3">
          <span className="text-3xl text-white font-bold">{displayName.charAt(0)}</span>
        </div>
        <Badge className="bg-red-600 hover:bg-red-700 text-white border-none absolute top-6 right-6">Match</Badge>
        <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
        
        <div className="w-full mt-6 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Entity type:</span>
            <span className="font-medium text-slate-900">Person</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Relevance:</span>
            <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">For Review</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Match Status:</span>
            <span className="font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Potential Match</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Database:</span>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
              Warnings and Regulatory Enforcement <span className="ml-1 bg-red-200 px-1.5 rounded-full text-[10px]">1</span>
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Countries:</span>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xs text-slate-400 text-center mt-4">
            Updated: Wed Jul 01 2026 12:01
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <Button variant="outline" className="w-full justify-center gap-2 bg-white">
          Print Report <Printer className="w-4 h-4" />
        </Button>
        <Button variant="outline" className="w-full justify-center gap-2 bg-white">
          Download Report <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 flex-1">
        {[
          { id: "Options", icon: Activity },
          { id: "Key Data", icon: FileText },
          { id: "Risk Analysis", icon: Activity },
          { id: "Risk Weightage", icon: ShieldAlert },
          { id: "Person AML Screening", icon: Search }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
              activeTab === item.id 
                ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100" 
                : "bg-slate-50/50 border-transparent hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className={`text-sm font-semibold ${activeTab === item.id ? 'text-slate-900' : 'text-slate-600'}`}>
                {item.id}
              </span>
            </div>
            {activeTab === item.id ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderRiskAnalysis = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Activity className="w-6 h-6 text-slate-400" />
          AML Risk Analysis
        </h3>
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
            <span className="text-sm font-semibold text-slate-600">Risk Rating</span>
            <Badge className="bg-red-600 hover:bg-red-700 text-white">High</Badge>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-sm font-semibold text-slate-600">Risk Score</span>
            <span className="text-lg font-bold text-slate-900">76</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
        <div className="w-[400px] h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Risk" dataKey="A" stroke="#ef4444" fill="#fca5a5" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <Globe className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="font-bold text-slate-900">Country Risk</h4>
              <p className="text-sm text-slate-500">Highest Risk Country is: United States</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Low</Badge>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <FileWarning className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="font-bold text-slate-900">Category Risk</h4>
              <p className="text-sm text-slate-500">Highest Risk Category is: Warnings and Regulatory Enforcement</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">High</Badge>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <ShieldAlert className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="font-bold text-slate-900">Criminal Record Risk</h4>
              <p className="text-sm text-slate-500">Highest Criminal Risk is: crime_convicted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">High</Badge>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskWeightage = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
        <CheckCircle2 className="w-6 h-6 text-slate-400" />
        Risk Scoring Weightage
      </h3>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <h4 className="font-bold text-slate-800 text-lg">Category Parameters</h4>
          </div>
          <div className="p-6 flex items-center justify-between border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3 w-1/3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-slate-700">Warnings and regulatory enforcement</span>
            </div>
            <div className="w-24">
              <Badge className="bg-red-600 text-white border-none w-full justify-center">Match</Badge>
            </div>
            <div className="flex items-center gap-8 w-1/3 justify-end text-sm">
              <div className="flex flex-col"><span className="text-slate-500">Weightage:</span><span className="font-bold">50</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Absolute Score:</span><span className="font-bold">95</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Weighted Score:</span><span className="font-bold">47.50</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <h4 className="font-bold text-slate-800 text-lg">Criminal Records Parameters</h4>
          </div>
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 w-1/3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700">Penalty</span>
            </div>
            <div className="w-24">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none w-full justify-center">No Match</Badge>
            </div>
            <div className="flex items-center gap-8 w-1/3 justify-end text-sm">
              <div className="flex flex-col"><span className="text-slate-500">Weightage:</span><span className="font-bold">20</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Absolute Score:</span><span className="font-bold">90</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Weighted Score:</span><span className="font-bold">0.00</span></div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3 w-1/3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-slate-700">Crime Convicted</span>
            </div>
            <div className="w-24">
              <Badge className="bg-red-600 text-white border-none w-full justify-center">Match</Badge>
            </div>
            <div className="flex items-center gap-8 w-1/3 justify-end text-sm">
              <div className="flex flex-col"><span className="text-slate-500">Weightage:</span><span className="font-bold">20</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Absolute Score:</span><span className="font-bold">100</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Weighted Score:</span><span className="font-bold">20.00</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <h4 className="font-bold text-slate-800 text-lg">Country Parameters</h4>
          </div>
          <div className="p-6 flex items-center justify-between border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-3 w-1/3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-slate-700">United States</span>
            </div>
            <div className="w-24">
              <Badge className="bg-red-600 text-white border-none w-full justify-center">Match</Badge>
            </div>
            <div className="flex items-center gap-8 w-1/3 justify-end text-sm">
              <div className="flex flex-col"><span className="text-slate-500">Weightage:</span><span className="font-bold">30</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Absolute Score:</span><span className="font-bold">25.22</span></div>
              <div className="flex flex-col"><span className="text-slate-500">Weighted Score:</span><span className="font-bold">7.57</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonAMLScreening = () => (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Search className="w-6 h-6 text-slate-400" />
          AML Screening Result
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" /> Search Database</Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3 items-center">
                <Badge className="bg-red-600 hover:bg-red-700">High Risk</Badge>
                <span className="text-emerald-600 font-semibold text-sm">100% Match</span>
              </div>
              <Switch checked={true} />
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="font-bold text-slate-900">Martin Pescador</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Relevance</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">For Review</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Countries</p>
                <Globe className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">DOB</p>
                <p className="font-bold text-slate-900">Not Available</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Entity Type</p>
                <p className="font-bold text-slate-900">Person</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Match Status</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Potential Match</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Database</p>
                <Badge className="bg-slate-500 text-white">Adverse Media</Badge>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-bold text-slate-700">Sanction Details</span>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative opacity-75 hover:opacity-100 transition-opacity">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-3 items-center">
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Low Risk</Badge>
                <span className="text-emerald-600 font-semibold text-sm">100% Match</span>
              </div>
              <Switch checked={false} />
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <p className="text-xs text-slate-500 mb-1">Name</p>
                <p className="font-bold text-slate-900">kingfisher</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Relevance</p>
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">For Review</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Countries</p>
                <p className="font-bold text-slate-900">-</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">DOB</p>
                <p className="font-bold text-slate-900">Not Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyData = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
        <FileText className="w-6 h-6 text-slate-400" />
        Key Corporate Data
      </h3>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-lg">Corporate Registry Details</h4>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Registration Number</p>
            <p className="font-semibold text-slate-900">{data.registry.registrationNumber}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Incorporation Date</p>
            <p className="font-semibold text-slate-900">{data.registry.incorporationDate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Jurisdiction</p>
            <p className="font-semibold text-slate-900">{data.registry.jurisdiction}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Company Type</p>
            <p className="font-semibold text-slate-900">{data.registry.companyType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Status</p>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">{data.registry.status}</Badge>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Registered Address</p>
            <p className="font-semibold text-slate-900">{data.registry.registeredAddress}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-lg">Key Personnel</h4>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h5 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Directors & Officers</h5>
            <div className="space-y-3">
              {data.personnel.directors.map((d, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{d.name}</span>
                    <span className="text-xs text-slate-500">Appointed: {d.appointed}</span>
                  </div>
                  <Badge variant="outline" className="bg-white">{d.role}</Badge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">Major Shareholders</h5>
            <div className="space-y-3">
              {data.personnel.shareholders.map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${s.percentage}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{s.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[95vw] sm:max-w-[1200px] p-0 flex flex-row gap-0 bg-[#F8FAFC] border-l border-slate-200"
      >
        {renderSidebar()}
        
        <ScrollArea className="flex-1 h-full">
          <div className="p-10 min-h-full">
            {activeTab === "Risk Analysis" && renderRiskAnalysis()}
            {activeTab === "Risk Weightage" && renderRiskWeightage()}
            {activeTab === "Person AML Screening" && renderPersonAMLScreening()}
            {activeTab === "Key Data" && renderKeyData()}
            {/* Fallback for other tabs */}
            {!["Risk Analysis", "Risk Weightage", "Person AML Screening", "Key Data"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-[500px] text-slate-400">
                <HelpCircle className="w-16 h-16 mb-4 opacity-20" />
                <p>Content for {activeTab} is not available in this mockup.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
