import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, FileText, AlertCircle, Users, Target } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Company360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string | null;
}

export function Company360Modal({ isOpen, onClose, companyName }: Company360ModalProps) {
  if (!companyName) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[850px] p-0 overflow-hidden bg-white border-slate-200 shadow-2xl rounded-2xl h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="p-5 pb-5 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center gap-3">
          <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
            <Building2 className="h-4 w-4 text-blue-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight m-0 p-0 leading-none">
            Company 360: <span className="font-medium text-slate-500">{companyName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6 bg-slate-50/50">
            
            {/* Top Identity Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start relative">
              <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-slate-200/50 rounded-r-2xl hidden md:block"></div>
              
              {/* Left Identity */}
              <div className="flex-1 flex gap-4 min-w-[300px]">
                <div className="w-16 h-12 bg-slate-50 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                  <img src="https://flagcdn.com/w40/us.png" alt="US" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight mb-2">
                    {companyName}
                  </h2>
                  <div className="text-[13px] text-slate-500 flex items-start gap-1.5 mb-4 max-w-[250px] leading-relaxed">
                    <svg className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    One Microsoft Way, Redmond, Washington 98052-6399
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">ACTIVE</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">LOW RISK</span>
                  </div>
                </div>
              </div>

              {/* Right Details Grid */}
              <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-4 w-full md:pl-6 md:border-l border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Website</div>
                  <a href="#" className="text-[14px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
                    microsoft.com <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</div>
                  <div className="text-[14px] font-semibold text-slate-800">—</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">DUNS</div>
                  <div className="text-[14px] font-semibold text-slate-800">070858714</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Legal Type</div>
                  <div className="text-[14px] font-semibold text-slate-800">Private Limited Company</div>
                </div>
              </div>
            </div>

            {/* Red Alert Banner */}
            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-[13.5px] text-red-700 font-medium leading-relaxed">
                <span className="font-bold">Significant Xbox leadership turnover:</span> New CEO Asha Sharma appointed (April 2026), Xbox Game Studios head Craig Duncan departed, Chief of Staff Louise O'Connor departed, indicating organizational instability
              </p>
            </div>

            {/* About the Company */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">ABOUT THE COMPANY</h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed text-justify">
                Risk assessment complete for {companyName}. Composite risk score of 58 reflects a divergence between Microsoft's exceptional corporate financial health (AAA credit rating, $281.7B revenue, $101.8B net income) and elevated risks specific to the Xbox gaming division. Key concerns include: (1) potential Xbox spin-off or restructuring under evaluation, (2) Microsoft stock in bear market territory (-23% YTD), (3) significant Xbox leadership turnover with new CEO Asha Sharma and departures of Xbox Game Studios head and Chief of Staff, (4) 25% decline in Xbox hardware revenue, and (5) Game Pass strategy criticism. Positive factors include Microsoft's pristine balance sheet, AAA credit ratings, strong cloud/AI growth, and Xbox's strategic IP expansion (Sea of Thieves movie, Gears of War Netflix film). The gaming division faces competitive pressure from Sony PlayStation (2:1 console sales advantage), Nintendo Switch, and Steam's PC gaming dominance.
              </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-200/60">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Revenue</div>
                <div className="text-xl font-bold text-slate-900">£281.7B</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employees</div>
                <div className="text-xl font-bold text-slate-900">228000</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fiscal Year</div>
                <div className="text-xl font-bold text-slate-900">FY2025</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Data Source</div>
                <div className="text-[14px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded inline-flex mt-1">AI risk assessment</div>
              </div>
            </div>

            {/* Bottom Grid: Personnel & Competitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-6">
              
              {/* Key Personnel */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Key Personnel</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">4 People</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                    <div className="font-bold text-slate-900 text-[14px]">Satya Nadella</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Chairman and Chief Executive Officer</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                    <div className="font-bold text-slate-900 text-[14px]">Amy E. Hood</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Executive Vice President and Chief Financial Officer</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                    <div className="font-bold text-slate-900 text-[14px]">Bradford L. Smith</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Vice Chair and President</div>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                    <div className="font-bold text-slate-900 text-[14px]">Judson B. Althoff</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">Executive Vice President and Chief Commercial Officer</div>
                  </div>
                </div>
              </div>

              {/* Key Competitors */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Key Competitors</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">7 Competitors</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Sony Interactive Entertainment (PlayStation)", duns: "SONY" },
                    { name: "Nintendo Co., Ltd.", duns: "NTDOY" },
                    { name: "Valve Corporation (Steam)", duns: "N/A" },
                    { name: "Epic Games", duns: "N/A" },
                    { name: "NVIDIA Corporation (GeForce Now)", duns: "NVDA" },
                    { name: "Amazon (Luna)", duns: "AMZN" },
                    { name: "Tencent Holdings", duns: "TCEHY" },
                  ].map((comp, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg p-3 shadow-sm hover:shadow transition-shadow">
                      <div>
                        <div className="font-bold text-slate-800 text-[13px]">{comp.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">DUNS: {comp.duns}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200 uppercase">Tier 1</Badge>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
