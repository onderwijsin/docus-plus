import type { H3Event } from "h3";

import { getHeader, getRequestURL } from "h3";

import { shouldServeMarkdownRequest } from "./routes";

/**
 * Determines whether the current request is an eligible canonical page request
 * that explicitly prefers markdown.
 *
 * @param event - Incoming Nitro request event.
 * @returns `true` when markdown negotiation should run.
 */
export function shouldServeMarkdown(event: H3Event): boolean {
  return shouldServeMarkdownRequest({
    accept: getHeader(event, "accept"),
    method: event.method,
    pathname: getRequestURL(event).pathname
  });
}
