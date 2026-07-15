export type HealthStatus = "ok" | "warn" | "error";

export interface HealthCheckThreshold {
  warn?: number;
  error?: number;
}

export interface HealthCheckResult {
  status: HealthStatus;
  responseTimeMs: number;
  error?: string;
}

export interface SystemHealthResponse {
  status: HealthStatus;
  timestamp: string;
  components: {
    cache: HealthCheckResult;
  };
}
