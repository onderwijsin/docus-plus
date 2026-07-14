import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import {
  cacheBaseParamSchema,
  cacheQuerySchema,
} from "../../../../utils/schema";
import { getCacheKeys, normalizeSegment } from "../../../utils/storage";

/**
 * Returns all cache entries under a base prefix.
 */
export default defineEventHandler(async (event) => {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const paramResult = cacheBaseParamSchema.safeParse({
    base: getRouterParam(event, "base") ?? "",
  });
  if (!paramResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid base",
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

  const normalizedBase = normalizeSegment(paramResult.data.base);
  const keys = await getCacheKeys(normalizedBase);
  const storage = useStorage("cache");

  if (!queryResult.data.metadata) {
    const items = await Promise.all(
      keys.map(async (key) => ({
        key,
        value: await storage.getItem(key),
      })),
    );
    return useApiResponse(items);
  }

  const itemsWithMetadata = await Promise.all(
    keys.map(async (key) => ({
      key,
      value: await storage.getItem(key),
      metadata: (await storage.getMeta(key)) ?? null,
    })),
  );

  return useApiResponse(itemsWithMetadata);
});
