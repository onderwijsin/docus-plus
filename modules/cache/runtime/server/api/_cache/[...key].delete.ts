import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import { cacheKeyParamSchema } from "../../../utils/schema";
import { deleteCacheKeys, toCacheStorageKey } from "../../utils/storage";

/**
 * Deletes one cache entry by key.
 */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const paramResult = cacheKeyParamSchema.safeParse({
    key: getRouterParam(event, "key") ?? ""
  });
  if (!paramResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid key",
      data: z.treeifyError(paramResult.error)
    });
  }

  await deleteCacheKeys([toCacheStorageKey(paramResult.data.key)]);

  return useApiResponse({ success: true });
});
