import { streamText, convertToModelMessages, stepCountIs, smoothStream, type ToolSet } from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import type { H3Event } from "h3";
import { createMistral } from "@ai-sdk/mistral";

import { getSystemPrompt } from "../../utils/ai/system";

const MAX_STEPS = 10;

function createLocalFetch(event: H3Event): typeof fetch {
  const origin = getRequestURL(event).origin;

  return (input, init) => {
    const requestUrl =
      input instanceof URL
        ? input
        : typeof input === "string"
          ? new URL(input, origin)
          : new URL(input.url);
    const localPath =
      requestUrl.origin === origin
        ? `${requestUrl.pathname}${requestUrl.search}`
        : requestUrl.toString();

    return event.fetch(localPath, init);
  };
}

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event);
  const config = useRuntimeConfig();
  const siteConfig = getSiteConfig(event);

  const siteName = siteConfig.name || "Documentation";

  const mcpServer = config.assistant.mcpServer;
  const isExternalUrl = mcpServer.startsWith("http://") || mcpServer.startsWith("https://");
  const baseURL = config.app?.baseURL?.replace(/\/$/, "") || "";

  const mistral = createMistral({ apiKey: config.mistral.apiKey });

  const abortController = new AbortController();
  event.node.req.on("close", () => abortController.abort());

  let transport: Parameters<typeof createMCPClient>[0]["transport"];
  if (isExternalUrl) {
    transport = {
      type: "http",
      url: mcpServer
    };
  } else if (import.meta.dev) {
    transport = {
      type: "http",
      url: `http://localhost:3000${baseURL}${mcpServer}`
    };
  } else {
    transport = {
      type: "http",
      url: `${getRequestURL(event).origin}${baseURL}${mcpServer}`,
      fetch: createLocalFetch(event)
    };
  }

  const httpClient = await createMCPClient({ transport });
  const mcpTools = await httpClient.tools();

  const closeMcp = () => event.waitUntil(httpClient.close());

  return streamText({
    model: mistral("mistral-medium-latest"),
    maxOutputTokens: 8000,
    maxRetries: 2,
    abortSignal: abortController.signal,
    stopWhen: stepCountIs(MAX_STEPS),
    // On the last allowed step, disable tools so the model is forced to
    // produce a final text answer instead of stopping mid tool-calling.
    prepareStep: ({ stepNumber }) => {
      return stepNumber >= MAX_STEPS - 1 ? { toolChoice: "none" } : {};
    },
    providerOptions: {
      gateway: {
        caching: "auto"
      }
    },
    system: getSystemPrompt(siteName),
    messages: await convertToModelMessages(messages),
    tools: mcpTools as ToolSet,
    experimental_transform: smoothStream(),
    onFinish: closeMcp,
    onAbort: closeMcp,
    onError: closeMcp
  }).toUIMessageStreamResponse();
});
