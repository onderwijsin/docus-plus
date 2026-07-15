import type { AppConfigInput } from "nuxt/schema";

export default defineAppConfig({
  publisher: {
    name: "Stichting Onderwijs in",
    url: "https://onderwijsin.nl"
  },
  seo: {
    title: "Docus Plus",
    description: "A production-ready documentation layer for Nuxt and Docus."
  },
  ui: {
    colors: {
      primary: "pink",
      secondary: "purple",
      neutral: "zinc"
    }
  } as unknown as AppConfigInput["ui"]
});
