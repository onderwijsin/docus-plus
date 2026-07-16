import type { ModuleOptions as ScalarModuleOptions } from "@scalar/nuxt";
import type { BadgeProps } from "@nuxt/ui";

/** A Scalar document configuration extended with Docus Plus indexing metadata. */
export type OpenApiConfiguration = ScalarModuleOptions["configurations"][number] & {
  indexed?: boolean;
  excludeFromSearch?: boolean;
  badge?: BadgeProps;
};

/** Options for the OpenAPI and Scalar integration. */
export type ModuleOptions = {
  /** Enable the integration when an OpenAPI source is configured. */
  enabled: boolean;
  /** API documents to configure in Scalar and expose in the API Explorer menu. */
  configurations?: OpenApiConfiguration[];
};
