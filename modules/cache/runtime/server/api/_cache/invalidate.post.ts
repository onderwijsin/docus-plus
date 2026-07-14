import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { isAdmin } from "#layers/docus-plus/server/utils/security/admin";
import { z } from "zod";

import {
  cacheClearBodySchema,
  cacheClearQuerySchema,
} from "../../../utils/schema";
import {
  clearCacheBase,
  clearEntireCache,
  normalizeSegment,
} from "../../utils/storage";

/**
 * Invalidates cache content.
 *
 * This endpoint is kept for backwards compatibility and mirrors clear behavior.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event).cache;
  if (!config.endpoints?.invalidate) {
    throw createError({
      statusCode: 403,
      statusMessage: "Invalidate endpoint is disabled",
    });
  }

  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const queryResult = cacheClearQuerySchema.safeParse(getQuery(event));
  if (!queryResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid query parameters",
      data: z.treeifyError(queryResult.error),
    });
  }

  const bodyResult = cacheClearBodySchema.safeParse(
    (await readBody(event).catch(() => ({}))) ?? {},
  );
  if (!bodyResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid body",
      data: z.treeifyError(bodyResult.error),
    });
  }

  const queryBases = queryResult.data.bases
    ? queryResult.data.bases
        .split(",")
        .map((base: string) => base.trim())
        .filter(Boolean)
    : [];

  const bases = (
    bodyResult.data.bases && bodyResult.data.bases.length
      ? bodyResult.data.bases
      : queryBases
  )
    .map((base: string) => normalizeSegment(base))
    .filter(Boolean);

  if (!bases.length) {
    const cleared = await clearEntireCache();
    return useApiResponse({ message: "Cache invalidated.", cleared });
  }

  const results = await Promise.all(
    bases.map(async (base) => ({
      base,
      cleared: await clearCacheBase(base),
    })),
  );

  return useApiResponse({
    message: "Cache invalidated.",
    bases: results,
  });
});
