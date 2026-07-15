import { z } from "zod";
import { getApiOperation } from "../utils/api-content";

export default defineMcpTool({
  description: `Retrieves the generated reference content for one API operation.

WHEN TO USE: Use this tool after list-api-operations, or when the exact HTTP method and OpenAPI path are known. It includes the operation metadata, extracted request and response details, and a Scalar reference URL.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    method: z.string().describe("The operation's HTTP method (for example, GET or POST)"),
    path: z.string().describe("The exact OpenAPI path (for example, /auth/oauth/{provider})")
  },
  inputExamples: [{ method: "GET", path: "/auth/oauth/{provider}" }],
  cache: "1h",
  handler: async ({ method, path }) => {
    try {
      const operation = await getApiOperation(useEvent(), method, path);
      if (!operation) {
        throw createError({ statusCode: 404, message: "API operation not found" });
      }
      return operation;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) throw error;
      throw createError({ statusCode: 500, message: "Failed to get API operation" });
    }
  }
});
