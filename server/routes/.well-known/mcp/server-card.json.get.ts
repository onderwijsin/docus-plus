import { listMcpDefinitions } from "@nuxtjs/mcp-toolkit/server";

/**
 * Public MCP server card used by external agents for discovery.
 */
export default defineEventHandler(async (event) => {
  const { tools, resources, prompts } = await listMcpDefinitions();
  const config = useRuntimeConfig();
  const siteUrl = config.public.siteUrl;
  const siteConfig = getSiteConfig(event);
  const siteName = siteConfig.name || "Documentation";
  const siteDescription =
    siteConfig.siteDescription ||
    `Read-only content discovery for ${siteName}, including guides and reference materials.`;

  return {
    name: siteName,
    description: siteDescription,
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
