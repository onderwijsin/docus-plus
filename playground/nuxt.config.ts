export default defineNuxtConfig({
  extends: ["@onderwijsin/docus-plus"],

  site: {
    name: "Docus Plus Playground",
    description: "A compact integration harness for Docus Plus features."
  },

  mcp: {
    name: "Docus Plus Playground",
    description: "Feature-complete local documentation integration testing."
  },

  openApi: {
    configurations: [
      {
        title: "Galaxy YAML",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=yaml",
        pathRouting: { basePath: "/yaml" }
      },
      {
        title: "Galaxy JSON",
        url: "https://registry.scalar.com/@scalar/apis/galaxy?format=json",
        pathRouting: { basePath: "/json" },
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
      title: "Docus Plus Playground API"
    },
    slug: "api-reference"
  }
});
