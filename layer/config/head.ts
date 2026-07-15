import type { NuxtConfig } from "@nuxt/schema";

export const app = {
  head: {
    htmlAttrs: {
      lang: "nl"
    },
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, minimum-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
      },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" }
    ],
    noscript: [
      {
        innerHTML:
          "Je hebt Javascript nodig om deze website te kunnen gebruiken. Pas je browserinstellingen in om verder te gaan!"
      }
    ],
    link: [
      {
        rel: "icon",
        type: "image/ico",
        href: "/favicon.ico"
      }
    ]
  }
} satisfies NuxtConfig["app"];
