import type { Environment } from "./environment";
import type { AssistantAiConfig } from "./ai";

declare module "nuxt/schema" {
  interface SharedRuntimeConfig {
    apiToken: string;
    mistral: {
      apiKey: string;
    };
    ai: AssistantAiConfig;
  }
  interface SharedPublicRuntimeConfig {
    siteUrl: string;
    buildDate: string;
    publishedDate?: string;
    mode: {
      isDev: boolean;
      isProd: boolean;
      isPreview: boolean;
      isDebug: boolean;
      isTest: boolean;
      value: Environment;
    };
    tracking: {
      disabled: boolean;
    };
  }
}

export {};
