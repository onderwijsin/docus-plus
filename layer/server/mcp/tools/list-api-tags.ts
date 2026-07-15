import { listApiResources } from "../utils/api-content";

export default defineMcpTool({
  description: `Lists the API tags documented by this site.

WHEN TO USE: Use this tool to discover the API's functional groupings. After identifying a tag by name, use get-api-tag for its operation summary and Scalar reference URL.`,
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
      return await listApiResources(useEvent(), "tag");
    } catch {
      throw createError({ statusCode: 500, message: "Failed to list API tags" });
    }
  }
});
