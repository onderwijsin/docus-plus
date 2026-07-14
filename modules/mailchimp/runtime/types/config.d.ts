declare module "nuxt/schema" {
  interface RuntimeConfig {
    mailchimp: {
      apiKey: string;
      listId: string;
      server: string;
    };
  }

  interface PublicRuntimeConfig {
    mailchimp: {
      enabled: boolean;
    };
  }
}

export {};
