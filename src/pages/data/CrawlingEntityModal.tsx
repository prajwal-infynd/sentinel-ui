import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw, Sparkles, Download, Clock, Globe, FileText, CheckCircle2, TrendingUp, Users, Terminal, MapPin, Search, ShieldAlert, BadgeDollarSign, Database, FileDigit, Briefcase, ShoppingBag, Banknote, ShieldBan, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CrawlingEntityModal({ entity, onClose }: { entity: any, onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#F8F9FC] overflow-hidden rounded-xl font-sans text-slate-800">
      
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 z-10">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm cursor-pointer hover:underline mb-4" onClick={onClose}>
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-[26px] font-bold text-slate-900 tracking-tight">{entity.company}</h2>
              <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold px-2 py-0.5 rounded-md">LOW</span>
              <div className="ml-auto flex items-center gap-1.5 text-emerald-600 text-sm font-semibold ml-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Monitoring
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {entity.domain}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 2810 min ago</span>
              <span>English</span>
              <span className="font-medium text-slate-600">Credibility: <span className="font-bold text-slate-900">85/100</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 font-semibold shadow-sm hover:bg-slate-50">
              <RefreshCw className="w-4 h-4" /> Re-Crawl
            </Button>
            <Button className="gap-2 bg-[#1C4ED8] hover:bg-blue-700 text-white font-semibold shadow-sm">
              <Sparkles className="w-4 h-4" /> AI Analysis
            </Button>
            <Button variant="outline" className="gap-2 bg-white text-slate-700 border-slate-200 font-semibold shadow-sm hover:bg-slate-50">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Words</div>
              <div className="text-lg font-bold text-slate-900">77</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Load time</div>
              <div className="text-lg font-bold text-slate-900">91 ms</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sentiment</div>
              <div className="text-lg font-bold text-emerald-600">Positive</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entities</div>
              <div className="text-lg font-bold text-slate-900">6</div>
            </div>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</div>
              <div className="text-lg font-bold text-slate-900">en</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
          
          {/* Left Column */}
          <div className="col-span-8 space-y-8">
            
            {/* Article Content */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-slate-800 text-sm">Article Content</h3>
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-center mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Sentiment</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-500">4 Positive</span>
                    <span className="text-red-500">0 Negative</span>
                  </div>
                </div>
                <div className="h-1 w-full flex rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
                <div className="text-slate-700 leading-loose text-sm font-medium">
                  # SAN FRANCISCO -- It wasn't the easiest way to go about getting a win, but the <span className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Braves</span> will take 'em however they can get 'em these days. <span className="bg-emerald-50 text-emerald-600 px-1 rounded border border-emerald-100">Starting</span> pitcher <span className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Hurston Waldrep</span> made his <span className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">2026</span> debut by throwing two-plus innings of scoreless relief, and Ozzie Albies drove in a pair of runs as the <span className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Braves</span> beat the Giants 3-1 at Oracle Park on Friday to halt a four-game losing streak. Waldrep was one of six pitchers the <span className="bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Braves</span> turned to for their first win since Saturday. Dylan Lee inherited two runners in the seventh but escaped that jam and then got the first two outs of the eighth before a Willy Adames double to deep center. Didier Fuentes came in and struck out Matt Chapman on three pitches.
                </div>
              </div>
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex gap-3">
                <Button variant="outline" size="sm" className="bg-white h-8 text-xs font-semibold text-slate-600 gap-1.5"><FileText className="w-3.5 h-3.5" /> View Original</Button>
                <Button variant="outline" size="sm" className="bg-white h-8 text-xs font-semibold text-slate-600 gap-1.5"><FileText className="w-3.5 h-3.5" /> Copy</Button>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[300px] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm">AI Analysis</h3>
                </div>
                <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                  <ActivityIcon className="w-3.5 h-3.5" /> Live extraction
                </div>
              </div>
              <div className="flex border-b border-slate-100 px-4 pt-2">
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Entities</button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent">Keywords</button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent">Risk</button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent">Summary</button>
                <button className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 border-b-2 border-transparent">Trace</button>
              </div>
              <div className="p-6 flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" /> Hurston Waldrep
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Person</span>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" /> It
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Location</span>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" /> Braves
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Location</span>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <MapPin className="w-4 h-4 text-slate-400" /> Starting
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Location</span>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Users className="w-4 h-4 text-slate-400" /> 2026
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Date</span>
                  </div>
                  <div className="border border-slate-100 rounded-lg p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FileText className="w-4 h-4 text-slate-400" /> Starting
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase">Title</span>
                  </div>
                </div>

                <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Portfolio Match</div>
                  <div className="text-sm font-bold text-slate-800">{entity.company} — <span className="text-emerald-600">85% confidence</span></div>
                </div>
              </div>
            </div>

            {/* Signals by Category */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-800 text-sm">Signals by Category <span className="text-slate-400 ml-1 text-xs">0</span></h3>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                {[
                  { icon: FileText, name: "Company Profile", desc: "Contact details, Corporate identity", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: MapPin, name: "Location Intelligence", desc: "Geography, Operations", count: 0, color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Users, name: "People & Governance", desc: "Key people, Management", count: 0, color: "text-indigo-500", bg: "bg-indigo-50" },
                  { icon: Briefcase, name: "Products & Services", desc: "Business, Offerings", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: CheckCircle2, name: "Certifications", desc: "ISO, Compliance, Standards", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: Clock, name: "Corporate Events", desc: "Changes, Announcements", count: 0, color: "text-orange-500", bg: "bg-orange-50" },
                  { icon: Banknote, name: "Financial Risk", desc: "Irregular flows, Transactions", count: 0, color: "text-orange-500", bg: "bg-orange-50" },
                  { icon: Database, name: "Digital & Technology", desc: "Web, Tech stack, Digital footprint", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: Globe, name: "ESG & Reputation", desc: "Environmental, social", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: ShoppingBag, name: "Sales Intelligence", desc: "Buyer intent, Departments", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: ShieldAlert, name: "Regulatory & Legal", desc: "Investigation, Enforcement", count: 0, color: "text-red-500", bg: "bg-red-50" },
                  { icon: FileText, name: "Adverse Media", desc: "News, press", count: 0, color: "text-purple-500", bg: "bg-purple-50" },
                  { icon: ShieldBan, name: "Sanctions & Watchlists", desc: "OFAC, UN, EU lists", count: 0, color: "text-red-500", bg: "bg-red-50" },
                  { icon: TrendingUp, name: "Supply Chain Risk", desc: "Suppliers, Third parties", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: TrendingUp, name: "Growth Signals", desc: "Hiring, Expansion, Funding", count: 0, color: "text-emerald-500", bg: "bg-emerald-50" },
                ].map((signal, i) => (
                  <div key={i} className="border border-slate-100 rounded-xl p-4 flex items-start justify-between hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer">
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${signal.bg} ${signal.color}`}>
                        <signal.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-[13px] leading-tight mb-0.5">{signal.name}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{signal.desc}</div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${signal.count > 0 ? signal.color : 'text-slate-300'}`}>{signal.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What Changed */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[160px] flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-slate-800 text-sm">What Changed</h3>
                </div>
                <div className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">0</div>
              </div>
              <div className="p-8 flex-1 flex items-center justify-center">
                <div className="border border-dashed border-slate-200 rounded-xl p-8 w-full text-center bg-slate-50/50">
                  <span className="text-sm font-medium text-slate-400">No changes detected since the last snapshot.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="col-span-4 space-y-8">
            
            {/* Source Evidence */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm">Source Evidence <span className="text-slate-400 ml-1 text-xs">1</span></h3>
                </div>
              </div>
              <div className="p-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Source Documents - 1</div>
                <div className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="font-bold text-slate-800 text-sm">{entity.domain}</div>
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Website</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Trust 85
                    </span>
                    <span className="text-slate-400">April 15</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Chat */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[600px]">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm">AI Chat</h3>
                </div>
                <span className="text-blue-600 text-xs font-semibold cursor-pointer hover:underline">New</span>
              </div>
              
              <div className="p-4 border-b border-slate-50 flex gap-2 flex-wrap shrink-0">
                <span className="border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors bg-white shadow-sm">Summarise risks</span>
                <span className="border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors bg-white shadow-sm">Who runs this company?</span>
                <span className="border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors bg-white shadow-sm">What changed recently?</span>
                <span className="border border-slate-200 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors bg-white shadow-sm">Compliance flags?</span>
              </div>

              <div className="p-5 flex-1 overflow-y-auto">
                <div className="mb-6">
                  <div className="font-bold text-slate-900 text-sm mb-3">What are the key takeaways from this article?</div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Key takeaways
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2 before:content-['•'] before:text-slate-400">
                      <span>{entity.company} is under active monitoring.</span>
                    </li>
                    <li className="flex items-start gap-2 before:content-['•'] before:text-slate-400">
                      <span>12 source(s) indexed; credibility 85%.</span>
                    </li>
                    <li className="flex items-start gap-2 before:content-['•'] before:text-slate-400">
                      <span>0 risk signal(s); sentiment positive.</span>
                    </li>
                    <li className="flex items-start gap-2 before:content-['•'] before:text-slate-400">
                      <span>Most repeated term: <strong>data</strong> (5×).</span>
                    </li>
                    <li className="flex items-start gap-2 before:content-['•'] before:text-slate-400">
                      <span>1 change(s) since the last snapshot.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ask anything about this company..." 
                    className="w-full bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                  />
                  <button className="absolute right-3 top-3 text-blue-600 hover:text-blue-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Logs & Crawl History */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ActivityIcon className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm">Logs & Crawl History</h3>
                </div>
                <div className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">1</div>
              </div>
              <div className="p-5">
                <div className="border border-slate-200 rounded-xl p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                  <div className="flex items-start gap-3">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-0.5">DONE</span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">done - 100%</div>
                      <div className="text-xs text-slate-500 mt-0.5">Snapshot: April 15 - 0.1s - 9 logs</div>
                    </div>
                  </div>
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[11px] space-y-2.5">
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:07 PM</span><span className="text-blue-500 font-bold mr-2">[queue]</span> Pipeline starting</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:08 PM</span><span className="text-orange-500 font-bold mr-2">[discovery]</span> Resolving identity for company</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:09 PM</span><span className="text-emerald-500 font-bold mr-2">[crawl]</span> Fetching 1 candidate sources</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:11 PM</span><span className="text-purple-500 font-bold mr-2">[extraction]</span> Extracting structured fields with AI</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:18 PM</span><span className="text-emerald-600 font-bold mr-2">[live-clean]</span> Normalising & validating fields</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:22 PM</span><span className="text-blue-500 font-bold mr-2">[enrichment]</span> Enriching with size/revenue/risk indicators</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:28 PM</span><span className="text-orange-500 font-bold mr-2">[change-detect]</span> No material changes detected</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:29 PM</span><span className="text-red-500 font-bold mr-2">[risk]</span> Scoring risk signals</div>
                  <div className="text-slate-600"><span className="text-slate-400 mr-2">12:44:30 PM</span><span className="text-emerald-500 font-bold mr-2">[done]</span> Pipeline complete</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
