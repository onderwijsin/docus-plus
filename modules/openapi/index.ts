import type { ModuleOptions } from "./build/types/options";
import type { ModuleOptions as ScalarModuleOptions } from "@scalar/nuxt";

import { moduleSetup } from "#layers/docus-plus/config/modules";
import { SCALAR_BASE_PATH } from "#layers/docus-plus/config/constants";
import {
  getOpenApiScalarUrl,
  getOpenApiSource,
  hasOpenApiSource,
} from "./build/openapi";
import {
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger,
} from "@nuxt/kit";
import { ofetch } from "ofetch";

const MODULE_NAME = "@onderwijsin/nuxt-openapi";
const MODULE_KEY = "openApi";
const LOG_SCOPE = "openapi";

const DEFAULTS = {
  enabled: true,
} satisfies ModuleOptions;

const scalarConfig: Partial<ScalarModuleOptions> = {
  theme: "none",
  darkMode: true,
  hideModels: false,
  customFetch: ofetch as typeof fetch,
  searchHotKey: undefined,
  showSidebar: true,
  pathRouting: {
    basePath: SCALAR_BASE_PATH,
  },
  hideSearch: true,
  hideDarkModeToggle: true,
  agent: {
    disabled: true,
  },
  mcp: {
    disabled: true,
  },
  hideClientButton: true,
  url: hasOpenApiSource() ? getOpenApiScalarUrl(getOpenApiSource()) : undefined,
};

/**
 * Configures Scalar from the OpenAPI environment variables.
 *
 * The API reference remains unavailable unless both `OPENAPI_SOURCE_TYPE` and
 * `OPENAPI_LOCATION` are present, so consumers can use this layer unchanged
 * with and without an API reference.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: MODULE_KEY,
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: DEFAULTS,
  moduleDependencies: hasOpenApiSource()
    ? {
        "@scalar/nuxt": {
          defaults: scalarConfig,
        },
      }
    : {},
  setup(userOptions, nuxt) {
    const log = useLogger(LOG_SCOPE);
    const { start, end, isEnabled } = moduleSetup<ModuleOptions>(
      MODULE_NAME,
      MODULE_KEY,
      userOptions,
      DEFAULTS,
      log,
    );

    start();

    const resolver = createResolver(import.meta.url);
    addTypeTemplate({
      filename: "types/openapi-config.d.ts",
      src: resolver.resolve("./build/types/config.d.ts"),
    });

    const isConfigured = isEnabled() && hasOpenApiSource();

    nuxt.options.runtimeConfig.public.scalar = {
      enabled: isConfigured,
    };

    nuxt.options.routeRules ??= {};
    nuxt.options.routeRules[SCALAR_BASE_PATH] = isConfigured
      ? {
          ...nuxt.options.routeRules[SCALAR_BASE_PATH],
          ssr: false,
        }
      : {
          ...nuxt.options.routeRules[SCALAR_BASE_PATH],
          redirect: "/",
        };

    if (!isConfigured) {
      end();
      return;
    }

    end();
  },
});
