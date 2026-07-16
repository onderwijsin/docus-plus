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
    pathRouting: z.object({ basePath: z.string().trim().startsWith("/") }).optional()
  })
  .passthrough()
  .refine(
    (configuration) =>
      Boolean(configuration.url || configuration.content || configuration.sources?.length),
    { message: "A Scalar configuration must define url, content, or sources." }
  );

const scalarOptionsSchema = z
  .object({ configurations: z.array(scalarConfigurationSchema).min(1) })
  .passthrough();
type ScalarConfiguration = z.infer<typeof scalarConfigurationSchema>;

export type ScalarReference = {
  path: string;
  label: string;
  default: boolean;
  excludeFromSearch: boolean;
  badge?: BadgeProps;
};
export type OpenApiSourceMenuItem = {
  label: string;
  to: string;
  badge?: BadgeProps;
};
export type ScalarOpenApiSource = { source: OpenApiSource; basePath: string };

/** Return configured OpenAPI documents supplied through the layer config. */
export function getOpenApiConfigurations(
  value: unknown
): z.infer<typeof scalarOptionsSchema>["configurations"] {
  const parsed = scalarOptionsSchema.safeParse(value);
  return parsed.success ? parsed.data.configurations : [];
}

/** Whether the layer config contains at least one usable document configuration. */
export function hasOpenApiConfigurations(value: unknown): boolean {
  return getOpenApiConfigurations(value).length > 0;
}

/** Return the configuration used to populate the generated OpenAPI search collection. */
export function getIndexedOpenApiConfiguration(value: unknown): ScalarConfiguration | undefined {
  const configurations = getOpenApiConfigurations(value);
  return configurations.find((configuration) => configuration.indexed) ?? configurations[0];
}

function normalizeScalarBasePath(basePath: string | undefined, fallback: string): string {
  const segment = basePath?.trim().replace(/^\/+|\/+$/g, "");
  return segment ? `${SCALAR_BASE_PATH}/${segment}` : fallback;
}

/** Normalize Scalar documents into the small public shape needed by the app header. */
export function getScalarReferences(value: unknown): ScalarReference[] {
  const configurations = getOpenApiConfigurations(value);
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

/** Build the API Explorer dropdown items exposed through app config. */
export function getOpenApiSources(value: unknown): OpenApiSourceMenuItem[] {
  return getScalarReferences(value).map(({ label, path, badge }) => ({
    label,
    to: path,
    badge
  }));
}

/** Resolve the selected Scalar configuration into a source for build-time OpenAPI indexing. */
export function getScalarOpenApiSource(value: unknown): ScalarOpenApiSource | undefined {
  const configurations = getOpenApiConfigurations(value);
  const indexedIndex = configurations.findIndex((configuration) => configuration.indexed);
  const index = indexedIndex >= 0 ? indexedIndex : 0;
  const configuration = configurations[index];
  if (!configuration) return undefined;
  const reference = getScalarReferences(value)[index];
  const url = configuration.url ?? configuration.sources?.find((source) => source.url)?.url;
  const source: OpenApiSource | undefined = url
    ? getOpenApiSourceFromUrl(url)
    : configuration.content
      ? { type: "inline", content: configuration.content }
      : undefined;
  return source && reference ? { source, basePath: reference.path } : undefined;
}

/** Convert a Scalar URL into an OpenAPI source usable during the Nuxt build. */
function getOpenApiSourceFromUrl(url: string): OpenApiSource {
  try {
    new URL(url);
    return { type: "remote", url };
  } catch {
    return { type: "local", publicPath: url };
  }
}

/** Read the supported source location, falling back to the legacy variable. */
function getOpenApiSourceLocation(): string | undefined {
  return process.env.OPENAPI_SOURCE_LOCATION || process.env.OPENAPI_LOCATION;
}

/** Whether the environment contains a complete OpenAPI source definition. */
export function hasOpenApiSource(): boolean {
  return !!process.env.OPENAPI_SOURCE_TYPE && !!getOpenApiSourceLocation();
}

/** Resolve the browser URL that Scalar should use to load the configured spec. */
export function getOpenApiScalarUrl(source: OpenApiSource): string {
  if (source.type === "remote") return source.url;
  if (source.type === "local") return `/${source.publicPath.replace(/^\/+/, "")}`;
  return "inline OpenAPI document";
}

/** Get the OpenAPI source configuration. */
export function getOpenApiSource(): OpenApiSource {
  const location = getOpenApiSourceLocation();
  if (!location) {
    throw new Error("An OpenAPI source location must be configured.");
  }

  return process.env.OPENAPI_SOURCE_TYPE === "remote"
    ? { type: "remote", url: location }
    : { type: "local", publicPath: location };
}

function toScalarSegment(value: string, preserveCase = false): string {
  const normalized = value.slice(0, 255).trim().normalize("NFC");
  return (preserveCase ? normalized : normalized.toLowerCase())
    .replace(/[^\p{L}\p{M}\p{N}\s_-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toScalarTarget(referenceId = "", basePath = SCALAR_BASE_PATH): string {
  if (!referenceId) return basePath;
  return `${basePath}/${referenceId.split("/").map(encodeURIComponent).join("/")}`;
}

export function getScalarInfoTarget(basePath?: string): string {
  return toScalarTarget("", basePath);
}
export function getScalarTagTarget(tag: string, basePath?: string): string {
  return toScalarTarget(`tag/${toScalarSegment(tag)}`, basePath);
}
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
  return toScalarTarget(
    tags[0] ? `tag/${toScalarSegment(tags[0])}/${operationId}` : operationId,
    basePath
  );
}
export function getScalarSchemaTarget(name: string, basePath?: string): string {
  return toScalarTarget(`models/${toScalarSegment(name, true)}`, basePath);
}
