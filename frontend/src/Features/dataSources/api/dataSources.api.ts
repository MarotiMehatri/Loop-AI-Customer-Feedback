import { apiClient } from "../../../lib/api/api-client";
import type {
  DataSource,
  DataSourcesResponse,
} from "../dataSources.types";

function unwrap<T>(value: unknown): T | undefined {
  if (value === null || value === undefined) return undefined;

  if (typeof value === "object" && "data" in value) {
    const nested = (value as { data?: unknown }).data;
    if (nested !== undefined && nested !== null) {
      return nested as T;
    }
  }

  return value as T;
}

export async function getDataSources() {
  const response = await apiClient.get("/data-sources");
  return unwrap<DataSourcesResponse>(response.data);
}

export async function createDataSource(input: {
  name: string;
  type: DataSource["type"];
  description?: string;
  config?: Record<string, unknown>;
}) {
  const response = await apiClient.post("/data-sources", input);
  return unwrap<DataSource>(response.data);
}

export async function updateDataSource(
  id: string,
  input: { isActive?: boolean; name?: string; description?: string },
) {
  const response = await apiClient.patch(`/data-sources/${id}`, input);
  return unwrap<DataSource>(response.data);
}

export async function syncDataSource(id: string) {
  const response = await apiClient.post(`/data-sources/${id}/sync`);
  return unwrap<DataSource>(response.data);
}

export async function deleteDataSource(id: string) {
  await apiClient.delete(`/data-sources/${id}`);
}
