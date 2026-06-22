import { motion } from "framer-motion";
import { Database, ArrowRight, CheckCircle2, Layers, GitBranch, FileText, Shield, Plug, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { fetchArchitectureInfo } from "@/lib/architecture-data";

const iconMap: Record<string, any> = {
  Database,
  Layers,
  FileText,
  GitBranch,
  ArrowRight,
  Shield,
  Plug,
};

const DataArchitecture = () => {
  const { data, isLoading } = useQuery({ queryKey: ["architecture-info"], queryFn: fetchArchitectureInfo });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Data Sources</h1>
                <p className="text-sm text-muted-foreground mt-0.5">End-to-end pipeline from raw sources to policy-driven delivery</p>
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-muted-foreground h-8 w-8" /></div>
        ) : !data ? null : (
          <>
            {/* Pipeline */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 shadow-sm">
                <h3 className="mb-6 text-base font-bold tracking-tight">Processing Pipeline</h3>
                <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                  {data.pipelineSteps.map((step, i) => {
                    const Icon = iconMap[step.iconName] || Database;
                    return (
                      <div key={step.label} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-3 group">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm transition-transform group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white duration-300">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-foreground">{step.label}</span>
                            <span className="whitespace-nowrap text-[9px] font-medium text-muted-foreground mt-0.5">{step.desc}</span>
                          </div>
                        </div>
                        {i < data.pipelineSteps.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground/30 flex-shrink-0 mx-2" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.features.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success border border-success/20 group-hover:bg-success group-hover:text-white transition-colors duration-300">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="text-lg font-bold tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</div>
                    <div className="text-sm text-muted-foreground leading-relaxed">{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Schema Table */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden"
            >
              <div className="px-6 py-5 border-b bg-muted/20">
                <h3 className="text-base font-bold tracking-tight">Entity Schema — <span className="font-mono text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded ml-1 border border-indigo-500/20">master_entities</span></h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-6">Field</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-6">Type</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-10 px-6">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.schemaFields.map(f => (
                    <TableRow key={f.field} className="transition-colors hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-bold text-indigo-600 px-6 py-4">{f.field}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground px-6 py-4">
                        <span className="bg-muted px-2 py-1 rounded border border-border/50">{f.type}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground px-6 py-4">{f.desc}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DataArchitecture;
