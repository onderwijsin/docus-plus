import { SITE_MCP_DESCRIPTION, SITE_MCP_NAME } from "./config/siteMcp";
import { OPENAPI_DOCUMENT_SLUG } from "./config/openapi";
import { APP_IDENTITY } from "./config/constants";

export default defineNuxtConfig({
  extends: [".."],

  vite: {
    // plugins: [varlockVitePlugin({ ssrInjectMode: "auto-load" })],
  },

  site: {
    name: APP_IDENTITY.siteTitle,
    description: APP_IDENTITY.siteDescription
  },

  mcp: {
    name: SITE_MCP_NAME,
    description: SITE_MCP_DESCRIPTION
  },

  scalar: {
    metaData: {
      title: APP_IDENTITY.siteTitle
    },
    slug: OPENAPI_DOCUMENT_SLUG,
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
  }
});
