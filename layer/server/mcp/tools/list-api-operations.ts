import { listApiResources } from "../utils/api-content";

export default defineMcpTool({
  description: `Lists the API operations documented by this site.

WHEN TO USE: Use this tool to discover endpoints when you do not yet know their exact HTTP method and OpenAPI path. After identifying an endpoint, use get-api-operation for its generated reference content.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {},
  inputExamples: [{}],
  cache: "1h",
  handler: async () => {
    try {
      return await listApiResources(useEvent(), "operation");
    } catch {
      throw createError({ statusCode: 500, message: "Failed to list API operations" });
    }
  }
});
