import type { CacheFlushPayload } from "../utils/schema";

interface CacheMapEntry {
  /** Cache base key used in storage keys (e.g. `pages:articles`) */
  key: string;
  /** Field used from the flush payload to resolve target route segment */
  fieldKey: string;
  /** Optional route prefix used in key matching. Defaults to `/` */
  pathPrefix?: string;
}

export type CacheMap = Record<CacheFlushPayload["collection"], CacheMapEntry>;

export interface RedisModuleOptions {
  /** Redis connection URL. When set, it takes precedence over individual connection fields. */
  redisUrl?: string;
  /** Redis host name. Required when `redisUrl` is not provided. */
  host?: string;
  /** Redis port. Defaults to `6379`. */
  port?: number;
  /** Redis username. Required when `redisUrl` is not provided. */
  username?: string;
  /** Redis password. Required when `redisUrl` is not provided. */
  password?: string;
  /** Redis database index. Defaults to `0`. */
  db?: number;
  /** Enables TLS for host/port based connections. */
  tls?: boolean;
  /** Controls TLS certificate verification. Defaults to `true`. */
  tlsRejectUnauthorized?: boolean;
}

export interface CloudflareModuleOptions {
  /** Cloudflare account id used for KV bulk delete API calls. */
  accountId?: string;
  /** Cloudflare KV API token used for KV bulk delete API calls. */
  kvApiToken?: string;
  /** Cloudflare KV namespace id used by the cache binding. */
  cacheNamespaceId?: string;
}

export interface ModuleOptions {
  enabled?: boolean;
  /** Bearer or x-admin-token accepted token for /api/_cache endpoints */
  apiToken?: string;
  /** Redis connection settings used to register the cache storage driver. */
  redis?: RedisModuleOptions;
  /** @deprecated Development now always uses the filesystem cache driver. */
  enableRedisInDevelopment?: boolean;
  /** Optional Cloudflare KV API configuration used for bulk delete operations. */
  cloudflare?: CloudflareModuleOptions;
  /** Optional endpoint toggles */
  endpoints?: {
    flush?: boolean | undefined;
    invalidate?: boolean | undefined;
  };
  /** Optional map used by flush endpoint */
  cacheMap?: CacheMap;
}

export type ResolvedModuleOptions = Required<Pick<ModuleOptions, "enabled">> & ModuleOptions;
