import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import { cacheKeyParamSchema, cacheQuerySchema } from "../../../utils/schema";
import { toCacheStorageKey, toFullCacheKey } from "../../utils/storage";

/**
 * Returns a cache value by key.
 *
 * Optional query:
 * - `metadata=true` includes storage metadata.
 */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const paramResult = cacheKeyParamSchema.safeParse({
    key: getRouterParam(event, "key") ?? "",
  });
  if (!paramResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid key",
      data: z.treeifyError(paramResult.error),
    });
  }

  const queryResult = cacheQuerySchema.safeParse(getQuery(event));
  if (!queryResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameters",
      data: z.treeifyError(queryResult.error),
    });
  }

  const storageKey = toCacheStorageKey(paramResult.data.key);
  const item = await useStorage("cache").getItem(storageKey);

  if (item === null) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  if (queryResult.data.metadata) {
    const metadata = await useStorage("cache").getMeta(storageKey);
    return useApiResponse({
      key: toFullCacheKey(storageKey),
      value: item,
      metadata: metadata ?? null,
    });
  }

  return useApiResponse({ key: toFullCacheKey(storageKey), value: item });
});
