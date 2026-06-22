import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, ExternalLink, Rss, Wifi, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { mediaSources } from "@/lib/media-sample-data";

const reliabilityColor = (r: string) =>
  r === "high" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20";

export default function MediaSources() {
  const [selectedSource, setSelectedSource] = useState<typeof mediaSources[0] | null>(null);
  const [regionFilter, setRegionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mediaSources.filter(s => {
    if (regionFilter !== "all" && !s.country.toLowerCase().includes(regionFilter)) return false;
    if (typeFilter !== "all" && s.type.toLowerCase() !== typeFilter) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Source Intelligence</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage and monitor global media intelligence sources</p>
            </div>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Source</Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search sources..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="united kingdom">United Kingdom</SelectItem>
              <SelectItem value="united states">United States</SelectItem>
              <SelectItem value="hong kong">Hong Kong</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-9 text-sm"><SelectValue placeholder="Source Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="financial news">Financial News</SelectItem>
              <SelectItem value="regulatory">Regulatory</SelectItem>
              <SelectItem value="wire service">Wire Service</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Source Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Source</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Country</th>
                      <th className="text-left p-3 font-medium text-muted-foreground text-xs">Type</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs">Credibility</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs">Articles/Day</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs">Last Updated</th>
                      <th className="text-center p-3 font-medium text-muted-foreground text-xs">Reliability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((source, i) => (
                      <motion.tr
                        key={source.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.2 + i * 0.03 }}
                        className="border-b last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                        onClick={() => setSelectedSource(source)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{source.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{source.country}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">{source.type}</Badge></td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-xs font-bold">{source.credibility}</span>
                          <span className="text-[10px] text-muted-foreground">/100</span>
                        </td>
                        <td className="p-3 text-center font-mono text-xs">{source.articlesPerDay.toLocaleString()}</td>
                        <td className="p-3 text-center text-xs text-muted-foreground">{source.lastUpdated}</td>
                        <td className="p-3 text-center">
                          <Badge className={`text-[9px] px-1.5 py-0 h-4 uppercase ${reliabilityColor(source.reliability)}`}>{source.reliability}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Source Section */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <h2 className="text-sm font-semibold mb-3">Add New Source</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: Rss, title: "RSS Feed", desc: "Add an RSS/Atom feed URL for continuous monitoring" },
              { icon: Globe, title: "Website", desc: "Add a website URL for periodic crawling and extraction" },
              { icon: Wifi, title: "API Source", desc: "Connect via REST API for structured data ingestion" },
            ].map((item, i) => (
              <Card key={item.title} className="hover:shadow-md transition-all cursor-pointer hover:border-primary/30 active:scale-[0.98]">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Source Detail Drawer */}
        <Sheet open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
          <SheetContent className="w-[420px] sm:w-[480px]">
            {selectedSource && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    {selectedSource.name}
                  </SheetTitle>
                  <SheetDescription>{selectedSource.type} · {selectedSource.country}</SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-[10px] text-muted-foreground">Credibility Score</div>
                      <div className="text-lg font-bold font-mono">{selectedSource.credibility}<span className="text-xs text-muted-foreground">/100</span></div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-[10px] text-muted-foreground">Articles/Day</div>
                      <div className="text-lg font-bold font-mono">{selectedSource.articlesPerDay.toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Source Description</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedSource.name} is a {selectedSource.reliability}-reliability {selectedSource.type.toLowerCase()} source based in {selectedSource.country}.
                      Articles are crawled and processed continuously for entity extraction and risk signal detection.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Coverage Topics</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {["Financial Crime", "Sanctions", "Regulatory", "Corporate Fraud", "Corruption"].map(t => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold mb-2">Sample Recent Articles</h4>
                    <div className="space-y-2">
                      {["Major bank fined for AML failures", "New sanctions regime announced", "Corporate fraud investigation opened"].map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1.5 border-b border-border/50 last:border-0">
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DashboardLayout>
  );
}
