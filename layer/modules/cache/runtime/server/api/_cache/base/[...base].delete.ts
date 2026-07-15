import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import { cacheBaseParamSchema } from "../../../../utils/schema";
import { clearCacheBase, normalizeSegment } from "../../../utils/storage";

/**
 * Deletes all cache entries in a base prefix.
 */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const paramResult = cacheBaseParamSchema.safeParse({
    base: getRouterParam(event, "base") ?? ""
  });
  if (!paramResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid base",
      data: z.treeifyError(paramResult.error)
    });
  }

  await clearCacheBase(normalizeSegment(paramResult.data.base));

  return useApiResponse({ success: true });
});
