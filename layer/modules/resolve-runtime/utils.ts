import type { NitroConfig } from "nitropack/types";
import type { ResolvedRuntime } from "./runtime/types/runtime";

import { z } from "zod";

import { supportedRuntimePresets } from "./runtime/types/runtime";

const runtimePresetSchema = z.enum(supportedRuntimePresets);

const cloudflareRuntimeEnvSchema = z.object({
  accountId: z.string().trim().min(1),
  kvApiToken: z.string().trim().min(1),
  workerName: z.string().trim().min(1),
  cacheNamespaceId: z.string().trim().min(1)
});

type CloudflareRuntimeEnv = {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_KV_API_TOKEN?: string;
  CLOUDFLARE_WORKER_NAME?: string;
  CLOUDFLARE_CACHE_NAMESPACE_ID?: string;
};

/**
 * Resolves the active Nitro preset from the environment and defaults to `node-server`.
 *
 * @param nitroPreset - Raw preset value, usually from the build-time `ENV.NITRO_PRESET`.
 * @returns Normalized runtime descriptor.
 * @throws When the preset is provided but not supported by the project.
 */
export function resolveRuntime(nitroPreset: string | undefined = "node-server"): ResolvedRuntime {
  if (!nitroPreset?.trim()) {
    return { preset: "node-server" };
  }

  const parsedPreset = runtimePresetSchema.safeParse(nitroPreset);

  if (!parsedPreset.success) {
    throw new Error(
      `Unsupported NITRO_PRESET "${nitroPreset}". Supported runtimes: ${supportedRuntimePresets.join(", ")}.`
    );
  }

  return {
    preset: parsedPreset.data
  };
}

/**
 * Resolves Cloudflare-specific Nitro preset configuration.
 *
 * During prepare mode, placeholder values are allowed so `nuxt prepare` can complete
 * before deploy-time secrets are available.
 *
 * @param options - Runtime resolution options.
 * @param options.env - Environment source to validate.
 * @param options.isPrepareMode - Whether Nuxt is currently running in prepare mode.
 * @returns Nitro config fragment for the `cloudflare_module` preset.
 * @throws When required Cloudflare environment variables are missing outside prepare mode.
 */
export function resolveCloudflareConfig(
  options: {
    env?: CloudflareRuntimeEnv;
    isPrepareMode?: boolean;
  } = {}
): NitroConfig {
  const { env = process.env, isPrepareMode = false } = options;

  const parsedEnv = cloudflareRuntimeEnvSchema.safeParse({
    accountId: env.CLOUDFLARE_ACCOUNT_ID ?? (isPrepareMode ? "prepare-account-id" : undefined),
    kvApiToken: env.CLOUDFLARE_KV_API_TOKEN ?? (isPrepareMode ? "prepare-kv-api-token" : undefined),
    workerName:
      env.CLOUDFLARE_WORKER_NAME ?? (isPrepareMode ? "prepare-cloudflare-worker" : undefined),
    cacheNamespaceId:
      env.CLOUDFLARE_CACHE_NAMESPACE_ID ?? (isPrepareMode ? "prepare-cache-namespace" : undefined)
  });

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid Cloudflare runtime configuration. Configure CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_KV_API_TOKEN, CLOUDFLARE_WORKER_NAME, and CLOUDFLARE_CACHE_NAMESPACE_ID. CLOUDFLARE_KV_API_TOKEN must include KV namespace read and write access. ${z.prettifyError(parsedEnv.error)}`
    );
  }

  return {
    preset: "cloudflare_module",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: parsedEnv.data.workerName,
        observability: {
          logs: {
            enabled: true,
            head_sampling_rate: 1,
            invocation_logs: true
          }
        },
        kv_namespaces: [
          {
            binding: "CACHE",
            id: parsedEnv.data.cacheNamespaceId
          }
        ]
      }
    }
  };
}

/**
 * Resolves Node-specific Nitro preset configuration.
 *
 * @returns Nitro config fragment for the `node-server` preset.
 */
export function resolveNodeServerConfig(): NitroConfig {
  return {
    preset: "node-server"
  };
}

/**
 * Resolves the Nitro config fragment for the active runtime preset.
 *
 * @param runtime - Resolved project runtime preset.
 * @param options - Runtime-specific resolution options.
 * @returns Nitro config fragment for the active runtime preset.
 */
export function resolveRuntimeNitroConfig(
  runtime: ResolvedRuntime,
  options: {
    env?: CloudflareRuntimeEnv;
    isPrepareMode?: boolean;
  } = {}
): NitroConfig {
  switch (runtime.preset) {
    case "cloudflare_module":
      return resolveCloudflareConfig(options);
    case "node-server":
      return resolveNodeServerConfig();
  }
}
