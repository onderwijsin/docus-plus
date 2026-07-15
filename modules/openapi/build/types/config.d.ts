import type { ModuleOptions as ScalarModuleOptions } from "@scalar/nuxt";
import type { BadgeProps } from "@nuxt/ui";
import type { ScalarReference } from "../openapi";

type DocusScalarConfiguration = ScalarModuleOptions["configurations"][number] & {
  indexed?: boolean;
  excludeFromSearch?: boolean;
  badge?: BadgeProps;
};
type DocusScalarOptions = Omit<Partial<ScalarModuleOptions>, "configurations"> & {
  configurations?: DocusScalarConfiguration[];
};

declare module "nuxt/schema" {
  interface NuxtConfig {
    scalar?: DocusScalarOptions;
  }

  interface NuxtOptions {
    scalar?: DocusScalarOptions;
  }

  interface PublicRuntimeConfig {
    scalar: {
      enabled: boolean;
      references: ScalarReference[];
    };
  }
}

export {};
