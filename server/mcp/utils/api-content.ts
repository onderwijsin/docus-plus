import type { Collections } from "@nuxt/content";
import { queryCollection } from "@nuxt/content/server";
import type { H3Event } from "h3";
import { joinURL } from "ufo";

type ApiKind = Extract<Collections["api"]["kind"], "tag" | "operation" | "schema">;

const API_FIELDS = [
  "title",
  "description",
  "kind",
  "scalarTarget",
  "method",
  "path",
  "operationId",
  "tags",
  "body"
] as const;

/** Convert Nuxt Content's generated MiniMark body into readable API reference text. */
function extractBodyText(value: unknown): string {
  if (typeof value === "string") {
    try {
      return extractBodyText(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    if (typeof value[0] === "string" && value[1] && typeof value[1] === "object") {
      return value.slice(2).map(extractBodyText).filter(Boolean).join("");
    }
    return value.map(extractBodyText).filter(Boolean).join("\n\n");
  }

  if (value && typeof value === "object" && "value" in value) {
    return extractBodyText(value.value);
  }

  return "";
}

/** Shape an API Content record for MCP clients without exposing Content internals. */
function toApiResource(event: H3Event, resource: Record<string, unknown>) {
  const config = useRuntimeConfig(event);
  const siteUrl = getRequestURL(event).origin;
  const baseURL = config.app?.baseURL || "/";
  const scalarTarget = String(resource.scalarTarget);

  return {
    title: resource.title,
    description: resource.description,
    ...(resource.method ? { method: resource.method } : {}),
    ...(resource.path ? { path: resource.path } : {}),
    ...(resource.operationId ? { operationId: resource.operationId } : {}),
    ...(resource.tags ? { tags: resource.tags } : {}),
    scalarTarget,
    url: joinURL(siteUrl, baseURL, scalarTarget),
    ...(resource.body ? { content: extractBodyText(resource.body) } : {})
  };
}

/** List generated API Content resources of one kind for MCP discovery tools. */
export async function listApiResources(event: H3Event, kind: ApiKind) {
  const resources = await queryCollection(event, "api")
    .where("kind", "=", kind)
    .select(...API_FIELDS.slice(0, -1))
    .all();

  return resources.map((resource) => toApiResource(event, resource));
}

/** Get a generated API model or tag by its exact display name. */
export async function getApiNamedResource(
  event: H3Event,
  kind: Exclude<ApiKind, "operation">,
  name: string
) {
  const resource = await queryCollection(event, "api")
    .where("kind", "=", kind)
    .where("title", "=", name)
    .select(...API_FIELDS)
    .first();

  return resource ? toApiResource(event, resource) : null;
}

/** Get a generated API operation by its exact HTTP method and OpenAPI path. */
export async function getApiOperation(event: H3Event, method: string, path: string) {
  const resource = await queryCollection(event, "api")
    .where("kind", "=", "operation")
    .where("method", "=", method.toUpperCase())
    .where("path", "=", path)
    .select(...API_FIELDS)
    .first();

  return resource ? toApiResource(event, resource) : null;
}
