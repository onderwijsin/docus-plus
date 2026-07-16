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
    plugins: [varlockVitePlugin({ ssrInjectMode: "auto-load" })]
  },

  openApi: {
    configurations: [
      {
        title: "Scalar Galaxy API",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
        pathRouting: {
          basePath: "/"
        }
      },
      {
        title: "PokéAPI",
        url: "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/openapi.yml",
        pathRouting: {
          basePath: "/v1"
        },
        badge: {
          label: "new",
          color: "success",
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
