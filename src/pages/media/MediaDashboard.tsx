import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MediaChartsRow } from "@/components/media/MediaChartsRow";
import { MediaDashboardHeader } from "@/components/media/MediaDashboardHeader";
import { MediaKpiGrid } from "@/components/media/MediaKpiGrid";
import { MediaPanels } from "@/components/media/MediaPanels";
import {
  fetchMediaAgentActivity,
  fetchMediaArticles,
  fetchMediaDashboardSummary,
  fetchMediaRiskCategories,
  fetchMediaSignalsOverTime,
  runMediaAgent,
} from "@/lib/media-agent-data";
import { toast } from "@/components/ui/use-toast";

export default function MediaDashboard() {
  const queryClient = useQueryClient();
  const [manualRunPending, setManualRunPending] = useState(false);

  const { data: summary } = useQuery({ queryKey: ["media-dashboard-summary"], queryFn: fetchMediaDashboardSummary, refetchInterval: 15000 });
  const { data: articles = [] } = useQuery({ queryKey: ["media-dashboard-articles"], queryFn: () => fetchMediaArticles(8), refetchInterval: 15000 });
  const { data: activities = [] } = useQuery({ queryKey: ["media-dashboard-activities"], queryFn: () => fetchMediaAgentActivity(8), refetchInterval: 10000 });
  const { data: signals = [] } = useQuery({ queryKey: ["media-dashboard-signals"], queryFn: fetchMediaSignalsOverTime, refetchInterval: 30000 });
  const { data: categories = [] } = useQuery({ queryKey: ["media-dashboard-categories"], queryFn: fetchMediaRiskCategories, refetchInterval: 30000 });

  const refreshKeys = useMemo(
    () => [
      ["media-dashboard-summary"],
      ["media-dashboard-articles"],
      ["media-dashboard-activities"],
      ["media-dashboard-signals"],
      ["media-dashboard-categories"],
      ["media-live-alerts"],
      ["agent-overview"],
      ["agent-runs"],
    ],
    [],
  );

  const runMutation = useMutation({
    mutationFn: async () => {
      setManualRunPending(true);
      return runMediaAgent();
    },
    onSuccess: (result) => {
      toast({
        title: "Agent cycle completed",
        description: `${result?.articlesCreated ?? 0} articles, ${result?.signalsCreated ?? 0} signals, and ${result?.alertsCreated ?? 0} alerts created.`,
      });
      refreshKeys.forEach((key) => void queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (error: Error) => {
      toast({ title: "Agent run failed", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setManualRunPending(false);
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <MediaDashboardHeader summary={summary} onRun={() => runMutation.mutate()} isRunning={manualRunPending || runMutation.isPending} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <MediaKpiGrid summary={summary} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <MediaChartsRow signals={signals} categories={categories} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <MediaPanels articles={articles} activities={activities} />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
