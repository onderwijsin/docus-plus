import type { CacheRuntimeConfigShape } from "../types/cache-runtime-config-shape";

declare module "nuxt/schema" {
  interface RuntimeConfig {
    cache: CacheRuntimeConfigShape["cache"];
  }
}

export {};
