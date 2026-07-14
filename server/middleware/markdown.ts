import { buildRawMarkdownPath } from "#layers/docus-plus/shared/utils/markdownRoutes";
import { defineEventHandler, getRequestURL, sendRedirect } from "h3";

import { shouldServeMarkdown } from "../utils/markdown/accept";

/**
 * Negotiates `text/markdown` on canonical page routes and proxies those requests to the matching
 * raw-markdown `.md` route.
 */
export default defineEventHandler(async (event) => {
  if (!shouldServeMarkdown(event)) {
    return;
  }

  return sendRedirect(
    event,
    buildRawMarkdownPath(getRequestURL(event).pathname),
  );
});
