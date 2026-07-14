import {
  defineNuxtModule,
  addTemplate,
  createResolver,
  useLogger,
} from "@nuxt/kit";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import { resolveModulePath } from "exsolve";
import { moduleSetup } from "#layers/docus-plus/config/modules";

const MODULE_NAME = "@onderwijsin/override-docus-css";
const MODULE_KEY = "docusCss";
const LOG_SCOPE = "docus-css";

type ModuleOptions = {
  enabled: boolean;
};
const DEFAULTS = {
  enabled: true,
} satisfies ModuleOptions;

export default defineNuxtModule({
  meta: {
    name: MODULE_NAME,
    configKey: MODULE_KEY,
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: DEFAULTS,
  async setup(_options, nuxt) {
    const log = useLogger(LOG_SCOPE);
    const { start, end, isEnabled } = moduleSetup(
      MODULE_NAME,
      MODULE_KEY,
      _options,
      DEFAULTS,
      log,
    );

    start();

    if (!isEnabled()) {
      return;
    }

    const DOCUS_CSS_FILE = "docus.css";

    // First remove the original docus css file, so we can recreate it
    if (Array.isArray(nuxt.options.css)) {
      nuxt.options.css = nuxt.options.css.filter(
        (css) => !css.endsWith(DOCUS_CSS_FILE),
      );
    }
    const resolver = createResolver(import.meta.url);

    const contentDir = resolve(nuxt.options.rootDir, "content");
    const appConfigPath = resolve(nuxt.options.srcDir, "app.config.ts");
    const uiPath = resolveModulePath("@nuxt/ui", {
      from: import.meta.url,
      conditions: ["style"],
    });
    const tailwindPath = resolveModulePath("tailwindcss", {
      from: import.meta.url,
      conditions: ["style"],
    });
    const layerDir = resolver.resolve("../app");
    const assistantDir = resolver.resolve("../modules/assistant");

    let userDocusPath: string | null = resolve(nuxt.options.srcDir, "app.css");
    if (existsSync(userDocusPath)) {
      const userDocusCss = await readFile(userDocusPath, "utf-8");
      if (userDocusCss.includes('@import "tailwindcss"')) {
        nuxt.hook("modules:done", () => {
          log.warn(
            '`app.css` contains `@import "tailwindcss";` consider removing it to avoid duplicate css.',
          );
        });
      }
    } else {
      userDocusPath = null;
    }

    const cssTemplate = addTemplate({
      filename: "docus.css",
      write: true,
      getContents: () => {
        return (
          `
    @layer scalar-base, scalar-theme, scalar-config, theme, base, components, utilities;
    @import ${JSON.stringify(tailwindPath)};
    @import ${JSON.stringify(uiPath)};

    @source "${contentDir.replace(/\\/g, "/")}/**/*";
    @source "${layerDir.replace(/\\/g, "/")}/**/*";
    @source "${appConfigPath.replace(/\\/g, "/")}";
    @source "${assistantDir.replace(/\\/g, "/")}/**/*";

    html.dark .shiki span {
      color: var(--shiki-dark) !important;
      background-color: var(--shiki-dark-bg) !important;
      font-style: var(--shiki-dark-font-style) !important;
      font-weight: var(--shiki-dark-font-weight) !important;
      text-decoration: var(--shiki-dark-text-decoration) !important;
    }

    :root {
      --ui-container: 90rem;
    }
    ` + (userDocusPath ? `\n@import ${JSON.stringify(userDocusPath)};` : "")
        );
      },
    });

    if (Array.isArray(nuxt.options.css)) {
      nuxt.options.css.unshift(cssTemplate.dst);
    }

    // Noisy Vite warnings
    const sourcemapWarnIgnore = [
      "@tailwindcss/vite:generate:build",
      "nuxt:module-preload-polyfill",
    ];
    nuxt.hook("vite:extendConfig", (config) => {
      const logger = config.customLogger;
      if (!logger) return;
      const originalWarn = logger.warn.bind(logger);
      logger.warn = (msg, options) => {
        if (sourcemapWarnIgnore.some((p) => msg.includes(p))) return;
        originalWarn(msg, options);
      };
    });

    end();
  },
});
