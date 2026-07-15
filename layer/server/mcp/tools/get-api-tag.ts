import { z } from "zod";
import { getApiNamedResource } from "../utils/api-content";

export default defineMcpTool({
  description: `Retrieves the generated reference content for one API tag.

WHEN TO USE: Use this tool after list-api-tags, or when the exact tag name is known. It includes the tag's description, associated operation summaries, and a Scalar reference URL.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    name: z.string().describe("The exact OpenAPI tag name from list-api-tags")
  },
  inputExamples: [{ name: "Authentication" }],
  cache: "1h",
  handler: async ({ name }) => {
    try {
      const tag = await getApiNamedResource(useEvent(), "tag", name);
      if (!tag) {
        throw createError({ statusCode: 404, message: "API tag not found" });
      }
      return tag;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) throw error;
      throw createError({ statusCode: 500, message: "Failed to get API tag" });
    }
  }
});
