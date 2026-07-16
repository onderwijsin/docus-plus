import { APP_IDENTITY } from "./constants";

// Uncomment this if you want to use Varlock!
// import { varlockVitePlugin } from "varlock/vite";

export default defineNuxtConfig({
  extends: ["@onderwijsin/docus-plus"],

  vite: {
    // Uncomment this if you want to use Varlock!
    // plugins: [varlockVitePlugin({ ssrInjectMode: "auto-load" })],
  },

  site: {
    name: APP_IDENTITY.siteTitle,
    description: APP_IDENTITY.siteDescription
  },

  mcp: {
    name: "Example Docs Public MCP",
    description:
      "Read-only content discovery for Example Docs, including guides and reference materials."
  },

  openApi: {
    configurations: [
      {
        title: "yaml",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
        pathRouting: {
          basePath: "/yaml"
        }
      },
      {
        title: "json",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=json",
        pathRouting: {
          basePath: "/json"
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
      title: APP_IDENTITY.siteTitle
    },
    slug: "example-api-reference"
  }
});
