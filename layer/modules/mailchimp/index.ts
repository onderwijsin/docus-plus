import type { ModuleOptions } from "./runtime/types/options";

import {
  addComponentsDir,
  addImportsDir,
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule
} from "@nuxt/kit";
import { defu } from "defu";

const DEFAULTS = {
  enabled: Boolean(
    process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST && process.env.MAILCHIMP_SERVER
  ),
  apiKey: process.env.MAILCHIMP_API_KEY ?? "",
  listId: process.env.MAILCHIMP_LIST ?? "",
  server: process.env.MAILCHIMP_SERVER ?? ""
} satisfies ModuleOptions;

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@onderwijsin/nuxt-mailchimp",
    configKey: "mailchimp",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0"
    }
  },
  defaults: DEFAULTS,
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    const runtimeDir = resolver.resolve("./runtime");
    const credentialsComplete = Boolean(
      options.apiKey?.trim() && options.listId?.trim() && options.server?.trim()
    );
    const enabled = options.enabled !== false && credentialsComplete;

    nuxt.options.build.transpile.push(runtimeDir);
    nuxt.options.runtimeConfig.mailchimp = defu(nuxt.options.runtimeConfig.mailchimp ?? {}, {
      apiKey: options.apiKey,
      listId: options.listId,
      server: options.server
    });
    nuxt.options.runtimeConfig.public.mailchimp = defu(
      nuxt.options.runtimeConfig.public.mailchimp ?? {},
      { enabled }
    );

    addComponentsDir({
      path: resolver.resolve(runtimeDir, "components"),
      pathPrefix: false
    });
    addImportsDir(resolver.resolve(runtimeDir, "composables"));
    addTypeTemplate({
      filename: "types/mailchimp-config.d.ts",
      src: resolver.resolve(runtimeDir, "types/config.d.ts")
    });

    if (enabled) {
      addServerScanDir(resolver.resolve(runtimeDir, "server"));
    }
  }
});
