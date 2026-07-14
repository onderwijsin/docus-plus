import type {
  ModuleOptions,
  ResolvedModuleOptions,
} from "./runtime/types/options";
import { moduleSetup, usePrepareMode } from "#layers/docus-plus/config/modules";

import {
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  extendRouteRules,
  useLogger,
} from "@nuxt/kit";
import { defu } from "defu";

import { resolveRuntime, resolveRuntimeNitroConfig } from "./utils";

const MODULE_NAME = "@onderwijsin/resolve-runtime";
const MODULE_KEY = "resolveRuntime";
const LOG_SCOPE = "resolve-runtime";

const DEFAULTS = {
  enabled: true,
} satisfies Partial<ModuleOptions>;

/**
 * Resolves the active Nitro runtime and applies runtime-specific Nuxt/Nitro config.
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
  setup(userOptions, nuxt) {
    const log = useLogger(LOG_SCOPE);
    const { isPrepareMode } = usePrepareMode(nuxt);
    const { start, end, isEnabled } = moduleSetup<ResolvedModuleOptions>(
      MODULE_NAME,
      MODULE_KEY,
      userOptions,
      DEFAULTS,
      log,
    );

    start();

    if (!isEnabled()) {
      return;
    }

    const runtime = resolveRuntime();
    const runtimeConfig = resolveRuntimeNitroConfig(runtime, { isPrepareMode });
    const resolver = createResolver(import.meta.url);
    const runtimeDir = resolver.resolve("./runtime");

    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.nitro = defu(runtimeConfig, nuxt.options.nitro ?? {});
    nuxt.options.runtimeConfig.resolveRuntime = runtime;

    if (runtime.preset === "node-server") {
      // If node server, and not development environment, enable immutable cache for assets
      if (process.env.MODE !== "development") {
        const assetRoutes = ["/_nuxt/**", "/_fonts/**"];
        const lifetime = 31536000; // 1 year in seconds
        const cacheControlHeader = `public, max-age=${lifetime}, s-maxage=${lifetime}, immutable`;

        for (const route of assetRoutes) {
          extendRouteRules(route, {
            cache: {
              maxAge: lifetime,
              swr: true,
            },
            headers: {
              "cache-control": cacheControlHeader,
            },
          });
        }
      }
    }

    addTypeTemplate({
      filename: "types/resolve-runtime-config.d.ts",
      src: resolver.resolve(runtimeDir, "types/config.d.ts"),
    });

    end();
  },
});
