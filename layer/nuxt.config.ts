import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { NitroConfig } from "nitropack";
import { defineNuxtConfig } from "nuxt/config";

const currentDir = dirname(fileURLToPath(import.meta.url));

// import { version } from "./package.json";
import { resolveEnvironment, resolveTurnstile } from "./config/helpers";
import { app } from "./config/head";
import identity from "./config/identity";
import { SITE_MCP_BROWSER_REDIRECT, SITE_MCP_ROUTE } from "./config/siteMcp";

// Runtime environments
const { environment, isDebug, isProd, isPreview, isDev, isTest } = resolveEnvironment(
  process.env.MODE
);

// Resolve Turnstile keys
const { turnstileSiteKey, turnstileSecretKey } = resolveTurnstile(environment);

const appUrl = process.env.NUXT_PUBLIC_SITE_URL;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $meta: {
    name: "docus-plus"
  },
  extends: ["docus"],
  devtools: { enabled: true },

  modules: [
    join(currentDir, "./modules/ai"),
    "nuxt-schema-org",
    "@nuxtjs/turnstile",
    "@nuxtjs/plausible"
  ],

  hooks: {
    /**
     * Docus registers its assistant endpoint with `addServerHandler`, which
     * can take precedence over the application route at the same path.
     * Remove only Docus's duplicate so the local implementation owns it.
     */
    "nitro:config"(nitroConfig: NitroConfig) {
      const assistantApiPath = "/api/assistent";

      nitroConfig.handlers = nitroConfig.handlers?.filter(
        (handler: NonNullable<NitroConfig["handlers"]>[number]) =>
          handler?.route !== assistantApiPath ||
          !String(handler?.handler).includes("/docus/modules/assistant/")
      );
    }
  },

  components: [
    {
      path: join(currentDir, "./app/components"),
      pathPrefix: false
    }
  ],

  app: {
    keepalive: true,
    head: app.head
  },

  vite: {
    optimizeDeps: {
      include: [
        "@plausible-analytics/tracker",
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "zod",
        "@unhead/schema-org/vue",
        "class-variance-authority",
        "clsx",
        "tailwind-merge"
      ]
    }
  },

  nitro: {
    experimental: {
      asyncContext: true
    },
    minify: !isDebug,
    prerender: {
      ignore: ["/dev"]
    }
  },

  debug: {
    nitro: isDebug,
    hydration: isDebug || isDev || isPreview,
    watchers: isDebug || isDev,
    router: isDebug,
    templates: isDebug,
    modules: isDebug,
    hooks: {
      server: isDebug,
      client: isDebug
    }
  },

  $development: {
    routeRules: {
      "/**": { cache: false }
    }
  },

  site: {
    url: appUrl,
    titleSeparator: "|",
    defaultLocale: "en", // not needed if you have @nuxtjs/i18n installed
    language: "en_US",
    indexable: isProd && process.env.DISABLE_INDEXING !== "true",
    trailingSlash: false
  },

  docus: {
    assistant: {
      // API endpoint path
      apiPath: "/api/assistent"
    }
  },

  mcp: {
    route: SITE_MCP_ROUTE,
    browserRedirect: SITE_MCP_BROWSER_REDIRECT
  },

  turnstile: {
    siteKey: turnstileSiteKey,
    secretKey: turnstileSecretKey
  },

  schemaOrg: {
    identity: isTest ? undefined : identity
  },

  robots: {
    groups: [
      {
        userAgent: "*",
        allow: "/",
        contentUsage: {
          bots: "y",
          "train-ai": "n",
          "ai-output": "y",
          search: "y"
        },
        contentSignal: {
          search: "yes",
          "ai-input": "yes",
          "ai-train": "no"
        }
      }
    ]
  },

  icon: {
    serverBundle: {
      collections: ["lucide", "simple-icons", "bxl", "vscode-icons"]
    }
  },

  fonts: {
    families: [
      { name: "Figtree", weights: [400, 700], global: true },
      { name: "JetBrains Mono", weights: [400, 700], global: true }
    ]
  },

  ogImage: {
    zeroRuntime: false
  },

  plausible: {
    domain: process.env.PLAUSIBLE_DOMAIN || (appUrl ? new URL(appUrl).host : undefined),
    // https://github.com/nuxt-modules/plausible?tab=readme-ov-file#proxy-configuration
    proxy: true,
    proxyBaseEndpoint: "/api/_plausible",
    ignoredHostnames: ["localhost"],
    autoPageviews: true,
    autoOutboundTracking: true
  },

  healthcheck: {
    // TODO add mistral health check
    cache: {
      threshold: {
        warn: 50,
        error: 200
      }
    }
  },

  runtimeConfig: {
    apiToken: process.env.API_TOKEN,
    mistral: {
      apiKey: process.env.MISTRAL_API_KEY
    },
    buildDate: new Date().toISOString(),
    public: {
      siteUrl: appUrl,
      mode: {
        isDev,
        isProd,
        isPreview,
        isDebug,
        isTest,
        value: environment
      },
      tracking: {
        disabled: process.env.DISABLE_TRACKING === "true"
      }
    }
  }
});
