import { defineNuxtModule } from "@nuxt/kit";
import { defu } from "defu";

import type { AssistantAiConfig } from "../../shared/types/ai";

const DEFAULTS: AssistantAiConfig = {
  model: "mistral-medium-latest",
  reasoning: "high",
  maxOutputTokens: 8000,
  maxRetries: 2,
  maxSteps: 10,
  providerOptions: {
    gateway: {
      caching: "auto"
    }
  },
  smoothStream: true,
  smoothStreamDelayInMs: 10,
  smoothStreamChunking: "word",
  sendReasoning: true,
  sendSources: false,
  sendStart: true,
  sendFinish: true
};

export default defineNuxtModule<Partial<AssistantAiConfig>>({
  meta: {
    name: "docus-plus-ai",
    configKey: "ai",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0"
    }
  },
  defaults: DEFAULTS,
  setup(options, nuxt) {
    nuxt.options.runtimeConfig.ai = defu(nuxt.options.runtimeConfig.ai ?? {}, options);
  }
});
