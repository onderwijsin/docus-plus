import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { upgrade, validate } from "@scalar/openapi-parser";
import { defineCollectionSource } from "@nuxt/content";
import { z } from "zod";
import {
  getOpenApiScalarUrl,
  getScalarInfoTarget,
  getScalarOperationTarget,
  getScalarSchemaTarget,
  getScalarTagTarget
} from "./openapi";

import type { OpenApiSource } from "../../../shared/types/openapi";

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as const;

const apiContentEntrySchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  kind: z.enum(["info", "tag", "operation", "schema"]),
  scalarTarget: z.string(),
  method: z.string().optional(),
  path: z.string().optional(),
  operationId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string()
});

type ApiContentEntry = z.infer<typeof apiContentEntrySchema>;
type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});
const asString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(asString).filter(Boolean) : [];

function escapePointerSegment(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

/** Resolve an in-document JSON pointer while preserving non-reference siblings. */
function resolveLocalReference(
  value: unknown,
  document: UnknownRecord,
  seen = new Set<string>()
): UnknownRecord {
  const record = asRecord(value);
  const reference = asString(record.$ref);

  if (!reference.startsWith("#/")) {
    return record;
  }

  if (seen.has(reference)) {
    return record;
  }

  const target = reference
    .slice(2)
    .split("/")
    .map(escapePointerSegment)
    .reduce<unknown>((current, segment) => asRecord(current)[segment], document);
  const resolved = resolveLocalReference(target, document, new Set([...seen, reference]));
  const { $ref: _reference, ...siblings } = record;

  return { ...resolved, ...siblings };
}

/** Reject references that cannot be loaded from a single JSON/YAML document. */
function assertOnlyLocalReferences(value: unknown, path = "#"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertOnlyLocalReferences(item, `${path}/${index}`));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  const reference = value.$ref;
  if (typeof reference === "string" && !reference.startsWith("#/")) {
    throw new Error(
      `OpenAPI reference at ${path} points outside the root document (${reference}). Bundle external $ref files before building the docs.`
    );
  }

  Object.entries(value).forEach(([key, child]) =>
    assertOnlyLocalReferences(child, `${path}/${key}`)
  );
}

function collectSchemaText(
  value: unknown,
  document: UnknownRecord,
  seen = new Set<string>(),
  seenObjects = new WeakSet<object>(),
  depth = 0
): string[] {
  if (depth > 16 || (isRecord(value) && seenObjects.has(value))) {
    return [];
  }

  if (isRecord(value)) {
    seenObjects.add(value);
  }

  const record = asRecord(value);
  const reference = asString(record.$ref);
  if (reference && seen.has(reference)) {
    return [];
  }

  const resolved = resolveLocalReference(record, document, seen);
  if (resolved !== record) {
    if (seenObjects.has(resolved)) {
      return [];
    }
    seenObjects.add(resolved);
  }
  const nextSeen = reference ? new Set([...seen, reference]) : seen;
  const text = [asString(resolved.title), asString(resolved.description)];
  const properties = asRecord(resolved.properties);

  for (const [name, property] of Object.entries(properties)) {
    text.push(name, ...collectSchemaText(property, document, nextSeen, seenObjects, depth + 1));
  }

  for (const key of ["items", "allOf", "anyOf", "oneOf", "not"] as const) {
    const child = resolved[key];
    if (Array.isArray(child)) {
      child.forEach((item) =>
        text.push(...collectSchemaText(item, document, nextSeen, seenObjects, depth + 1))
      );
    } else if (child) {
      text.push(...collectSchemaText(child, document, nextSeen, seenObjects, depth + 1));
    }
  }

  return text.filter(Boolean);
}

