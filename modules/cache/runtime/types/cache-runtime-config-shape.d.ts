import type { CacheMap, CloudflareModuleOptions, ModuleOptions } from "./options";

export interface CacheRuntimeConfigShape {
  cache: {
    apiToken: string;
    cacheMap?: CacheMap;
    cloudflare?: CloudflareModuleOptions;
    endpoints?: ModuleOptions["endpoints"];
  };
}
