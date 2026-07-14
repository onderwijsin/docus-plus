export interface ModuleOptions {
  /**
   * Whether the module is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * Public site key consumed by the Turnstile widget in the browser.
   * @default ''
   */
  siteKey?: string;

  /**
   * Secret key used by server-side Turnstile verification.
   * @default ''
   */
  secretKey?: string;
}
