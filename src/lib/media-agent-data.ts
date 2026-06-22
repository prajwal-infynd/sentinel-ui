import { apiClient } from "./api-client";

export type MediaDashboardSummary = {
  sourcesScanned: number;
  articlesProcessed: number;
  riskSignals: number;
  highRiskAlerts: number;
  entitiesImpacted: number;
  falsePositiveRate: number;
  avgConfidence: number;
  activeAgents: number;
};

export type MediaFeedItem = {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  severity: string;
  riskTags: string[];
  riskScore: number;
  entities: string[];
};

export type MediaActivityItem = {
  id: string;
  action: string;
  detail: string;
  status: "active" | "completed";
  time: string;
};

export type RiskCategoryPoint = {
  category: string;
  count: number;
  color: string;
};

export type SignalsPoint = {
  date: string;
  signals: number;
  alerts: number;
};

export type LiveMediaAlert = {
  id: string;
  severity: string;
  title: string;
  summary: string;
  generatedAt: string;
  confidenceScore: number;
  status: string;
  entityName: string;
  articleHeadline: string;
};

export type AgentOverview = {
  name: string;
  status: "running" | "idle" | "completed";
  processed: number;
  signals: number;
  accuracy: number;
  uptime: string;
  lastAction: string;
};

export type LiveArticleDetail = {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  language: string;
  credibilityScore: number;
  severity: "critical" | "high" | "medium" | "low";
  content: string;
  summary: string;
  entities: string[];
  matchedEntity: string;
  matchConfidence: number;
  riskScore: number;
  riskTags: string[];
  trace: { label: string; value: string }[];
  debate: { agent: string; role: string; message: string; timestamp: string }[];
};

export async function fetchMediaDashboardSummary(): Promise<MediaDashboardSummary> {
  const { data } = await apiClient.get("/media/summary");
  return data;
}

export async function fetchMediaArticles(limit = 8): Promise<MediaFeedItem[]> {
  const { data } = await apiClient.get(`/media/articles?limit=${limit}`);
  return data;
}

export async function fetchMediaAgentActivity(limit = 8): Promise<MediaActivityItem[]> {
  const { data } = await apiClient.get(`/media/activity?limit=${limit}`);
  return data;
}

export async function fetchMediaSignalsOverTime(): Promise<SignalsPoint[]> {
  const { data } = await apiClient.get("/media/signals-over-time");
  return data;
}

export async function fetchMediaRiskCategories(): Promise<RiskCategoryPoint[]> {
  const { data } = await apiClient.get("/media/risk-categories");
  return data;
}

export async function fetchMediaAlerts(limit = 12): Promise<LiveMediaAlert[]> {
  const { data } = await apiClient.get(`/media/alerts?limit=${limit}`);
  return data;
}

export async function fetchAgentOverview(): Promise<AgentOverview[]> {
  const { data } = await apiClient.get("/media/agents-overview");
  return data;
}

export async function fetchMediaArticleDetail(id: string): Promise<LiveArticleDetail | null> {
  const { data } = await apiClient.get(`/media/article/${id}`);
  return data;
}

export async function runMediaAgent() {
  const { data } = await apiClient.post("/media/agents/run");
  return data;
}