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
  }
});
