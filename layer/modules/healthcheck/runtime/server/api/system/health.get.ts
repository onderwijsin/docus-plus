import { useApiResponse } from "#layers/docus-plus/server/utils/api";
import { setResponseStatus } from "h3";

import { getSystemHealth } from "../../utils/health";

export default defineEventHandler(async (event) => {
  const health = await getSystemHealth(event);

  setResponseStatus(event, health.status === "error" ? 503 : 200);

  return useApiResponse(health);
});
