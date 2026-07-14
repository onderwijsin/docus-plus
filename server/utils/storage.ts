import type { Storage, StorageValue } from "unstorage";

declare function useStorage<T extends StorageValue = StorageValue>(_base?: string): Storage<T>;

/**
 * Normalizes route/base/key fragments to storage segment format.
 *
 * - converts `/` to `:`
 * - trims leading/trailing `:`
 *
 * @param value - Raw route/key/base fragment.
 * @returns Normalized segment for storage key composition.
 */
export function normalizeStorageSegment(value: string): string {
  return value.replace(/\//g, ":").replace(/^:+|:+$/g, "");
}

/**
 * Converts a raw key fragment into a namespaced key under a storage base prefix.
 *
 * @param base - Logical base/namespace inside the storage mount.
 * @param raw - Raw key fragment from callers.
 * @returns Namespaced key prefixed with the normalized base.
 */
export function toStorageBaseKey(base: string, raw: string): string {
  const normalizedBase = normalizeStorageSegment(base);
  const normalizedKey = normalizeStorageSegment(raw);

  if (!normalizedBase) {
    return normalizedKey;
  }

  return normalizedKey.startsWith(`${normalizedBase}:`)
    ? normalizedKey
    : `${normalizedBase}:${normalizedKey}`;
}

/**
 * Returns storage keys, optionally filtered by a normalized logical base prefix.
 *
 * @param storageBase - Top-level Nitro storage mount name.
 * @param base - Optional logical base used to scope returned keys.
 * @returns Matching keys from the selected Nitro storage mount.
 */
export async function getStorageKeys(storageBase: string, base?: string): Promise<string[]> {
  const storage = useStorage(storageBase);

  if (!base) {
    return storage.getKeys();
  }

  const normalizedBase = normalizeStorageSegment(base);
  const prefix = `${normalizedBase}:`;
  const keys = await storage.getKeys();
  return keys.filter((key: string) => key === normalizedBase || key.startsWith(prefix));
}

/**
 * Deletes an explicit list of keys from a Nitro storage mount.
 *
 * @param storageBase - Top-level Nitro storage mount name.
 * @param keys - Concrete mount-local keys to remove.
 * @returns Number of removed keys.
 */
export async function deleteStorageKeys(storageBase: string, keys: string[]): Promise<number> {
  if (!keys.length) {
    return 0;
  }

  const storage = useStorage(storageBase);
  await Promise.all(keys.map((key: string) => storage.removeItem(key)));
  return keys.length;
}

/**
 * Clears all keys for a given logical base inside a Nitro storage mount.
 *
 * @param storageBase - Top-level Nitro storage mount name.
 * @param base - Logical base prefix to clear from storage.
 * @returns Number of removed keys.
 */
export async function clearStorageBase(storageBase: string, base: string): Promise<number> {
  const keys = await getStorageKeys(storageBase, base);
  return deleteStorageKeys(storageBase, keys);
}

/**
 * Clears the complete Nitro storage mount.
 *
 * @param storageBase - Top-level Nitro storage mount name.
 * @returns Number of removed keys.
 */
export async function clearEntireStorageBase(storageBase: string): Promise<number> {
  const storage = useStorage(storageBase);
  const keys = await storage.getKeys();
  return deleteStorageKeys(storageBase, keys);
}

/**
 * Finds namespaced storage keys by route path using metadata path and key fallback matching.
 *
 * @param storageBase - Top-level Nitro storage mount name.
 * @param base - Logical base/namespace to inspect.
 * @param path - Route path used to locate related cached records.
 * @returns Matching keys to invalidate.
 */
export async function getStorageKeysByPath(
  storageBase: string,
  base: string,
  path: string
): Promise<string[]> {
  const storage = useStorage(storageBase);
  const keys = await getStorageKeys(storageBase, base);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const matches = await Promise.all(
    keys.map(async (key) => {
      const metadata = await storage.getMeta(key);
      const metadataPath = typeof metadata?.path === "string" ? metadata.path : null;

      if (metadataPath && metadataPath.startsWith(normalizedPath)) {
        return key;
      }

      const normalizedKey = key.replace(/:/g, "/");
      return normalizedKey.includes(normalizedPath) ? key : null;
    })
  );

  return matches.filter((key): key is string => Boolean(key));
}
