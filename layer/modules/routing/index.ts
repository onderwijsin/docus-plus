import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { defineNuxtModule } from "@nuxt/kit";

/**
 * Prevent Docus's fallback landing page from shadowing the layer's own root
 * page. Docus checks the consuming app's rootDir for index.vue, which does not
 * include this layer's app/pages/index.vue when running the playground.
 */
export default defineNuxtModule({
  meta: {
    name: "@onderwijsin/override-docus-routing",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0"
    }
  },
  setup(_options, nuxt) {
    const layerIndex = resolve(import.meta.dirname, "../../app/pages/index.vue");

    if (!existsSync(layerIndex)) {
      return;
    }

    nuxt.hook("modules:done", () => {
      nuxt.hook("pages:extend", (pages) => {
        const docusLanding = pages.find(
          (page) =>
            page.path === "/" &&
            page.name === "index" &&
            page.file?.includes("/docus/app/templates/landing.vue")
        );

        if (docusLanding) {
          pages.splice(pages.indexOf(docusLanding), 1);
        }
      });
    });
  }
});
