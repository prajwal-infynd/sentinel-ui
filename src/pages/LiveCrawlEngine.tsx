import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Play, Square, Terminal, Globe, Server, Database, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type LogEntry = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
  source: string;
};

const DUMMY_SOURCES = [
  "reuters.com/finance",
  "bloomberg.com/markets",
  "ft.com/companies",
  "wsj.com/business",
  "cnbc.com/world",
];

const DUMMY_ACTIONS = [
  "Extracting entities from",
  "Parsing HTML DOM of",
  "Found high-risk keyword in",
  "Crawling nested links on",
  "Analyzing sentiment for",
];

const generateLog = (): LogEntry => {
  const source = DUMMY_SOURCES[Math.floor(Math.random() * DUMMY_SOURCES.length)];
  const action = DUMMY_ACTIONS[Math.floor(Math.random() * DUMMY_ACTIONS.length)];
  const isError = Math.random() > 0.95;
  const isWarn = Math.random() > 0.85 && !isError;
  const isSuccess = Math.random() > 0.8 && !isError && !isWarn;
  
  let level: LogEntry["level"] = "info";
  if (isError) level = "error";
  else if (isWarn) level = "warn";
  else if (isSuccess) level = "success";

  let message = `${action} ${source}`;
  if (isError) message = `Connection timeout while reaching ${source}`;
  if (isWarn) message = `Rate limit warning encountered for ${source}`;
  if (isSuccess) message = `Successfully indexed 45 new articles from ${source}`;

  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
    level,
    message,
    source,
  };
};

export default function LiveCrawlEngine() {
  const [isCrawling, setIsCrawling] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    urlsScraped: 14502,
    bandwidth: 4.2,
    entities: 8930
  });
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCrawling) {
      interval = setInterval(() => {
        setLogs(prev => [...prev.slice(-49), generateLog()]);
        setStats(prev => ({
          urlsScraped: prev.urlsScraped + Math.floor(Math.random() * 5),
          bandwidth: Number((prev.bandwidth + Math.random() * 0.05).toFixed(2)),
          entities: prev.entities + Math.floor(Math.random() * 2),
        }));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isCrawling]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleCrawl = () => {
    setIsCrawling(!isCrawling);
    if (!isCrawling) {
      setLogs(prev => [...prev, {
        id: "start",
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
        level: "info",
        message: "INITIATING GLOBAL CRAWL SWARM...",
        source: "system"
      }]);
    } else {
      setLogs(prev => [...prev, {
        id: "stop",
        timestamp: new Date().toISOString().split('T')[1].substring(0, 8),
        level: "warn",
        message: "CRAWL SWARM HALTED BY USER",
        source: "system"
      }]);
    }
  };

  const getLogColor = (level: string) => {
    switch(level) {
      case "error": return "text-red-400";
      case "warn": return "text-yellow-400";
      case "success": return "text-green-400";
      default: return "text-slate-300";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Live Crawl Engine</h1>
              <div className="flex items-center gap-2 mt-1">
                {isCrawling ? (
                  <div className="flex items-center gap-1.5 rounded-md border border-success/30 bg-success/15 px-2 py-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-success">Active Ingestion</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 rounded-md border border-muted-foreground/30 bg-muted px-2 py-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Idle</span>
                  </div>
                )}
                <span className="text-xs text-muted-foreground font-medium">Real-time web scraping and entity extraction</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={toggleCrawl} 
            variant={isCrawling ? "destructive" : "default"}
            className={`gap-2 shadow-md ${!isCrawling && "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
          >
            {isCrawling ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isCrawling ? "Stop Crawl" : "Start Crawl"}
          </Button>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">URLs Scraped Today</CardTitle>
                <Globe className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.urlsScraped.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1 text-success flex items-center gap-1">+12% vs yesterday</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Ingested (GB)</CardTitle>
                <Server className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.bandwidth.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Current bandwidth usage</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entities Extracted</CardTitle>
                <Database className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{stats.entities.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">People, Organizations, Locations</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Live Terminal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 shadow-sm overflow-hidden bg-[#0a0a0a]">
            <CardHeader className="border-b border-white/10 pb-3 bg-black/40">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white/90 text-sm">
                  <Terminal className="h-4 w-4" /> Live Terminal Output
                </CardTitle>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                ref={scrollContainerRef}
                className="h-[400px] overflow-y-auto p-4 font-mono text-xs flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {logs.length === 0 ? (
                  <div className="text-slate-500 italic flex items-center justify-center h-full">
                    Awaiting initialization... Click "Start Crawl" to begin.
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      key={`${log.id}-${i}`}
                      className="flex gap-3 leading-relaxed"
                    >
                      <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                      <span className={`shrink-0 w-16 uppercase ${getLogColor(log.level)}`}>{log.level}</span>
                      <span className="text-slate-300">{log.message}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Crawl Jobs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Active Crawl Jobs</CardTitle>
              <CardDescription>Currently executing distributed scraping tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium rounded-tl-lg">Target Source</th>
                      <th className="px-4 py-3 font-medium">Jurisdiction</th>
                      <th className="px-4 py-3 font-medium">Priority</th>
                      <th className="px-4 py-3 font-medium rounded-tr-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr className="bg-white hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">Global Sanctions Lists (OFAC)</td>
                      <td className="px-4 py-3 text-muted-foreground">Global</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-red-500 bg-red-500/10 border-red-500/20">CRITICAL</Badge></td>
                      <td className="px-4 py-3 text-right">{isCrawling ? <Badge className="bg-success text-white">SYNCING</Badge> : <Badge variant="secondary">PAUSED</Badge>}</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">Reuters Financial News</td>
                      <td className="px-4 py-3 text-muted-foreground">US / UK</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-blue-500 bg-blue-500/10 border-blue-500/20">HIGH</Badge></td>
                      <td className="px-4 py-3 text-right">{isCrawling ? <Badge className="bg-success text-white">SYNCING</Badge> : <Badge variant="secondary">PAUSED</Badge>}</td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">Bloomberg Markets</td>
                      <td className="px-4 py-3 text-muted-foreground">Global</td>
                      <td className="px-4 py-3"><Badge variant="outline">NORMAL</Badge></td>
                      <td className="px-4 py-3 text-right">{isCrawling ? <Badge className="bg-success text-white">SYNCING</Badge> : <Badge variant="secondary">PAUSED</Badge>}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
