import type { OpenApiSourceMenuItem } from "../../modules/openapi/build/openapi";

declare module "nuxt/schema" {
  interface AppConfigInput {
    openApiSources?: OpenApiSourceMenuItem[];
    statusPage?: string;
    publisher: {
      name: string;
      url: string;
      contact?: string;
    };
    newsletter: {
      title: string;
      description: string;
    };
  }
  interface AppConfig {
    openApiSources: OpenApiSourceMenuItem[];
    statusPage?: string;
    publisher: {
      name: string;
      url: string;
      contact?: string;
    };
    newsletter: {
      title: string;
      description: string;
    };
  }
}

export {};
