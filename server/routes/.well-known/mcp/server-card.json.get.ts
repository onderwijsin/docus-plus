import { listMcpDefinitions } from "@nuxtjs/mcp-toolkit/server";

/**
 * Public MCP server card used by external agents for discovery.
 */
export default defineEventHandler(async () => {
  const { tools, resources, prompts } = await listMcpDefinitions();
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl;

  return {
    name: config.public.mcp.siteName,
    description: config.public.mcp.siteDescription,
    url: `${siteUrl}/mcp`,
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
    })),
    resources: resources.map((resource) => ({
      name: resource.name,
      uri: resource.uri,
      description: resource.description,
    })),
    prompts: prompts.map((prompt) => ({
      name: prompt.name,
      description: prompt.description,
    })),
  };
});
