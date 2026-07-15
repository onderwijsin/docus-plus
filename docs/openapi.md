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

Keep the generated record schema and Scalar links aligned. Run `corepack pnpm build` after changing
the source configuration, parser, or generated metadata contract.
