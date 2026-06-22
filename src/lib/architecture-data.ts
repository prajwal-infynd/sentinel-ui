import { apiClient } from "./api-client";

export type ArchitectureInfo = {
  pipelineSteps: Array<{ label: string; iconName: string; desc: string }>;
  features: Array<{ title: string; desc: string }>;
  schemaFields: Array<{ field: string; type: string; desc: string }>;
};

export async function fetchArchitectureInfo(): Promise<ArchitectureInfo> {
  const { data } = await apiClient.get("/architecture/info");
  return data;
}
