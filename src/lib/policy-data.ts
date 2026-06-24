import { apiClient } from "./api-client";

export type Watchlist = { name: string; region: string; enabled: boolean };

export type PolicyConfigData = {
  watchlists: Watchlist[];
  mediaCategories: string[];
  selectedMedia: string[];
  confidence: number[];
  severity: number[];
};

export type PolicyAuditLog = {
  id: string;
  entity: string;
  timestamp: string;
  user: string;
  action: string;
  configState: PolicyConfigData;
};

export async function fetchPolicyConfig(entity: string): Promise<PolicyConfigData> {
  const { data } = await apiClient.get(`/policy/config?entity=${encodeURIComponent(entity)}`);
  return data;
}

export async function savePolicyConfig(entity: string, config: PolicyConfigData) {
  const { data } = await apiClient.post("/policy/config", { entity, config });
  return data;
}

export async function fetchAuditLogs(entity?: string): Promise<PolicyAuditLog[]> {
  const url = entity ? `/policy/audit-logs?entity=${encodeURIComponent(entity)}` : "/policy/audit-logs";
  const { data } = await apiClient.get(url);
  return data;
}

export const rollbackPolicy = async (entity: string, logId: string) => {
  return apiClient.post(`/policy/rollback?entity=${encodeURIComponent(entity)}`, { logId });
};

export type UnifiedRecord = {
  id: string;
  entity: string;
  contextSnippet: string;
  sourceName: string;
  sourceType: 'api' | 'csv' | 'pdf' | 'doc' | 'excel';
  confidence: number;
  timestamp: string;
};

export const fetchUnifiedRecords = async (): Promise<UnifiedRecord[]> => {
  const { data } = await apiClient.get('/unified-records');
  return data;
};
