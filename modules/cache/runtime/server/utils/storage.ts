import {
  clearEntireStorageBase,
  clearStorageBase,
  deleteStorageKeys,
  getStorageKeys,
  getStorageKeysByPath,
  normalizeStorageSegment,
  toStorageBaseKey,
} from "#layers/docus-plus/server/utils/storage";

import { toMetaKey } from "../../drivers/utils.mjs";
import { bulkDeleteCloudflareCacheKeys } from "./cloudflare";

const CACHE_BASE = "cache";

export const normalizeSegment = normalizeStorageSegment;

function isCloudflareRuntime(): boolean {
  const runtimeConfig = useRuntimeConfig();

  if (runtimeConfig.public?.mode?.isDev ?? import.meta.dev) {
    return false;
  }

  return runtimeConfig.resolveRuntime?.preset === "cloudflare_module";
}

function expandCloudflareDeleteKeys(keys: string[]): string[] {
  return Array.from(new Set(keys.flatMap((key) => [key, toMetaKey(key)])));
}

/**
 * Deletes cache keys using the active runtime strategy.
 *
 * Node and development runtimes delete through the configured storage driver so sidecar metadata
 * is removed automatically. Cloudflare production uses the KV HTTP bulk delete API and therefore
 * explicitly includes sidecar metadata keys.
 *
 * @param keys - Mount-local cache keys to delete.
 * @returns Number of deleted cache entries (excluding metadata sidecars).
 */
export async function deleteCacheKeys(keys: string[]): Promise<number> {
  if (!keys.length) {
    return 0;
  }

  if (isCloudflareRuntime()) {
    await bulkDeleteCloudflareCacheKeys(expandCloudflareDeleteKeys(keys));
    return keys.length;
  }

  return deleteStorageKeys(CACHE_BASE, keys);
}

/**
 * Converts a raw key fragment into a full key under `cache` storage base.
 *
 * @param raw - Raw cache key fragment from route params or callers.
 * @returns Full cache key prefixed with `cache:`.
 */
export function toFullCacheKey(raw: string): string {
  return toStorageBaseKey(CACHE_BASE, raw);
}

/**
 * Converts a route-supplied cache key into the mount-local key used by `useStorage('cache')`.
 *
 * Accepts either:
 * - raw mount-local keys returned by `storage.getKeys()` / `GET /api/_cache/keys`
 * - fully-qualified keys prefixed with `cache:`
 *
 * @param raw - Raw cache key fragment from route params or callers.
 * @returns Cache storage key without the top-level `cache:` mount prefix.
 */
export function toCacheStorageKey(raw: string): string {
  const normalizedKey = normalizeStorageSegment(raw);
  const normalizedBase = normalizeStorageSegment(CACHE_BASE);
  const basePrefix = `${normalizedBase}:`;

  if (normalizedKey.startsWith(basePrefix)) {
    return normalizedKey.slice(basePrefix.length);
  }

  return normalizedKey;
}

/**
 * Returns cache keys, optionally filtered by a normalized base prefix.
 *
 * @param base - Optional base prefix used to scope returned keys.
 * @returns Matching cache keys from Nitro storage.
 */
export async function getCacheKeys(base?: string): Promise<string[]> {
  return getStorageKeys(CACHE_BASE, base);
}

/**
 * Clears all keys for a given cache base.
 *
 * @param base - Base prefix to clear from cache storage.
 * @returns Number of removed keys.
 */
export async function clearCacheBase(base: string): Promise<number> {
  if (!isCloudflareRuntime()) {
    return clearStorageBase(CACHE_BASE, base);
  }

  const keys = await getStorageKeys(CACHE_BASE, base);
  return deleteCacheKeys(keys);
}

/**
 * Clears the complete `cache` storage base.
 *
 * @returns Number of removed keys.
 */
export async function clearEntireCache(): Promise<number> {
  if (!isCloudflareRuntime()) {
    return clearEntireStorageBase(CACHE_BASE);
  }

  const keys = await getStorageKeys(CACHE_BASE);
  return deleteCacheKeys(keys);
}

/**
 * Finds cache keys by route path using metadata path (preferred) and key fallback matching.
 *
 * @param base - Cache namespace/base to inspect.
 * @param path - Route path used to locate related cache records.
 * @returns Matching cache keys to invalidate.
 */
export async function getCacheKeysByPath(
  base: string,
  path: string,
): Promise<string[]> {
  return getStorageKeysByPath(CACHE_BASE, base, path);
}
