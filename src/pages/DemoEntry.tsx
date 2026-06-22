import { motion } from "framer-motion";
import { Upload, Activity, Search, Database, Bot, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";

const options = [
  { title: "Upload Customer Portfolio", description: "Ingest your customer book to start continuous monitoring", icon: Upload, path: "/portfolio", color: "bg-primary/10 text-primary" },
  { title: "Explore Live Monitoring", description: "View real-time risk detection across the monitored portfolio", icon: Activity, path: "/dashboard", color: "bg-success/10 text-success" },
  { title: "Review Alert Investigations", description: "Inspect AI-generated case files and analyst workflows", icon: Search, path: "/investigations", color: "bg-warning/10 text-warning" },
  { title: "View Data Architecture", description: "Explore the sanctions data pipeline and MDM layer", icon: Database, path: "/architecture", color: "bg-accent/10 text-accent" },
  { title: "See AI Agent Workflows", description: "Watch autonomous agents crawl, extract, match, and score", icon: Bot, path: "/agents", color: "bg-destructive/10 text-destructive" },
];

const DemoEntry = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Platform Demo</h1>
          <p className="text-muted-foreground">Select a module to explore the Sentinel platform capabilities.</p>
        </motion.div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {options.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(opt.path)}
              className="group cursor-pointer rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-primary/20"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${opt.color} mb-4`}>
                <opt.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1.5">{opt.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{opt.description}</p>
              <div className="flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DemoEntry;
