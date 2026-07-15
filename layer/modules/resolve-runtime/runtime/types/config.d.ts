import type { ResolveRuntimeRuntimeConfigShape } from "./runtime";

declare module "nuxt/schema" {
  interface RuntimeConfig {
    resolveRuntime: ResolveRuntimeRuntimeConfigShape["resolveRuntime"];
  }
}

export {};
