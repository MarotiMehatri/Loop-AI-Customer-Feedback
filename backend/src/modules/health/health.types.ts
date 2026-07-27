export interface HealthCheckResponse {
  status: "ok";
  database: DatabaseStatus;
  uptime: number;
  timestamp: string;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface LivenessResponse {
  status: "alive";
  timestamp: string;
}

export interface ReadinessResponse {
  status: "ready" | "not_ready";
  database: DatabaseStatus;
  timestamp: string;
}

export interface DatabaseStatus {
  status: "connected" | "disconnected";
  error?: string;
}

export interface UptimeInfo {
  uptime: number;
  timestamp: string;
  memoryUsage: NodeJS.MemoryUsage;
}
