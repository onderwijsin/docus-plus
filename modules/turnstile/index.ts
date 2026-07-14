import type { ModuleOptions } from "./runtime/types/options";

import { moduleSetup } from "#layers/docus-plus/config/modules";
import {
  addImportsDir,
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger
} from "@nuxt/kit";
import { defu } from "defu";

const MODULE_NAME = "@onderwijsin/nuxt-turnstile";
const MODULE_KEY = "turnstile";
const LOG_SCOPE = "turnstile";

const DEFAULTS = {
  enabled: true,
  siteKey: "",
  secretKey: ""
} satisfies ModuleOptions;

/**
 * Nuxt Turnstile integration module.
 *
 * Owns the shared runtime config, composable, server validation utility, and
 * request-header contract used by Turnstile-protected routes.
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
    const siteKey = options.siteKey ?? "";
    const secretKey = options.secretKey ?? "";
    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.runtimeConfig.turnstile = defu(nuxt.options.runtimeConfig.turnstile ?? {}, {
      secretKey
    });
    nuxt.options.runtimeConfig.public.turnstile ??= defu(
      nuxt.options.runtimeConfig.public.turnstile,
      {
        siteKey
      }
    );
    const optionsWithTurnstile = nuxt.options as typeof nuxt.options & {
      turnstile?: unknown;
    };
    optionsWithTurnstile.turnstile = defu(
      typeof optionsWithTurnstile.turnstile === "object" && optionsWithTurnstile.turnstile
        ? optionsWithTurnstile.turnstile
        : {},
      {
        siteKey
      }
    );

    addImportsDir(resolver.resolve(runtimeDir, "composables"));
    addServerScanDir(resolver.resolve(runtimeDir, "server"));
    addTypeTemplate({
      filename: "types/turnstile-config.d.ts",
      src: resolver.resolve(runtimeDir, "types/config.d.ts")
    });

    end();
  }
});
