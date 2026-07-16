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
  assistant: {
    // Categorized conversation starters to display when chat is empty
    faqQuestions: [
      {
        category: "Getting started",
        items: [
          "How do I add my first documentation page?",
          "Where should I configure my site's identity?",
          "How do I override the default logo?"
        ]
      },
      {
        category: "Content",
        items: [
          "How should I organise content pages?",
          "What belongs in app.config.ts?",
          "How do I add a navigation section?"
        ]
      },
      {
        category: "Styling",
        items: [
          "Where do I add CSS tokens?",
          "How do I customise Nuxt UI colors?",
          "How do I replace AppHeaderLogo?"
        ]
      }
    ]
  },
  newsletter: {
    title: "Keep in touch with the latest",
    description: "Sign up for our monthly deep dives - straight to your inbox."
  },
  ui: {
    colors: {
      primary: "orange",
      neutral: "zinc"
    }
  } as unknown as AppConfigInput["ui"]
});
