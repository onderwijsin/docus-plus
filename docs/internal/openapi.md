# OpenAPI support

The optional OpenAPI module can turn one configured OpenAPI document into generated Nuxt Content
records. Those records support API search and MCP discovery without being committed to the
consumer's `content/` directory.

The source can be a local file below the consuming application's `public/` directory or an
absolute HTTPS URL. Local paths are resolved from the consuming application's root, not from this
layer. Parsing occurs during the Nuxt Content build, validates the document, and rejects
unsupported external `$ref` references.
Consumers that need this feature configure the source in their application and should bundle
multi-file specifications before the build.

The layer accepts API documents through `openApi.configurations` in `nuxt.config.ts`. Each configuration can
set its own `url` (or `content`) and `pathRouting.basePath` segment. The layer appends that segment
to `/api-reference`, so `/yaml` becomes `/api-reference/yaml`. The layer enables Scalar when this
array contains a valid document configuration, even when the OpenAPI environment variables are
absent.

Set `indexed: true` on the configuration that should populate generated OpenAPI Content and API
search. When no configuration is indexed, the first configuration is used. Set
`excludeFromSearch: true` to keep a reference out of the API Reference links in AppSearch while
leaving it available in Scalar.

Configurations can provide a Nuxt UI `BadgeProps` object for the API Explorer dropdown, for example
`badge: { label: "latest", color: "success" }`.

Keep the generated record schema and Scalar links aligned. Run `corepack pnpm build` after changing
the source configuration, parser, or generated metadata contract.
