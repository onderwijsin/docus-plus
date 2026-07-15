import { AsyncLocalStorage } from "node:async_hooks";

import { getContext } from "unctx";

const META_SUFFIX = "$";

export const nitroAsyncContext = getContext("nitro-app", {
  asyncContext: true,
  AsyncLocalStorage
});

/**
 * Returns whether a storage key is reserved for sidecar metadata.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function isMetaKey(key) {
  return key.endsWith(META_SUFFIX);
}

/**
 * Builds the sidecar metadata key for a storage key.
 *
 * @param {string} key
 * @returns {string}
 */
export function toMetaKey(key) {
  return `${key}${META_SUFFIX}`;
}

/**
 * Normalizes request paths to a leading-slash format.
 *
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
export function normalizePath(value) {
  if (!value) {
    return null;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

/**
 * Wraps an Unstorage driver so cache entries keep path metadata in sidecar keys.
 *
 * @param {{
 *   name: string
 *   driver: import('unstorage').Driver
 *   getRequestPath?: () => string | null
 * }} options
 * @returns {import('unstorage').Driver}
 */
export function createCacheDriverWithMeta({ name, driver, getRequestPath }) {
  const resolveRequestPath =
    typeof getRequestPath === "function"
      ? getRequestPath
      : () => normalizePath(nitroAsyncContext.tryUse()?.event?.path);

  const writeMeta = async (key, metadata, options = {}) => {
    if (!metadata || Object.keys(metadata).length === 0) {
      return;
    }

    await driver.setItem(toMetaKey(key), JSON.stringify(metadata), options);
  };

  const readMeta = async (key, options = {}) => {
    const raw = await driver.getItem(toMetaKey(key), options);
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  const mergePathMetadata = async (key, options = {}) => {
    const existing = await readMeta(key, options);
    const nextPath =
      typeof existing.path === "string" && existing.path.length > 0
        ? existing.path
        : resolveRequestPath();

    if (!nextPath) {
      return;
    }

    await writeMeta(key, { ...existing, path: nextPath }, options);
  };

  return {
    name,
    ...driver,
    async getMeta(key, options = {}) {
      const [baseMeta, storedMeta] = await Promise.all([
        typeof driver.getMeta === "function" ? driver.getMeta(key, options) : {},
        isMetaKey(key) ? {} : readMeta(key, options)
      ]);

      return {
        ...(baseMeta && typeof baseMeta === "object" ? baseMeta : {}),
        ...storedMeta
      };
    },
    async setItem(key, value, options = {}) {
      await driver.setItem(key, value, options);
      if (isMetaKey(key)) {
        return;
      }

      await mergePathMetadata(key, options);
    },
    async setItems(items, options = {}) {
      if (typeof driver.setItems === "function") {
        await driver.setItems(items, options);
      } else {
        await Promise.all(
          items.map((item) => {
            const itemOptions = item.options ?? options;
            return driver.setItem(item.key, item.value, itemOptions);
          })
        );
      }

      await Promise.all(
        items
          .filter((item) => !isMetaKey(item.key))
          .map((item) => {
            const itemOptions = item.options ?? options;
            return mergePathMetadata(item.key, itemOptions);
          })
      );
    },
    async removeItem(key, options = {}) {
      await driver.removeItem(key, options);
      if (!isMetaKey(key)) {
        await driver.removeItem(toMetaKey(key), options);
      }
    },
    async getKeys(base, options = {}) {
      const keys = await driver.getKeys(base, options);
      return keys.filter((key) => !isMetaKey(key));
    }
  };
}
