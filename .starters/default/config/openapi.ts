import type { OpenApiSource } from "#layers/docus-plus/shared/types/openapi";

/** Stable Scalar document identifier used by generated API-reference links. */
export const OPENAPI_DOCUMENT_SLUG = "onderwijsloket-api";

/** Source of truth for the API reference and its generated search records. */
export const openApiSource: OpenApiSource = {
  type: "remote",
  url: "https://registry.scalar.com/@onderwijsin/apis/dynamic-onderwijsloket-api-specification@latest"
};
