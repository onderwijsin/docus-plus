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
    mailchimp: {
      apiKey?: string;
      listId?: string;
      server?: string;
    };
  }
  interface SharedPublicRuntimeConfig {
    siteUrl: string;
    mcp: {
      siteName: string;
      siteDescription: string;
    };
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
