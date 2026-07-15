import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  smoothStream,
  streamText,
  toUIMessageStream,
  type ToolSet
} from "ai";
import { createMCPClient } from "@ai-sdk/mcp";
import type { H3Event } from "h3";
import { createMistral } from "@ai-sdk/mistral";

import { getSystemPrompt } from "../../utils/ai/system";

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
  const aiConfig = config.ai;
  const maxSteps = aiConfig.maxSteps;

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

  const result = streamText({
    model: mistral(aiConfig.model),
    maxOutputTokens: aiConfig.maxOutputTokens,
    maxRetries: aiConfig.maxRetries,
    abortSignal: abortController.signal,
    temperature: aiConfig.temperature,
    topP: aiConfig.topP,
    topK: aiConfig.topK,
    presencePenalty: aiConfig.presencePenalty,
    frequencyPenalty: aiConfig.frequencyPenalty,
    stopSequences: aiConfig.stopSequences,
    seed: aiConfig.seed,
    timeout: aiConfig.timeout,
    headers: aiConfig.headers,
    stopWhen: isStepCount(maxSteps),
    toolChoice: aiConfig.toolChoice,
    activeTools: aiConfig.activeTools,
    toolOrder: aiConfig.toolOrder,
    include: aiConfig.include,
    // On the last allowed step, disable tools so the model is forced to
    // produce a final text answer instead of stopping mid tool-calling.
    prepareStep: ({ stepNumber }) => {
      return stepNumber >= maxSteps - 1 ? { toolChoice: "none" } : {};
    },
    providerOptions: aiConfig.providerOptions,
    instructions: aiConfig.systemPrompt ?? getSystemPrompt(siteName),
    messages: await convertToModelMessages(messages),
    tools: mcpTools as ToolSet,
    experimental_transform: aiConfig.smoothStream
      ? smoothStream({
          delayInMs: aiConfig.smoothStreamDelayInMs,
          chunking: aiConfig.smoothStreamChunking
        })
      : undefined,
    onEnd: closeMcp,
    onAbort: closeMcp,
    onError: closeMcp
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: aiConfig.sendReasoning,
      sendSources: aiConfig.sendSources,
      sendStart: aiConfig.sendStart,
      sendFinish: aiConfig.sendFinish
    })
  });
});
