import { getIcon } from "#layers/docus-plus/shared/utils/icons";
import type { AppConfigInput } from "nuxt/schema";

export default defineAppConfig({
  publisher: {
    name: "Stichting Onderwijs in",
    url: "https://onderwijsin.nl",
    contact: "https://onderwijsin.nl/contact"
  },

  search: {
    fts: true
  },
  socials: {
    github: "https://github.com/onderwijsin"
  },
  // @ts-expect-error upstream type mismatch
  github: false,
  toc: {
    // Rename the title of the table of contents
    title: "On this page",
    // Add a bottom section to the table of contents
    bottom: {
      title: "Further Reading",
      links: [
        {
          icon: getIcon("mail"),
          label: "Newsletter",
          to: "https://onderwijsin.nl/nieuwsbrief",
          target: "_blank"
        }
      ]
    }
  },
  assistant: {
    // Show the floating input on documentation pages
    floatingInput: true,
    // Show the "Explain with AI" button in the sidebar
    explainWithAi: true
  },

  ui: {
    colors: {
      neutral: "zinc"
    },
    page: {
      slots: {
        root: "flex flex-col lg:grid lg:grid-cols-10 lg:gap-10",
        left: "lg:col-span-2",
        center: "lg:col-span-8",
        right: "lg:col-span-2 order-first lg:order-last"
      }
    },
    footer: {
      slots: {
        root: "relative"
      }
    }
  } as unknown as AppConfigInput["ui"]
});
