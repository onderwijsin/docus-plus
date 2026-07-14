import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { joinURL } from "ufo";
import { z } from "zod";

import { flushSchema } from "../../../utils/schema";
import {
  deleteCacheKeys,
  getCacheKeysByPath,
  normalizeSegment,
} from "../../utils/storage";

/**
 * Flushes targeted cache entries from CMS events.
 *
 * Resolves affected keys by `cacheMap` collection mapping and route segment field,
 * then removes matching keys from `useStorage('cache')`.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).cache;
  if (!config.endpoints?.flush) {
    throw createError({
      statusCode: 403,
      statusMessage: "Flush endpoint is disabled",
    });
  }

  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const bodyResult = flushSchema.safeParse(await readBody(event));
  if (!bodyResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid payload schema",
      data: z.treeifyError(bodyResult.error),
    });
  }

  const { cacheMap } = config;
  if (!cacheMap) {
    throw createError({
      statusCode: 403,
      statusMessage: "Cache map not configured",
    });
  }

  let removed = 0;

  for (const entry of bodyResult.data) {
    const mapEntry = cacheMap[entry.collection];
    if (!mapEntry) {
      continue;
    }

    const routeValue = entry.fields[mapEntry.fieldKey];
    if (routeValue === undefined || routeValue === null) {
      continue;
    }

    const base = normalizeSegment(mapEntry.key);
    const path = joinURL(mapEntry.pathPrefix ?? "/", String(routeValue));
    const normalizedPath = normalizeSegment(path);
    const keysToDelete = await getCacheKeysByPath(base, path);
    const fallbackKeysToDelete = keysToDelete.length
      ? keysToDelete
      : await getCacheKeysByPath(base, normalizedPath.replace(/:/g, "/"));

    if (fallbackKeysToDelete.length) {
      removed += await deleteCacheKeys(fallbackKeysToDelete);
    }
  }

  return useApiResponse({ success: true, removed });
});
