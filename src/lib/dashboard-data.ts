import { apiClient } from "./api-client";

export type MonitoredEntityImportRow = {
  name: string;
  entityType?: string | null;
  jurisdiction?: string | null;
  nationality?: string | null;
  dateOfBirth?: string | null;
  externalReference?: string | null;
  aliases?: string[];
  watchlistMemberships?: string[];
  riskScore?: number | null;
  notes?: string | null;
  identifiers?: Record<string, unknown>;
};

export type DashboardSummary = {
  organizationName: string;
  entityCount: number;
  alertCount: number;
  highRiskAlertCount: number;
  articleCount: number;
  openCaseCount: number;
  avgRiskScore: number;
  activeAgentRuns: number;
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get("/dashboard/summary");
  return data;
}

export async function fetchEntities() {
  const { data } = await apiClient.get("/portfolio/entities");
  return data;
}

export async function updateEntityStatus(id: string, status: string) {
  const { data } = await apiClient.patch(`/portfolio/entities/${id}/status`, { status });
  return data;
}

export async function importMonitoredEntities(rows: MonitoredEntityImportRow[]) {
  const { data } = await apiClient.post("/portfolio/import", rows);
  return data;
}

export async function fetchAlerts() {
  const { data } = await apiClient.get("/alerts");
  return data;
}

export async function fetchAgentRuns() {
  const { data } = await apiClient.get("/agents/runs");
  return data;
}

export async function fetchSamplePreview() {
  const { data } = await apiClient.get("/portfolio/sample-preview");
  return data;
}

export async function fetchInvestigationSnapshot() {
  const { data } = await apiClient.get("/investigations/snapshot");
  return data;
}