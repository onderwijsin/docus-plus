declare module "nuxt/schema" {
  interface RuntimeConfig {
    turnstile: {
      secretKey: string;
    };
  }

  interface PublicRuntimeConfig {
    turnstile: {
      siteKey: string;
    };
  }
}

export {};
