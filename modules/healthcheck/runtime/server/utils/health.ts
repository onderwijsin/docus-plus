import type { H3Event } from "h3";
import type {
  HealthCheckResult,
  HealthCheckThreshold,
  HealthStatus,
  SystemHealthResponse
} from "../../types/health";

import { ofetch } from "ofetch";
import { joinURL } from "ufo";

const CACHE_HEALTH_KEY_PREFIX = "healthcheck:system";
const DIRECTUS_PING_PATH = "/server/ping";

function getResponseTime(startedAt: number): number {
  return Math.round(performance.now() - startedAt);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown error";
}

function resolveThresholdStatus(
  responseTimeMs: number,
  threshold?: HealthCheckThreshold
): Exclude<HealthStatus, "error"> | "error" {
  if (typeof threshold?.error === "number" && responseTimeMs >= threshold.error) {
    return "error";
  }

  if (typeof threshold?.warn === "number" && responseTimeMs >= threshold.warn) {
    return "warn";
  }

  return "ok";
}

async function runTimedCheck(
  check: () => Promise<void>,
  threshold?: HealthCheckThreshold
): Promise<HealthCheckResult> {
  const startedAt = performance.now();

  try {
    await check();
    const responseTimeMs = getResponseTime(startedAt);

    return {
      status: resolveThresholdStatus(responseTimeMs, threshold),
      responseTimeMs
    };
  } catch (error) {
    return {
      status: "error",
      responseTimeMs: getResponseTime(startedAt),
      error: getErrorMessage(error)
    };
  }
}

async function checkCacheStorage(): Promise<void> {
  const storage = useStorage("cache");
  const value = { health: Date.now() };
  const key = `${CACHE_HEALTH_KEY_PREFIX}:${value.health}`;

  try {
    await storage.setItem(key, value);

    const stored = await storage.getItem<{ health?: number } | null>(key);

    if (!stored || typeof stored !== "object" || stored.health !== value.health) {
      throw new Error("Cache storage returned an unexpected value");
    }
  } finally {
    void storage.removeItem(key).catch(() => {});
  }
}

async function checkDirectus(event: H3Event): Promise<void> {
  const config = useRuntimeConfig(event);

  if (!config.directus) {
    throw new Error("Directus is not enabled");
  }

  const directusBaseUrl = config.directus?.baseUrl?.trim();

  if (!directusBaseUrl) {
    throw new Error("Directus base URL is not configured");
  }

  await ofetch(joinURL(directusBaseUrl, DIRECTUS_PING_PATH), {
    retry: 0,
    timeout: 5000
  });
}

function resolveOverallStatus(checks: HealthCheckResult[]): HealthStatus {
  if (checks.some((check) => check.status === "error")) {
    return "error";
  }

  if (checks.some((check) => check.status === "warn")) {
    return "warn";
  }

  return "ok";
}

/**
 * Runs all public system health probes and returns the aggregated response payload.
 *
 * @param event - Nitro request event used to resolve runtime configuration.
 * @returns Overall health status with per-component timing data.
 */
export async function getSystemHealth(event: H3Event): Promise<SystemHealthResponse> {
  const timestamp = new Date().toISOString();
  const config = useRuntimeConfig(event);
  const healthcheckConfig = config.healthcheck;
  const directusEnabled =
    healthcheckConfig?.directus !== false && Boolean(config.directus?.baseUrl?.trim());

  const [cache, directus] = await Promise.all([
    runTimedCheck(checkCacheStorage, healthcheckConfig?.cache?.threshold),
    directusEnabled
      ? runTimedCheck(() => checkDirectus(event), healthcheckConfig?.directus?.threshold)
      : Promise.resolve(undefined)
  ]);

  const components = {
    cache,
    ...(directus ? { directus } : {})
  };

  return {
    status: resolveOverallStatus(Object.values(components)),
    timestamp,
    components
  };
}
