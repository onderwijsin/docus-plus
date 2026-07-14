import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import { cacheQuerySchema } from "../../../utils/schema";
import { getCacheKeys, toFullCacheKey } from "../../utils/storage";

/**
 * Lists cache keys, optionally filtered by base.
 *
 * Optional query:
 * - `base=<prefix>`
 * - `metadata=true` to include storage metadata per key
 */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const queryResult = cacheQuerySchema.safeParse(getQuery(event));
  if (!queryResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameters",
      data: z.treeifyError(queryResult.error)
    });
  }

  const keys = await getCacheKeys(queryResult.data.base);

  if (!queryResult.data.metadata) {
    return useApiResponse(keys);
  }

  const storage = useStorage("cache");
  const keysWithMetadata = await Promise.all(
    keys.map(async (key) => ({
      key: toFullCacheKey(key),
      metadata: (await storage.getMeta(key)) ?? null
    }))
  );

  return useApiResponse(keysWithMetadata);
});
