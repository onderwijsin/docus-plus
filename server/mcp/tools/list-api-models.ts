import { listApiResources } from "../utils/api-content";

export default defineMcpTool({
  description: `Lists the named API models documented by this site.

WHEN TO USE: Use this tool to discover schemas and their descriptions. After identifying a model by name, use get-api-model for its generated reference content.`,
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
      return await listApiResources(useEvent(), "schema");
    } catch {
      throw createError({ statusCode: 500, message: "Failed to list API models" });
    }
  }
});
