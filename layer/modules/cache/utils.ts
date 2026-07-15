import type { RedisModuleOptions } from "./runtime/types/options";

/**
 * Removes non-serializable fields from existing Nitro storage options before
 * reapplying them to module-managed cache driver config.
 *
 * @param value - Existing Nitro cache storage options.
 * @returns A JSON-serializable subset of storage options without the `driver` key.
 */
export function pickSerializableDriverOptions(
  value: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!value) {
    return {};
  }

  const serializable: Record<string, unknown> = {};
  for (const [key, option] of Object.entries(value)) {
    if (key === "driver") {
      continue;
    }
    if (option === undefined || typeof option === "function" || typeof option === "symbol") {
      continue;
    }
    serializable[key] = option;
  }

  return serializable;
}

/**
 * Builds a Nitro Redis config object from validated module options.
 *
 * @param options - Validated cache module Redis options.
 * @returns Redis driver config compatible with Nitro/Unstorage.
 */
export function buildRedisConfig(options: RedisModuleOptions) {
  const tlsRejectUnauthorized = options.tlsRejectUnauthorized ?? true;

  if (options.redisUrl) {
    return {
      url: options.redisUrl,
      tls: tlsRejectUnauthorized ? undefined : { rejectUnauthorized: false }
    };
  }

  return {
    host: options.host!,
    port: options.port ?? 6379,
    username: options.username!,
    password: options.password!,
    db: options.db ?? 0,
    tls: options.tls === true ? { rejectUnauthorized: tlsRejectUnauthorized } : undefined
  };
}

/**
 * Returns whether the cache module has been given any Redis connection settings.
 * Partial settings are treated as Redis configuration so they are not silently
 * replaced by the memory driver; Varlock can then report the incomplete setup.
 */
export function hasRedisConfig(options: RedisModuleOptions | undefined): boolean {
  if (!options) {
    return false;
  }

  return Boolean(
    options.redisUrl?.trim() ||
    options.host?.trim() ||
    options.username?.trim() ||
    options.password?.trim() ||
    options.port !== undefined ||
    options.db !== undefined
  );
}
