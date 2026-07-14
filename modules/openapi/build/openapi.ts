import { SCALAR_BASE_PATH } from "../../../config/constants";
// import { openApiSource } from "../config/openapi";
import type { OpenApiSource } from "../../../shared/types/openapi";

/** Whether the environment contains a complete OpenAPI source definition. */
export function hasOpenApiSource(): boolean {
  return !!process.env.OPENAPI_SOURCE_TYPE && !!process.env.OPENAPI_LOCATION;
}

/** Resolve the browser URL that Scalar should use to load the configured spec. */
export function getOpenApiScalarUrl(source: OpenApiSource): string {
  return source.type === "remote" ? source.url : `/${source.publicPath.replace(/^\/+/, "")}`;
}

/**
 * Get the OpenAPI source configuration.
 * @returns The OpenAPI source.
 */
export function getOpenApiSource() {
  let source: OpenApiSource;

  const isRemoteApi = process.env.OPENAPI_SOURCE_TYPE === "remote";

  if (isRemoteApi) {
    source = {
      type: "remote",
      url: process.env.OPENAPI_LOCATION!
    };
  } else {
    source = {
      type: "local",
      publicPath: process.env.OPENAPI_LOCATION!
    };
  }

  return source;
}

/**
 * Match Scalar's path-routing segment format for tags and model names.
 *
 * Scalar preserves model casing while lowercasing tags. Keeping the formatter
 * here makes generated Content links independent from parser implementation.
 */
function toScalarSegment(value: string, preserveCase = false): string {
  const normalized = value.slice(0, 255).trim().normalize("NFC");
  const withoutPunctuation = (preserveCase ? normalized : normalized.toLowerCase()).replace(
    /[^\p{L}\p{M}\p{N}\s_-]/gu,
    ""
  );

  return withoutPunctuation.replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Build a path-routed Scalar URL from a navigation ID, encoding each segment. */
function toScalarTarget(referenceId = ""): string {
  if (!referenceId) {
    return SCALAR_BASE_PATH;
  }

  const encodedReferenceId = referenceId.split("/").map(encodeURIComponent).join("/");
  return `${SCALAR_BASE_PATH}/${encodedReferenceId}`;
}

/** Link to Scalar's API introduction. */
export function getScalarInfoTarget(): string {
  return toScalarTarget();
}

/** Link to a Scalar tag navigation entry. */
export function getScalarTagTarget(tag: string): string {
  return toScalarTarget(`tag/${toScalarSegment(tag)}`);
}

/** Link to a Scalar operation navigation entry. */
export function getScalarOperationTarget({
  method,
  path,
  tags
}: {
  method: string;
  path: string;
  tags: string[];
}): string {
  const operationId = `${method.toUpperCase()}${path}`;
  const tag = tags[0];

  return toScalarTarget(tag ? `tag/${toScalarSegment(tag)}/${operationId}` : operationId);
}

/** Link to a Scalar model navigation entry. */
export function getScalarSchemaTarget(name: string): string {
  return toScalarTarget(`models/${toScalarSegment(name, true)}`);
}
