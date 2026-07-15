import { SCALAR_BASE_PATH } from "../../../config/constants";
import type { OpenApiSource } from "../../../shared/types/openapi";
import type { BadgeProps } from "@nuxt/ui";
import { z } from "zod";

const scalarSourceSchema = z
  .object({
    url: z.string().trim().min(1).optional(),
    content: z.any().optional(),
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional()
  })
  .passthrough();

const scalarConfigurationSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    default: z.boolean().optional(),
    indexed: z.boolean().optional(),
    excludeFromSearch: z.boolean().optional(),
    badge: z.record(z.string(), z.any()).optional(),
    url: z.string().trim().min(1).optional(),
    content: z.any().optional(),
    sources: z.array(scalarSourceSchema).min(1).optional(),
    pathRouting: z
      .object({
        basePath: z.string().trim().startsWith("/")
      })
      .optional()
  })
  .passthrough()
  .refine(
    (configuration) =>
      Boolean(configuration.url || configuration.content || configuration.sources?.length),
    { message: "A Scalar configuration must define url, content, or sources." }
  );

const scalarOptionsSchema = z
  .object({
    configurations: z.array(scalarConfigurationSchema).min(1)
  })
  .passthrough();

type ScalarConfiguration = z.infer<typeof scalarConfigurationSchema>;

export type ScalarReference = {
  path: string;
  label: string;
  default: boolean;
  excludeFromSearch: boolean;
  badge?: BadgeProps;
};

export type ScalarOpenApiSource = {
  source: OpenApiSource;
  basePath: string;
};

/** Return configured Scalar documents supplied through Nuxt config. */
export function getScalarConfigurations(
  value: unknown
): z.infer<typeof scalarOptionsSchema>["configurations"] {
  const parsed = scalarOptionsSchema.safeParse(value);
  return parsed.success ? parsed.data.configurations : [];
}

/** Whether Nuxt config contains at least one usable Scalar document configuration. */
export function hasScalarConfigurations(value: unknown): boolean {
  return getScalarConfigurations(value).length > 0;
}

/** Return the configuration used to populate the generated OpenAPI search collection. */
export function getIndexedScalarConfiguration(value: unknown): ScalarConfiguration | undefined {
  const configurations = getScalarConfigurations(value);
  return configurations.find((configuration) => configuration.indexed) ?? configurations[0];
}

function normalizeScalarBasePath(basePath: string | undefined, fallback: string): string {
  const segment = basePath?.trim().replace(/^\/+|\/+$/g, "");
  return segment ? `${SCALAR_BASE_PATH}/${segment}` : fallback;
}

/** Normalize Scalar documents into the small public shape needed by the app header. */
export function getScalarReferences(value: unknown): ScalarReference[] {
  const configurations = getScalarConfigurations(value);

  return configurations.map((configuration, index) => ({
    path: normalizeScalarBasePath(
      configuration.pathRouting?.basePath,
      index === 0 ? SCALAR_BASE_PATH : `${SCALAR_BASE_PATH}/${configuration.slug || index + 1}`
    ),
    label:
      configuration.title ||
      configuration.slug ||
      (index === 0 ? "Current version" : `Version ${index + 1}`),
    default: configuration.default ?? index === 0,
    excludeFromSearch: configuration.excludeFromSearch ?? false,
    badge: configuration.badge as BadgeProps | undefined
  }));
}

/** Resolve the selected Scalar configuration into a source for build-time OpenAPI indexing. */
export function getScalarOpenApiSource(value: unknown): ScalarOpenApiSource | undefined {
  const configurations = getScalarConfigurations(value);
  const indexedIndex = configurations.findIndex((configuration) => configuration.indexed);
  const index = indexedIndex >= 0 ? indexedIndex : 0;
  const configuration = configurations[index];
  if (!configuration) {
    return undefined;
  }

  const reference = getScalarReferences(value)[index];
  const url = configuration.url ?? configuration.sources?.find((source) => source.url)?.url;
  const source: OpenApiSource | undefined = url
    ? { type: "remote", url }
    : configuration.content
      ? { type: "inline", content: configuration.content }
      : undefined;

  return source && reference ? { source, basePath: reference.path } : undefined;
}

/** Whether the environment contains a complete OpenAPI source definition. */
export function hasOpenApiSource(): boolean {
  return !!process.env.OPENAPI_SOURCE_TYPE && !!process.env.OPENAPI_LOCATION;
}

/** Resolve the browser URL that Scalar should use to load the configured spec. */
export function getOpenApiScalarUrl(source: OpenApiSource): string {
  if (source.type === "remote") {
    return source.url;
  }

  if (source.type === "local") {
    return `/${source.publicPath.replace(/^\/+/, "")}`;
  }

  return "inline OpenAPI document";
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
function toScalarTarget(referenceId = "", basePath = SCALAR_BASE_PATH): string {
  if (!referenceId) {
    return basePath;
  }

  const encodedReferenceId = referenceId.split("/").map(encodeURIComponent).join("/");
  return `${basePath}/${encodedReferenceId}`;
}

/** Link to Scalar's API introduction. */
export function getScalarInfoTarget(basePath?: string): string {
  return toScalarTarget("", basePath);
}

/** Link to a Scalar tag navigation entry. */
export function getScalarTagTarget(tag: string, basePath?: string): string {
  return toScalarTarget(`tag/${toScalarSegment(tag)}`, basePath);
}

/** Link to a Scalar operation navigation entry. */
export function getScalarOperationTarget({
  method,
  path,
  tags,
  basePath
}: {
  method: string;
  path: string;
  tags: string[];
  basePath?: string;
}): string {
  const operationId = `${method.toUpperCase()}${path}`;
  const tag = tags[0];

  return toScalarTarget(tag ? `tag/${toScalarSegment(tag)}/${operationId}` : operationId, basePath);
}

/** Link to a Scalar model navigation entry. */
export function getScalarSchemaTarget(name: string, basePath?: string): string {
  return toScalarTarget(`models/${toScalarSegment(name, true)}`, basePath);
}
