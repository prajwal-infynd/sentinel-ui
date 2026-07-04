import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  Printer, Download, ChevronDown, Globe, AlertCircle, 
  CheckCircle2, FileText, Activity, ShieldAlert, FileWarning, HelpCircle, Database,
  ArrowLeft, FileCheck, Home, Fingerprint, MapPin, Smartphone, UserCheck, Info, MessageSquare, Check, X, Plus, Clock, Shield, ArrowRight, Server
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";

export default function CompanyOnboardingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("Key Data");
  const [activeDocTab, setActiveDocTab] = useState("Identity ID");
  const [showCountryRisk, setShowCountryRisk] = useState(false);
  const [showCategoryRisk, setShowCategoryRisk] = useState(false);
  const [showCriminalRisk, setShowCriminalRisk] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [comments, setComments] = useState<{author: string, note: string, date: string, status: string}[]>([]);
  
  // Using a mock name based on ID
  const displayName = "Nova Grid Solutions Ltd"; // In a real app, fetch based on ID
  const personName = "John Doe";

  const radarData = [
    { subject: 'Criminal Record', A: 80, fullMark: 100 },
    { subject: 'Country', A: 40, fullMark: 100 },
    { subject: 'PEP', A: 20, fullMark: 100 },
    { subject: 'Adverse Media', A: 60, fullMark: 100 },
    { subject: 'Sanctions', A: 90, fullMark: 100 },
  ];

  const data = {
    registry: {
      registrationNumber: `CRN-12345678`,
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

  const docTabs = [
    { id: "Identity ID", icon: FileCheck, description: "National ID, Passport, or Driving License" },
    { id: "Proof of Address", icon: Home, description: "Utility bill or bank statement" },
    { id: "Biometric Verification", icon: Fingerprint, description: "Face match with ID" },
    { id: "Location Intelligence", icon: MapPin, description: "Verify user's claimed location" },
    { id: "Device Check", icon: Smartphone, description: "Identify potential fraud/proxies" },
    { id: "AML Screenings", icon: ShieldAlert, description: "Screening on provided ID full name" }
  ];

  const handleApprove = () => {
    if (!reviewNote.trim()) {
      toast({ title: "Note Required", description: "Please add a note before approving.", variant: "destructive" });
      return;
    }
    setComments([{author: "Current User", note: reviewNote, date: new Date().toLocaleString(), status: "Approved"}, ...comments]);
    setReviewNote("");
    toast({ title: "Application Approved", description: "The company has been approved successfully." });
    setTimeout(() => navigate('/onboarding'), 1500);
  };

  const handleReject = () => {
    if (!reviewNote.trim()) {
      toast({ title: "Note Required", description: "Please add a note before rejecting.", variant: "destructive" });
      return;
    }
    setComments([{author: "Current User", note: reviewNote, date: new Date().toLocaleString(), status: "Rejected"}, ...comments]);
    setReviewNote("");
    toast({ title: "Application Rejected", description: "The company has been rejected." });
    setTimeout(() => navigate('/onboarding'), 1500);
  };

  const handleAddToMonitor = () => {
    try {
      const existingStr = localStorage.getItem('sentinel_portfolio_rows');
      const existingRows = existingStr ? JSON.parse(existingStr) : [];
      
      if (!existingRows.some((r: any) => r.name === displayName)) {
        existingRows.push({
          name: displayName,
          entityType: "company",
          riskScore: 76,
          jurisdiction: data.registry.jurisdiction,
          identifiers: {
            sector: "Unknown",
          }
        });
        localStorage.setItem('sentinel_portfolio_rows', JSON.stringify(existingRows));
      }
      
      toast({
        title: "Added to Monitor",
        description: `${displayName} has been added to your monitoring list.`,
      });
      navigate("/monitor/companies");
    } catch (err) {
      console.error(err);
    }
  };

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
        {/* Country Risk */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowCountryRisk(!showCountryRisk)}>
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-slate-400" />
              <div>
                <h4 className="font-bold text-slate-900">Country Risk</h4>
                <p className="text-sm text-slate-500">Highest Risk Country is: United States</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Low</Badge>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCountryRisk ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {showCountryRisk && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
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
          )}
        </div>

        {/* Category Risk */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowCategoryRisk(!showCategoryRisk)}>
            <div className="flex items-center gap-4">
              <FileWarning className="w-5 h-5 text-slate-400" />
              <div>
                <h4 className="font-bold text-slate-900">Category Risk</h4>
                <p className="text-sm text-slate-500">Highest Risk Category is: Warnings and Regulatory Enforcement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">High</Badge>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCategoryRisk ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {showCategoryRisk && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
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
          )}
        </div>

        {/* Criminal Record Risk */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all">
          <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setShowCriminalRisk(!showCriminalRisk)}>
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-5 h-5 text-slate-400" />
              <div>
                <h4 className="font-bold text-slate-900">Criminal Record Risk</h4>
                <p className="text-sm text-slate-500">Highest Criminal Risk is: crime_convicted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">High</Badge>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showCriminalRisk ? 'rotate-180' : ''}`} />
            </div>
          </div>
          {showCriminalRisk && (
            <div className="p-0 border-t border-slate-100 bg-slate-50/50">
               <div className="p-6 flex items-center justify-between">
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
          )}
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

  const renderDomainIntelligence = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
        <Globe className="w-6 h-6 text-slate-400" />
        Domain Intelligence
      </h3>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h4 className="font-bold text-slate-800 text-lg">Domain Details</h4>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-500 mb-1">Domain Name</p>
            <p className="font-semibold text-slate-900">novagrid.com</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Creation Date</p>
            <p className="font-semibold text-slate-900">2010-08-15</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Registrar</p>
            <p className="font-semibold text-slate-900">GoDaddy.com, LLC</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Domain Status</p>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Active</Badge>
          </div>
          <div>
            <p className="text-slate-500 mb-1">SSL Certificate</p>
            <p className="font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Valid</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Malware/Phishing Check</p>
            <p className="font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Clean</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearchedDatabases = () => {
    const databases = [
      "UNSCR Sanctions List", "US OFAC Consolidated List",
      "EU Sanctions List", "UK Bank of England Sanctions list",
      "Interpol Red Notices", "UK Most Wanted"
    ];

    return (
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            <Database className="w-6 h-6 text-slate-400" />
            Searched Databases
          </h3>
          <span className="text-sm text-slate-500 font-medium">{databases.length} Databases Searched</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {databases.map((db, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all hover:border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="font-medium text-slate-700">{db}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDocumentVerification = () => {
    const renderIdentityId = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" /> Extracted Details
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Document Type</span><span className="font-semibold text-slate-900">National ID</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Document Number</span><span className="font-semibold text-slate-900">ID-987654321</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Full Name</span><span className="font-semibold text-slate-900">{personName}</span></div>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none mb-4"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified Authentic</Badge>
            <div className="w-full h-32 bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
               <span className="text-slate-500 font-medium">Front of ID Document</span>
            </div>
          </div>
        </div>
      </div>
    );

    const renderDeviceCheck = () => (
      <div className="space-y-6">
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h4 className="font-bold text-slate-800">Fraud Indicators</h4>
             <Badge className="bg-emerald-100 text-emerald-700 border-none">Clean Device</Badge>
           </div>
           <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between items-center p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
                <span className="text-slate-600 font-medium">Emulator Detected</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex justify-between items-center p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
                <span className="text-slate-600 font-medium">VPN / Proxy Usage</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
           </div>
         </div>
      </div>
    );

    return (
      <div className="max-w-6xl flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-64 space-y-2 flex-shrink-0">
          {docTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveDocTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
                activeDocTab === item.id 
                  ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100" 
                  : "bg-transparent border-transparent hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${activeDocTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${activeDocTab === item.id ? 'text-slate-900' : 'text-slate-600'}`}>
                  {item.id}
                </span>
              </div>
            </button>
          ))}
        </div>
        <div className="flex-1">
           {activeDocTab === "Identity ID" && renderIdentityId()}
           {activeDocTab === "Device Check" && renderDeviceCheck()}
           {!["Identity ID", "Device Check"].includes(activeDocTab) && (
             <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border border-slate-200">
                <Info className="w-12 h-12 text-slate-300 mb-2" />
                <h4 className="font-bold text-slate-700">Verification Pending</h4>
                <p className="text-slate-500 text-sm max-w-sm text-center mb-6">User has not completed this verification step yet.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderNotesAndComments = () => {
    const auditTimeline = [
      { 
        auditId: "AUD-10023",
        time: "09:00:12", 
        date: "2026-07-04",
        action: "Company Profile Created", 
        entityType: "Company",
        entityId: "CMP-9982",
        performedBy: "System Integration", 
        role: "System API",
        ip: "192.168.1.1 (Internal)",
        source: "API",
        changes: null,
        comments: null
      },
      { 
        auditId: "AUD-10024",
        time: "09:05:44", 
        date: "2026-07-04",
        action: "Document Uploaded", 
        entityType: "Document",
        entityId: "DOC-5511",
        performedBy: "john.doe@novagrid.com", 
        role: "Client User",
        ip: "45.22.11.90 (UK)",
        source: "Client Portal",
        changes: [
          { field: "File Name", old: "-", new: "Certificate_of_Inc.pdf" }
        ],
        comments: null
      },
      { 
        auditId: "AUD-10025",
        time: "09:13:02", 
        date: "2026-07-04",
        action: "Risk Score Calculated", 
        entityType: "Risk Assessment",
        entityId: "RSK-882",
        performedBy: "Risk Engine v2", 
        role: "System Component",
        ip: "-",
        source: "Batch Process",
        changes: [
          { field: "Risk Score", old: "Unscored", new: "Medium (76)" },
          { field: "Sanctions Match", old: "Unknown", new: "False Positive" }
        ],
        comments: null
      },
      { 
        auditId: "AUD-10026",
        time: "09:22:15", 
        date: "2026-07-04",
        action: "Investigation Note Added", 
        entityType: "Case Management",
        entityId: "CAS-102",
        performedBy: "Sarah Jenkins", 
        role: "Compliance Analyst",
        ip: "10.0.0.45 (VPN)",
        source: "Admin Portal",
        changes: null,
        comments: "Reviewed sanctions match; confirmed as false positive. Requested additional proof of address."
      },
      { 
        auditId: "AUD-10027",
        time: "11:45:00", 
        date: "2026-07-04",
        action: "Company Approved", 
        entityType: "Approvals",
        entityId: "APP-5991",
        performedBy: "Michael Ross", 
        role: "Compliance Manager",
        ip: "10.0.0.22 (VPN)",
        source: "Admin Portal",
        changes: [
          { field: "Status", old: "Pending Review", new: "Approved" }
        ],
        comments: null
      }
    ];

    return (
      <div className="max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-8">
          <MessageSquare className="w-6 h-6 text-slate-400" />
          Notes, Comments & Audit Trail
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Summary and Notes */}
          <div className="space-y-8">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 text-lg">Application Summary</h4>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Company Name</p>
                  <p className="font-semibold text-slate-900">{displayName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">AML Risk Score</p>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    76 / 100 <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">High Risk</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Document Verification</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-600 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Identity ID Verified</p>
                    <p className="font-semibold text-emerald-600 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Device Clean</p>
                    <p className="font-semibold text-amber-500 flex items-center gap-1 text-xs"><Info className="w-3 h-3" /> Address Pending</p>
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Databases Screened</p>
                  <p className="font-semibold text-slate-900">6 Databases</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Key Personnel</p>
                  <p className="font-semibold text-slate-900">2 Directors, 2 Shareholders</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Jurisdiction</p>
                  <p className="font-semibold text-slate-900">{data.registry.jurisdiction}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Domain Intelligence</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-600 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Active Domain</p>
                    <p className="font-semibold text-emerald-600 flex items-center gap-1 text-xs"><CheckCircle2 className="w-3 h-3" /> Clean Malware Check</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea 
                placeholder="Add your notes for approving or rejecting..." 
                className="min-h-[120px] resize-none"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Use the Approve/Reject buttons in the top header after submitting your notes.</p>
                <Button 
                  onClick={() => toast({ title: "Note Submitted", description: "Your investigation note has been logged to the audit trail." })}
                  className="bg-indigo-600 hover:bg-indigo-700 h-8 px-4 text-xs font-semibold"
                >
                  Submit Note
                </Button>
              </div>
            </div>

            {comments.length > 0 && (
              <div className="mt-8 space-y-4">
                <h4 className="font-bold text-slate-700">Previous Comments</h4>
                {comments.map((comment, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">{comment.author}</span>
                      <span className="text-xs text-slate-500">{comment.date}</span>
                    </div>
                    <p className="text-slate-700 text-sm">{comment.note}</p>
                    <div>
                      <Badge className={comment.status === "Approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
                        {comment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Audit Trail */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[800px]">
            <h4 className="font-bold text-slate-800 mb-6 text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Structured Event Audit Trail
            </h4>
            <div className="flex-1 overflow-y-auto pr-4 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
              {auditTimeline.map((log, idx) => (
                <div key={idx} className="relative flex items-start gap-6">
                  <div className="bg-white border-2 border-indigo-100 w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm mt-0.5">
                    {log.role.includes("System") ? <Server className="w-4 h-4 text-indigo-500" /> : <Shield className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Header: Event Name & Timestamp */}
                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 block text-[15px]">{log.action}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="bg-white text-xs font-semibold text-slate-700 border-slate-300">
                            {log.performedBy}
                          </Badge>
                          <span className="text-xs text-slate-500 font-medium">{log.role}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-600 block">{log.date}</span>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                          <Clock className="w-3 h-3" /> {log.time}
                        </span>
                      </div>
                    </div>
                    
                    {/* Grid Details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] bg-white p-3 rounded-lg border border-slate-100 mb-3">
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Audit ID</span>
                        <span className="font-semibold text-slate-700 font-mono text-[12px]">{log.auditId}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Entity</span>
                        <span className="font-semibold text-slate-700">{log.entityType} ({log.entityId})</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Source</span>
                        <span className="font-semibold text-slate-700">{log.source}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">IP Address</span>
                        <span className="font-semibold text-slate-700 font-mono text-[11px]">{log.ip}</span>
                      </div>
                    </div>

                    {/* Changes (Before/After) */}
                    {log.changes && (
                      <div className="mt-2 space-y-1.5">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider pl-1">Value Changes</span>
                        {log.changes.map((c, i) => (
                           <div key={i} className="flex items-center gap-3 text-[12px] bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                             <span className="font-semibold text-slate-700 w-28 shrink-0">{c.field}</span>
                             <div className="flex items-center gap-2 flex-1 flex-wrap">
                               <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-100 line-through text-[11px] font-medium">{c.old}</Badge>
                               <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                               <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold">{c.new}</Badge>
                             </div>
                           </div>
                        ))}
                      </div>
                    )}

                    {/* Comments */}
                    {log.comments && (
                      <div className="mt-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                        <span className="text-indigo-800 text-[10px] font-bold uppercase tracking-wider block mb-1">Additional Notes</span>
                        <span className="text-indigo-900 text-[13px] leading-relaxed block italic">"{log.comments}"</span>
                      </div>
                    )}
                    
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFC]">
        {/* Header */}
        <div className="bg-white border-b px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/onboarding')}>
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                 <span>Application ID: {id}</span>
                 <span>•</span>
                 <span>Entity Type: Company</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleAddToMonitor} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add to Monitor
            </Button>
            <Button onClick={handleReject} variant="destructive" className="gap-2">
              <X className="w-4 h-4" />
              Reject
            </Button>
            <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Check className="w-4 h-4" />
              Approve
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r bg-white flex flex-col p-4 overflow-y-auto">
             <div className="space-y-2 flex-1">
              {[
                { id: "Key Data", icon: FileText },
                { id: "Risk Analysis", icon: Activity },
                { id: "Domain Intelligence", icon: Globe },
                { id: "Searched Databases", icon: Database },
                { id: "Document Verification", icon: FileCheck },
                { id: "Notes & Comments", icon: MessageSquare }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    activeTab === item.id 
                      ? "bg-slate-100 border-slate-200 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-semibold ${activeTab === item.id ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.id}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Panel */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === "Key Data" && renderKeyData()}
            {activeTab === "Risk Analysis" && renderRiskAnalysis()}
            {activeTab === "Domain Intelligence" && renderDomainIntelligence()}
            {activeTab === "Searched Databases" && renderSearchedDatabases()}
            {activeTab === "Document Verification" && renderDocumentVerification()}
            {activeTab === "Notes & Comments" && renderNotesAndComments()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
