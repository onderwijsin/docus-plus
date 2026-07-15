/**
 * Normalizes route paths so markdown routing can use a single canonical form.
 *
 * @param path - Raw request or route path.
 * @returns Canonical path with duplicate and trailing slashes removed.
 */
export function normalizeMarkdownRoutePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }

  const normalized = path
    .trim()
    .replace(/\/{2,}/g, "/")
    .replace(/\/+$/g, "");

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

/**
 * Builds the explicit raw-markdown route for a canonical page path.
 *
 * @param canonicalPath - Canonical page pathname.
 * @returns Matching `.md` raw-markdown pathname.
 */
export function buildRawMarkdownPath(canonicalPath: string): string {
  const normalizedPath = normalizeMarkdownRoutePath(canonicalPath);

  return normalizedPath === "/" ? "/raw.md" : `/raw${normalizedPath}.md`;
}
