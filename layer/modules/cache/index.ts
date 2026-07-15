import type { ModuleOptions, ResolvedModuleOptions } from "./runtime/types/options";

import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

import { moduleSetup, usePrepareMode } from "#layers/docus-plus/config/modules";
import {
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger
} from "@nuxt/kit";
import { defu } from "defu";

import { resolveRuntime } from "../resolve-runtime/utils";
import { buildRedisConfig, hasRedisConfig, pickSerializableDriverOptions } from "./utils";

const MODULE_NAME = "@onderwijsin/nuxt-cache";
const MODULE_KEY = "cache";
const LOG_SCOPE = "cache";

const DEFAULTS: Partial<ModuleOptions> = {
  enabled: true,
  enableRedisInDevelopment: false,
  endpoints: {
    flush: true,
    invalidate: true
  }
};

/**
 * Nuxt cache management module.
 *
 * Registers `/api/_cache/*` admin endpoints backed by Nitro `useStorage('cache')`
 * and injects module runtime config.
 *
 * Also add a custom driver that append `path` meta data to the cache entry
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
    const { isPrepareMode } = usePrepareMode(nuxt);

    const { start, end, isEnabled, options, checkAndGetApiToken } =
      moduleSetup<ResolvedModuleOptions>(MODULE_NAME, MODULE_KEY, userOptions, DEFAULTS, log);

    start();

    // Early exit when module is disabled.
    if (!isEnabled()) {
      return;
    }

    // Resolve admin token once and publish private runtime config for API routes.
    const apiToken = isPrepareMode
      ? ""
      : checkAndGetApiToken({ required: false }, nuxt.options.runtimeConfig);
    const runtime = resolveRuntime();
    const cloudflareOptions = options.cloudflare ?? {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      kvApiToken: process.env.CLOUDFLARE_KV_API_TOKEN,
      cacheNamespaceId: process.env.CLOUDFLARE_CACHE_NAMESPACE_ID
    };

    // Set options to runtimeConfig for runtime access
    nuxt.options.runtimeConfig.cache = {
      apiToken: typeof apiToken === "string" ? apiToken : "",
      cacheMap: options.cacheMap,
      // We dont need to validate the options. Varlock does that for us at the .env.schema level
      cloudflare:
        !nuxt.options.dev && runtime.preset === "cloudflare_module" && !isPrepareMode
          ? cloudflareOptions
          : undefined,
      endpoints: {
        flush: !!options.endpoints?.flush,
        invalidate: !!options.endpoints?.invalidate
      }
    };

    const resolver = createResolver(import.meta.url);
    const runtimeDir = resolver.resolve("./runtime");
    const redisDriverPath = resolver.resolve("./runtime/drivers/redis.mjs");
    const memoryDriverPath = resolver.resolve("./runtime/drivers/memory.mjs");
    const fsDriverPath = resolver.resolve("./runtime/drivers/fs.mjs");
    const cloudflareDriverPath = resolver.resolve("./runtime/drivers/cloudflare-kv-binding.mjs");
    const redisDriver =
      process.platform === "win32" ? pathToFileURL(redisDriverPath).href : redisDriverPath;
    const memoryDriver =
      process.platform === "win32" ? pathToFileURL(memoryDriverPath).href : memoryDriverPath;
    const fsDriver = process.platform === "win32" ? pathToFileURL(fsDriverPath).href : fsDriverPath;
    const cloudflareDriver =
      process.platform === "win32"
        ? pathToFileURL(cloudflareDriverPath).href
        : cloudflareDriverPath;

    // Ensure runtime code is transpiled and avoid raw ESM path issues in Nitro.
    nuxt.options.build.transpile.push(runtimeDir);

    const existingStorage = nuxt.options.nitro?.storage?.cache ?? null;
    const storageOptions = pickSerializableDriverOptions(existingStorage);
    const existingDevStorage = nuxt.options.nitro?.devStorage?.cache ?? null;
    const devStorageOptions = pickSerializableDriverOptions(existingDevStorage);
    const fsBase =
      typeof devStorageOptions.base === "string" && devStorageOptions.base.length > 0
        ? devStorageOptions.base
        : resolvePath(nuxt.options.buildDir ?? ".nuxt", "cache");

    if (isPrepareMode) {
      log.info("Skipping cache storage driver setup during prepare mode.");
    } else if (process.env.VITEST !== "true") {
      // Our driver requires access to the experimental Async Context feature to access route info
      // https://v2.nitro.build/guide/utils#async-context-experimental
      nuxt.options.nitro = defu(
        {
          experimental: {
            asyncContext: true
          }
        },
        nuxt.options.nitro ?? {}
      );

      if (nuxt.options.dev) {
        nuxt.options.nitro.devStorage = nuxt.options.nitro.devStorage ?? {};
        nuxt.options.nitro.devStorage.cache = {
          ...devStorageOptions,
          base: fsBase,
          driver: fsDriver
        };
      } else if (runtime.preset === "cloudflare_module") {
        nuxt.options.nitro.storage = nuxt.options.nitro.storage ?? {};
        nuxt.options.nitro.storage.cache = {
          ...storageOptions,
          binding: "CACHE",
          driver: cloudflareDriver
        };
      } else {
        const useRedis = hasRedisConfig(options.redis);

        nuxt.options.nitro.storage = nuxt.options.nitro.storage ?? {};
        nuxt.options.nitro.storage.cache = {
          ...storageOptions,
          ...(useRedis ? buildRedisConfig(options.redis!) : {}),
          driver: useRedis ? redisDriver : memoryDriver
        };

        log.info(
          useRedis
            ? "Using the configured Redis cache driver."
            : "No Redis configuration found; using the Nitro memory cache driver."
        );
      }
    }

    // Register module runtime server routes and runtime config typings.
    addServerScanDir(`${runtimeDir}/server`);
    addTypeTemplate({
      filename: "types/cache-config.d.ts",
      src: resolver.resolve(runtimeDir, "types/config.d.ts")
    });
    addTypeTemplate({
      filename: "types/cache-runtime-config-shape.d.ts",
      src: resolver.resolve(runtimeDir, "types/cache-runtime-config-shape.d.ts")
    });

    nuxt.options.routeRules = nuxt.options.routeRules ?? {};
    // Cache management endpoints must always bypass Nitro route caching/prerendering.
    nuxt.options.routeRules["/api/_cache/**"] = {
      ...(nuxt.options.routeRules["/api/_cache/**"] || {}),
      cache: false,
      prerender: false
    };

    end();
  }
});
