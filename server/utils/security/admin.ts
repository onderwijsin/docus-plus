import type { H3Event } from "h3";

import { SECURITY_HEADERS } from "#layers/docus-plus/config/constants";

import { hasMatchingRequestToken } from "./token";

/**
 * Checks whether the incoming request should be treated as admin.
 *
 * Accepted credentials:
 * - `x-admin-token: <API_TOKEN>`
 * - `Authorization: Bearer <API_TOKEN>`
 *
 * @param event - H3 event.
 * @returns Whether request contains a valid admin token.
 */
export function isAdmin(event: H3Event): boolean {
  return hasMatchingRequestToken(
    event,
    useRuntimeConfig(event).apiToken,
    SECURITY_HEADERS.adminToken,
  );
}
