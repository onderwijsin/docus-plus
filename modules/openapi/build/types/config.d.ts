import type { ModuleOptions as ScalarModuleOptions } from "@scalar/nuxt";

declare module "nuxt/schema" {
  interface NuxtConfig {
    scalar?: Partial<ScalarModuleOptions>;
  }

  interface NuxtOptions {
    scalar?: Partial<ScalarModuleOptions>;
  }

  interface PublicRuntimeConfig {
    scalar: {
      enabled: boolean;
    };
  }
}

export {};
