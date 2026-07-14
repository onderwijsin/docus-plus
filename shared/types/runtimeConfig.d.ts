import type { Environment } from "./environment";

declare module "nuxt/schema" {
  interface SharedRuntimeConfig {
    apiToken: string;
    directus: {
      baseUrl?: string;
      publicToken?: string;
    };
    mistral: {
      apiKey: string;
    };
  }
  interface SharedPublicRuntimeConfig {
    siteUrl: string;
    mode: {
      isDev: boolean;
      isProd: boolean;
      isPreview: boolean;
      isDebug: boolean;
      isTest: boolean;
      value: Environment;
    };
  }
}

export {};
