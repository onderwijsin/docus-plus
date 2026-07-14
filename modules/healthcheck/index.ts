import type { ModuleOptions } from "./runtime/types/options";

import { moduleSetup } from "#layers/docus-plus/config/modules";
import {
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger
} from "@nuxt/kit";
import { defu } from "defu";

const MODULE_NAME = "@onderwijsin/nuxt-healthcheck";
const MODULE_KEY = "healthcheck";
const LOG_SCOPE = "healthcheck";

const DEFAULTS = {
  enabled: true
} satisfies ModuleOptions;

/**
 * Nuxt healthcheck module.
 *
 * Exposes public `/api/system/*` endpoints intended for runtime health probes.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: MODULE_KEY,
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0"
    }
  },
  defaults: DEFAULTS,
  // moduleDependencies: {
  //   "~~/modules/cache": {
  //     defaults: {
  //       enabled: true,
  //     },
  //   },
  // },
  setup(userOptions, nuxt) {
    const log = useLogger(LOG_SCOPE);
    const { start, end, isEnabled, options } = moduleSetup<ModuleOptions>(
      MODULE_NAME,
      MODULE_KEY,
      userOptions,
      DEFAULTS,
      log
    );

    start();

    if (!isEnabled()) {
      return;
    }

    const resolver = createResolver(import.meta.url);
    const runtimeDir = resolver.resolve("./runtime");

    nuxt.options.runtimeConfig.healthcheck = defu(nuxt.options.runtimeConfig.healthcheck ?? {}, {
      cache: options.cache,
      directus: options.directus
    });

    nuxt.options.build.transpile.push(runtimeDir);
    addServerScanDir(resolver.resolve(runtimeDir, "server"));
    addTypeTemplate({
      filename: "types/healthcheck-config.d.ts",
      src: resolver.resolve(runtimeDir, "types/config.d.ts")
    });
    addTypeTemplate({
      filename: "types/healthcheck-runtime-config-shape.d.ts",
      src: resolver.resolve(runtimeDir, "types/healthcheck-runtime-config-shape.d.ts")
    });

    nuxt.options.routeRules = nuxt.options.routeRules ?? {};
    nuxt.options.routeRules["/api/system/**"] = {
      ...nuxt.options.routeRules["/api/system/**"],
      cache: false,
      prerender: false
    };

    end();
  }
});
