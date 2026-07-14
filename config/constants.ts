/**
 * Supported build-time and runtime environments.
 */
export const SUPPORTED_ENVIRONMENTS = [
  "development",
  "production",
  "preview",
] as const;

/**
 * Header names used by request security middleware/helpers.
 */
export const SECURITY_HEADERS = {
  /** Turnstile token header sent by clients to protected routes. */
  turnstileToken: "x-turnstile-token",
  /** Admin bypass token header used for server-to-server testing. */
  adminToken: "x-admin-token",
} as const;

/**
 * Action keys for Turnstile verification.
 */
export const TURNSTILE_ACTIONS = {
  /**
   * Action key for Turnstile verification when subscribing to Mailchimp.
   */
  mailchimp: "mailchimp_subscribe",
  /**
   * Action key for Turnstile verification when submitting the contact form.
   */
  contact: "contact_submit",
} as const;

/**
 * Base path for Scalar API Reference
 */
export const SCALAR_BASE_PATH = "/api-reference";

/** Maximum visible FTS5 results per search group. */
export const CONTENT_SEARCH_RESULT_LIMITS = {
  documentation: 8,
  operations: 5,
  metadata: 5,
} as const;

/** FTS5 weights for API retrieval before deterministic field-priority ranking. */
export const API_SEARCH_FTS_WEIGHTS = {
  title: 50,
  content: 10,
  heading: 0,
} as const;