function collectOperationText(
  operation: UnknownRecord,
  pathItem: UnknownRecord,
  document: UnknownRecord
): string[] {
  const parameters = [
    ...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []),
    ...(Array.isArray(operation.parameters) ? operation.parameters : [])
  ]
    .map((parameter) => resolveLocalReference(parameter, document))
    .flatMap((parameter) => [
      asString(parameter.name),
      asString(parameter.in),
      asString(parameter.description)
    ]);

  const requestBody = resolveLocalReference(operation.requestBody, document);
  const requestSchemas = Object.values(asRecord(requestBody.content)).flatMap((mediaType) =>
    collectSchemaText(resolveLocalReference(mediaType, document).schema, document)
  );
  const responseText = Object.values(asRecord(operation.responses)).flatMap((response) => {
    const resolved = resolveLocalReference(response, document);
    return [
      asString(resolved.description),
      ...Object.values(asRecord(resolved.content)).flatMap((mediaType) =>
        collectSchemaText(resolveLocalReference(mediaType, document).schema, document)
      )
    ];
  });

  return [
    ...parameters,
    asString(requestBody.description),
    ...requestSchemas,
    ...responseText
  ].filter(Boolean);
}

function createMarkdown(entry: ApiContentEntry): string {
  const frontmatter = {
    title: entry.title,
    description: entry.description,
    kind: entry.kind,
    scalarTarget: entry.scalarTarget,
    navigation: false,
    ...(entry.method ? { method: entry.method } : {}),
    ...(entry.path ? { path: entry.path } : {}),
    ...(entry.operationId ? { operationId: entry.operationId } : {}),
    ...(entry.tags ? { tags: entry.tags } : {})
  };

  return `---\n${Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n\n${entry.content}\n`;
}

function addEntry(entries: ApiContentEntry[], entry: ApiContentEntry): void {
  const parsed = apiContentEntrySchema.safeParse(entry);
  if (!parsed.success) {
    throw new Error(`Unable to generate OpenAPI Content entry: ${z.prettifyError(parsed.error)}`);
  }

  entries.push(parsed.data);
}

function createEntries(document: UnknownRecord): ApiContentEntry[] {
  const entries: ApiContentEntry[] = [];
  const info = asRecord(document.info);
  const servers = Array.isArray(document.servers) ? document.servers.map(asRecord) : [];
  const contact = asRecord(info.contact);
  const serverText = servers
    .flatMap((server) => [asString(server.url), asString(server.description)])
    .filter(Boolean);

  addEntry(entries, {
    key: "info.md",
    kind: "info",
    title: asString(info.title) || "API reference",
    description: asString(info.description),
    scalarTarget: getScalarInfoTarget(),
    content: [
      asString(info.title),
      asString(info.version),
      asString(info.description),
      asString(contact.name),
      asString(contact.email),
      asString(contact.url),
      ...serverText
    ]
      .filter(Boolean)
      .join("\n\n")
  });

  const operationsByTag = new Map<string, string[]>();
  const paths = asRecord(document.paths);
  for (const [path, pathValue] of Object.entries(paths)) {
    const pathItem = resolveLocalReference(pathValue, document);
    for (const method of HTTP_METHODS) {
      if (!pathItem[method]) {
        continue;
      }

      const operation = resolveLocalReference(pathItem[method], document);
      const tags = asStrings(operation.tags);
      const operationId = asString(operation.operationId);
      const summary = asString(operation.summary);
      const description = asString(operation.description);
      const routeTitle = `${method.toUpperCase()} ${path}`;
      const operationLabel = summary || operationId || routeTitle;
      const content = [
        routeTitle,
        operationId,
        summary,
        description,
        ...tags,
        ...collectOperationText(operation, pathItem, document)
      ]
        .filter(Boolean)
        .join("\n\n");

      addEntry(entries, {
        key: `operations/${method}-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "root"}.md`,
        kind: "operation",
        // Index the route as the title so route-only terms outrank model names.
        title: routeTitle,
        description: description || summary || routeTitle,
        method: method.toUpperCase(),
        path,
        ...(operationId ? { operationId } : {}),
        tags,
        scalarTarget: getScalarOperationTarget({ method, path, tags }),
        content
      });

      for (const tag of tags) {
        operationsByTag.set(tag, [...(operationsByTag.get(tag) ?? []), operationLabel]);
      }
    }
  }

  const documentedTags = new Map<string, string>();
  for (const tag of Array.isArray(document.tags) ? document.tags : []) {
    const tagRecord = asRecord(tag);
    const name = asString(tagRecord.name);
    if (name) {
      documentedTags.set(name, asString(tagRecord.description));
    }
  }

  for (const tag of operationsByTag.keys()) {
    documentedTags.set(tag, documentedTags.get(tag) ?? "");
  }

  for (const [tag, description] of documentedTags) {
    addEntry(entries, {
      key: `tags/${tag.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "untagged"}.md`,
      kind: "tag",
      title: tag,
      description,
      scalarTarget: getScalarTagTarget(tag),
      content: [tag, description, ...(operationsByTag.get(tag) ?? [])].filter(Boolean).join("\n\n")
    });
  }

  const schemas = asRecord(asRecord(document.components).schemas);
  for (const [name, schema] of Object.entries(schemas)) {
    const resolved = resolveLocalReference(schema, document);
    addEntry(entries, {
      key: `schemas/${name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "schema"}.md`,
      kind: "schema",
      title: name,
      description: asString(resolved.description) || asString(resolved.title),
      scalarTarget: getScalarSchemaTarget(name),
      content: [name, ...collectSchemaText(resolved, document)].filter(Boolean).join("\n\n")
    });
  }

  return entries;
}

