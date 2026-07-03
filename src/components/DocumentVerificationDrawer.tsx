import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, CheckCircle2, ChevronDown, FileCheck, 
  MapPin, Smartphone, UserCheck, ShieldAlert, Fingerprint, Activity, Home, Info
} from "lucide-react";

interface DocumentVerificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  personName?: string;
}

export const DocumentVerificationDrawer: React.FC<DocumentVerificationDrawerProps> = ({
  isOpen,
  onClose,
  personName = "Applicant User"
}) => {
  const [activeTab, setActiveTab] = useState("Identity ID");

  const tabs = [
    { id: "Identity ID", icon: FileCheck, description: "National ID, Passport, or Driving License" },
    { id: "Proof of Address", icon: Home, description: "Utility bill or bank statement" },
    { id: "Biometric Verification", icon: Fingerprint, description: "Face match with ID" },
    { id: "Location Intelligence", icon: MapPin, description: "Verify user's claimed location" },
    { id: "Device Check", icon: Smartphone, description: "Identify potential fraud/proxies" },
    { id: "AML Screenings", icon: ShieldAlert, description: "Screening on provided ID full name" }
  ];

  const renderSidebar = () => (
    <div className="w-80 border-r bg-slate-50/50 p-6 flex flex-col h-full overflow-y-auto">
      <div className="flex flex-col items-center mb-6">
        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
          <UserCheck className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{personName}</h2>
        <Badge className="mt-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pending Full Verification</Badge>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full mb-2 overflow-hidden flex">
        <div className="bg-emerald-500 h-full w-[40%]"></div>
      </div>
      <p className="text-xs text-slate-500 text-center mb-8">40% Checks Completed</p>

      <h3 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Verification Checks</h3>
      
      <div className="space-y-2 flex-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
              activeTab === item.id 
                ? "bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100" 
                : "bg-transparent border-transparent hover:bg-slate-100"
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
            {item.id === "Identity ID" || item.id === "Device Check" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ChevronDown className={`w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 ${activeTab === item.id ? 'opacity-100 rotate-180' : ''}`} />
            )}
          </button>
        ))}
      </div>
    </div>
  );

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
            <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Full Name</span><span className="font-semibold text-slate-900">John Doe</span></div>
            <div className="flex justify-between border-b border-slate-100 pb-2"><span className="text-slate-500">Date of Birth</span><span className="font-semibold text-slate-900">1985-04-12</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Expiry Date</span><span className="font-semibold text-slate-900">2030-01-01</span></div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-full h-40 bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mb-4 relative overflow-hidden">
             <span className="text-slate-500 font-medium">Front of ID Document</span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified Authentic</Badge>
        </div>
      </div>
    </div>
  );

  const renderProofOfAddress = () => (
    <div className="space-y-6 flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
       <Home className="w-12 h-12 text-slate-300 mb-2" />
       <h4 className="font-bold text-slate-700">Awaiting Upload</h4>
       <p className="text-slate-500 text-sm max-w-sm text-center">User has not uploaded a utility bill or bank statement for address verification yet.</p>
       <Button className="mt-4" variant="outline">Send Reminder to User</Button>
    </div>
  );

  const renderBiometric = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-lg">Face Match Score</h4>
          <p className="text-slate-500 text-sm">Comparing selfie video with ID document photo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-emerald-600">98.5%</div>
          <Badge className="bg-emerald-500 text-white">High Match</Badge>
        </div>
      </div>
      <div className="bg-[#F3F9EE] border border-[#E2EED9] rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-[#71A54F] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-700">
          Liveness detection passed successfully. No printed photos, masks, or screens detected.
        </p>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MapPin className="w-10 h-10 text-indigo-500 bg-indigo-50 p-2 rounded-full" />
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Location Verification</h4>
            <p className="text-slate-500 text-sm">Comparing IP location with claimed address</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-900 font-semibold">IP: London, UK</div>
          <Badge className="bg-emerald-100 text-emerald-700 border-none mt-1">Matches Claimed Address</Badge>
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
            <div className="flex justify-between items-center p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
              <span className="text-slate-600 font-medium">Previously Flagged</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex justify-between items-center p-3 bg-white border border-slate-100 shadow-sm rounded-lg">
              <span className="text-slate-600 font-medium">Multiple Accounts</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
         </div>
       </div>
    </div>
  );

  const renderAmlScreening = () => (
    <div className="space-y-6 flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
       <ShieldAlert className="w-12 h-12 text-slate-300 mb-2" />
       <h4 className="font-bold text-slate-700">AML Screening Pending</h4>
       <p className="text-slate-500 text-sm max-w-sm text-center mb-6">Run a screening on the extracted name and ID to identify any adverse media or sanctions.</p>
       <Button className="bg-indigo-600 hover:bg-indigo-700">Run AML Screening Now</Button>
    </div>
  );

  const renderContent = () => {
    const currentTab = tabs.find(t => t.id === activeTab);
    
    return (
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            {currentTab && <currentTab.icon className="w-10 h-10 text-indigo-600 bg-indigo-50 p-2 rounded-xl" />}
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{activeTab}</h2>
              <p className="text-slate-500 text-sm">{currentTab?.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Update Status</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Approve Step</Button>
          </div>
        </div>
        
        <div className="flex-1">
          {activeTab === "Identity ID" && renderIdentityId()}
          {activeTab === "Proof of Address" && renderProofOfAddress()}
          {activeTab === "Biometric Verification" && renderBiometric()}
          {activeTab === "Location Intelligence" && renderLocation()}
          {activeTab === "Device Check" && renderDeviceCheck()}
          {activeTab === "AML Screenings" && renderAmlScreening()}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[95vw] sm:max-w-[1200px] p-0 flex flex-row gap-0 bg-[#F8FAFC] border-l border-slate-200"
      >
        {renderSidebar()}
        
        <ScrollArea className="flex-1 h-full bg-white">
          <div className="p-10 h-full min-h-[800px]">
            {renderContent()}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
