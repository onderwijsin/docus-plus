import { normalizeMarkdownRoutePath } from "#layers/docus-plus/shared/utils/markdownRoutes";

const MARKDOWN_REQUEST_EXCLUDED_PREFIXES = [
  "/__",
  "/_nuxt",
  "/api-reference",
  "/raw",
  "/raw.md",
] as const;

interface MarkdownRequestShape {
  accept?: string | null | undefined;
  method?: string | null | undefined;
  pathname: string;
}

/**
 * Determines whether a request explicitly prefers markdown on a canonical page route.
 *
 * @param request - Request method, path, and accept header.
 * @returns `true` when markdown negotiation should run.
 */
export function shouldServeMarkdownRequest(
  request: MarkdownRequestShape,
): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const pathname = normalizeMarkdownRoutePath(request.pathname);

  if (
    MARKDOWN_REQUEST_EXCLUDED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return false;
  }

  return (
    typeof request.accept === "string" &&
    request.accept.includes("text/markdown")
  );
}
