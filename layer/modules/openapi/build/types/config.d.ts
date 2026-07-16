import type { ScalarReference } from "../openapi";

interface DocusScalarRuntimeConfig {
  enabled: boolean;
  references: ScalarReference[];
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    scalar: DocusScalarRuntimeConfig;
  }
}

declare module "nuxt/schema" {
  interface PublicRuntimeConfig {
    scalar: DocusScalarRuntimeConfig;
  }
}

export {};
