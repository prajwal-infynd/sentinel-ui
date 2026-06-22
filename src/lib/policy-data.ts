import { apiClient } from "./api-client";

export type Watchlist = { name: string; region: string; enabled: boolean };

export type PolicyConfigData = {
  watchlists: Watchlist[];
  mediaCategories: string[];
  selectedMedia: string[];
  confidence: number[];
  severity: number[];
};

export async function fetchPolicyConfig(): Promise<PolicyConfigData> {
  const { data } = await apiClient.get("/policy/config");
  return data;
}

export async function savePolicyConfig(config: PolicyConfigData) {
  const { data } = await apiClient.post("/policy/config", config);
  return data;
}
