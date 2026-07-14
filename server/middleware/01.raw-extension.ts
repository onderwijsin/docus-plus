import { defineEventHandler, getRequestURL, sendRedirect } from "h3";
import { parseURL, stringifyParsedURL } from "ufo";

/**
 * Redirects extensionless raw markdown requests to the explicit `.md` route shape.
 */
export default defineEventHandler((event) => {
  const requestUrl = getRequestURL(event);
  const { hash, pathname, search } = parseURL(requestUrl.toString());

  if ((!pathname.startsWith("/raw/") && pathname !== "/raw") || pathname.endsWith(".md")) {
    return;
  }

  return sendRedirect(
    event,
    stringifyParsedURL({
      pathname: `${pathname}.md`,
      search,
      hash
    })
  );
});
