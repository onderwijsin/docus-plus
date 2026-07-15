export interface ModuleOptions {
  /** Whether Mailchimp is enabled when all credentials are available. */
  enabled?: boolean;
  /** Mailchimp API key. */
  apiKey?: string;
  /** Mailchimp audience/list identifier. */
  listId?: string;
  /** Mailchimp data center, for example `us4`. */
  server?: string;
}
