import { z } from "zod";
import { getApiNamedResource } from "../utils/api-content";

export default defineMcpTool({
  description: `Retrieves the generated reference content for one named API model.

WHEN TO USE: Use this tool after list-api-models, or when the exact schema name is known. It includes the model's extracted fields and descriptions, plus a Scalar reference URL.`,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    name: z.string().describe("The exact OpenAPI schema name from list-api-models")
  },
  inputExamples: [{ name: "User" }],
  cache: "1h",
  handler: async ({ name }) => {
    try {
      const model = await getApiNamedResource(useEvent(), "schema", name);
      if (!model) {
        throw createError({ statusCode: 404, message: "API model not found" });
      }
      return model;
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 404) throw error;
      throw createError({ statusCode: 500, message: "Failed to get API model" });
    }
  }
});
