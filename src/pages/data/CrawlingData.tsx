import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Search, Plus, Trash2, SlidersHorizontal, Settings, FileText, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CrawlingEntityModal } from "./CrawlingEntityModal";

const MOCK_DATA = [
  { id: "1", company: "ad dental ltd", domain: "ad-dental.co.uk", status: "ACTIVE", industry: "Health Care Providers & Services", country: "United Kingdom", crawl: "idle" },
  { id: "2", company: "Remote Web Studio", domain: "remotewebstudio.com", status: "ACTIVE", industry: "Web Development", country: "United Kingdom", crawl: "idle" },
  { id: "3", company: "ITSSIE Ltd", domain: "itssie.co.uk", status: "ACTIVE", industry: "—", country: "United Kingdom", crawl: "idle" },
  { id: "4", company: "Remote Way of Working", domain: "remotewayofworking.com", status: "ACTIVE", industry: "Consulting Services", country: "United Kingdom", crawl: "idle" },
  { id: "5", company: "Remote Water Hygiene", domain: "remotewaterhygiene.co.uk", status: "ACTIVE", industry: "Environmental Services", country: "United Kingdom", crawl: "idle" },
];

export default function CrawlingData() {
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(MOCK_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompanyDomain, setNewCompanyDomain] = useState("");

  const handleRowClick = (entity: any) => {
    setSelectedEntity(entity);
    setIsModalOpen(true);
  };

  const handleAddCompany = () => {
    if (!newCompanyDomain.trim()) return;
    
    const isDomain = newCompanyDomain.includes('.');
    const newEntity = {
      id: Math.random().toString(),
      company: isDomain ? newCompanyDomain.split('.')[0] : newCompanyDomain,
      domain: isDomain ? newCompanyDomain : `${newCompanyDomain.toLowerCase().replace(/\s+/g, '')}.com`,
      status: "ACTIVE",
      industry: "—",
      country: "Unknown",
      crawl: "idle"
    };

    setData([newEntity, ...data]);
    setNewCompanyDomain("");
    setIsAddModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white text-slate-800 font-sans p-8">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Portfolio</h1>
                <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-1">100 / 100</span>
              </div>
              <p className="text-sm text-slate-500">Monitored companies. Sentinel re-crawls, cleans and detects changes continuously.</p>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#1C4ED8] hover:bg-blue-700 text-white font-semibold rounded-lg px-5 shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add company
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by company..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-transparent focus-visible:bg-white text-sm"
                />
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md shadow-sm">Company</button>
                <button className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">Domain</button>
                <button className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900">Keywords</button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between gap-4 flex-wrap bg-slate-50/50">
              <div className="flex items-center gap-3 flex-wrap">
                <Button variant="outline" className="h-9 border-slate-200 bg-white text-slate-600 px-3">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 text-sm font-medium">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-[180px] bg-white border-slate-200 text-sm font-medium">
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All industries</SelectItem>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="health">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 text-sm font-medium">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="us">United States</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="any">
                  <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 text-sm font-medium">
                    <SelectValue placeholder="Any crawl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any crawl</SelectItem>
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="crawling">Crawling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sort</span>
                <Select defaultValue="recent">
                  <SelectTrigger className="h-9 w-[140px] bg-white border-slate-200 text-sm font-medium">
                    <SelectValue placeholder="Recently added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently added</SelectItem>
                    <SelectItem value="name">Company Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Industry</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Crawl</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.filter(row => row.company.toLowerCase().includes(search.toLowerCase()) || row.domain.toLowerCase().includes(search.toLowerCase())).map((row, idx) => (
                  <motion.tr 
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{row.company}</div>
                      <div className="text-blue-500 text-[13px] flex items-center gap-1 mt-0.5">
                        {row.domain}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{row.industry}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-500">{row.country.split(' ').map((w,i) => <div key={i}>{w}</div>)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{row.crawl}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-300 hover:text-red-500 transition-colors p-2" onClick={(e) => { e.stopPropagation(); }}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[1400px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-[#F8F9FC] border-slate-200">
           {selectedEntity && <CrawlingEntityModal entity={selectedEntity} onClose={() => setIsModalOpen(false)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
            <DialogDescription>
              Enter the domain name or company name to start crawling and monitoring.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                id="name"
                placeholder="e.g. example.com or Example Inc"
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompany()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCompany} className="bg-blue-600 hover:bg-blue-700">Add to Crawl Queue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
