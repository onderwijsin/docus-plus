import type { CacheMap, CloudflareModuleOptions, ModuleOptions } from "./options";

declare module "nuxt/schema" {
  interface RuntimeConfig {
    cache: {
      apiToken: string;
      cacheMap?: CacheMap;
      cloudflare?: CloudflareModuleOptions;
      endpoints?: ModuleOptions["endpoints"];
    };
  }
}

export {};
