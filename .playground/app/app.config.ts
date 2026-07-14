import { getIcon } from "#layers/docus-plus/shared/utils/icons";

export default defineAppConfig({
  publisher: {
    name: "Example Team",
    url: "https://example.com",
    contact: "https://example.com/contact",
  },

  seo: {
    title: "Example Docs",
    description: "A small example documentation site built with Docus Plus.",
  },
  toc: {
    // Add a bottom section to the table of contents
    bottom: {
      links: [
        {
          icon: getIcon("github_alt"),
          label: "Code Examples",
          to: "https://github.com/example/example-docs",
          target: "_blank",
        },
        {
          icon: getIcon("code"),
          label: "View Source",
          to: "https://github.com/onderwijsin/docus-plus",
          target: "_blank",
        },
      ],
    },
  },
  assistant: {
    // Categorized conversation starters to display when chat is empty
    faqQuestions: [
      {
        category: "Getting started",
        items: [
          "How do I add my first documentation page?",
          "Where should I configure my site's identity?",
          "How do I override the default logo?",
        ],
      },
      {
        category: "Content",
        items: [
          "How should I organise content pages?",
          "What belongs in app.config.ts?",
          "How do I add a navigation section?",
        ],
      },
      {
        category: "Styling",
        items: [
          "Where do I add CSS tokens?",
          "How do I customise Nuxt UI colors?",
          "How do I replace AppHeaderLogo?",
        ],
      },
    ],
  },

  ui: {
    colors: {
      primary: "pink",
      secondary: "purple",
      neutral: "zinc",
    },
  },
});
