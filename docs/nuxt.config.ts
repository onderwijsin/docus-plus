import { varlockVitePlugin } from "@varlock/vite-integration";

export default defineNuxtConfig({
  extends: ["@onderwijsin/docus-plus"],

  site: {
    name: "Docus Plus",
    url: "https://docus-plus.onderwijsin.nl",
    description: "An opinionated Nuxt layer for polished documentation sites.",
    indexable: true
  },

  mcp: {
    name: "Docus Plus documentation",
    description: "Read-only documentation discovery for Docus Plus."
  },

  vite: {
    // Layer source is compiled from the workspace, but its tsconfig references
    // generated layer-local Nuxt files that are not present in this app build.
    // Type checking still uses the packages' tsconfig files via `nuxt typecheck`.
    esbuild: {
      tsconfigRaw: "{}"
    },
    plugins: [varlockVitePlugin({ ssrInjectMode: "auto-load" })]
  },

  openApi: {
    configurations: [
      {
        title: "Example API Reference",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
        pathRouting: {
          basePath: "/"
        }
      },
      {
        title: "Another API Reference",
        // url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
        url: "https://registry.scalar.com/@onderwijsin/apis/dynamic-onderwijsloket-api-specification@latest",
        pathRouting: {
          basePath: "/v1"
        },
        badge: {
          label: "deprecated",
          color: "neutral",
          variant: "soft",
          size: "xs"
        }
      }
    ]
  },

  scalar: {
    metaData: {
      title: "Docus Plus"
    },
    slug: "scalar-galaxy"
  }
});
