import { apiClient } from "./api-client";

export type ReportingMetrics = {
  monthlyAlerts: Array<{ month: string; alerts: number }>;
  fpReduction: Array<{ month: string; rate: number }>;
  buAlerts: Array<{ name: string; value: number; color: string }>;
  execKpis: Array<{ label: string; value: string; iconName: string; trend: string }>;
};

export async function fetchReportingMetrics(): Promise<ReportingMetrics> {
  const { data } = await apiClient.get("/reporting/metrics");
  return data;
}
