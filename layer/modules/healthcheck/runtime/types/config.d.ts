import type { HealthcheckRuntimeConfigShape } from "./healthcheck-runtime-config-shape";

declare module "nuxt/schema" {
  interface RuntimeConfig {
    healthcheck: HealthcheckRuntimeConfigShape["healthcheck"];
  }
}

export {};