async function loadOpenApiDocument(rootDir: string, source: OpenApiSource): Promise<UnknownRecord> {
  // const source = openApiSource;
  const sourceText = await (async () => {
    if (source.type === "remote") {
      const url = new URL(source.url);
      if (url.protocol !== "https:") {
        throw new Error("Remote OpenAPI sources must use HTTPS.");
      }

      const response = await fetch(url, {
        signal: AbortSignal.timeout(15_000)
      });
      if (!response.ok) {
        throw new Error(
          `Unable to fetch OpenAPI document (${response.status} ${response.statusText}).`
        );
      }
      return response.text();
    }

    const publicDirectory = resolve(rootDir, "public");
    const filePath = resolve(publicDirectory, source.publicPath.replace(/^\/+/, ""));
    if (!filePath.startsWith(`${publicDirectory}/`)) {
      throw new Error("Local OpenAPI sources must stay below the public directory.");
    }
    return readFile(filePath, "utf8");
  })();

  const validation = await validate(sourceText);
  if (!validation.valid) {
    const errors = validation.errors
      .map((error) => `${error.path?.join(".") ?? "document"}: ${error.message}`)
      .join("\n");
    throw new Error(`Invalid OpenAPI document from ${getOpenApiScalarUrl(source)}:\n${errors}`);
  }

  assertOnlyLocalReferences(validation.specification);
  const normalized = upgrade(validation.specification).specification as UnknownRecord;
  // Keep the normalized document's `$ref` nodes intact. The extraction helpers
  // resolve those nodes lazily so recursive schemas cannot form object cycles.
  return normalized;
}

/**
 * Build virtual Markdown files that Nuxt Content can index with FTS5.
 *
 * The source stays memory-only: generated API records are included in the
 * Content database but are never emitted into the repository's `content/` dir.
 */
export function createOpenApiContentSource(openApiSource: OpenApiSource) {
  let entriesPromise: Promise<Map<string, string>> | undefined;

  async function getEntries(rootDir: string): Promise<Map<string, string>> {
    entriesPromise ??= loadOpenApiDocument(rootDir, openApiSource).then(
      (document) =>
        new Map(createEntries(document).map((entry) => [entry.key, createMarkdown(entry)]))
    );
    return entriesPromise;
  }

  let rootDir = "";

  return defineCollectionSource({
    prepare: async (options) => {
      rootDir = options.rootDir;
      await getEntries(rootDir);
    },
    getKeys: async () => [...(await getEntries(rootDir)).keys()],
    getItem: async (key) => {
      const item = (await getEntries(rootDir)).get(key);
      if (!item) {
        throw new Error(`Unknown generated OpenAPI Content entry: ${key}`);
      }
      return item;
    }
  });
}
