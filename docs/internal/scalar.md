# Scalar integration

When enabled by a consuming project, `@scalar/nuxt` provides the interactive API reference. The
consumer supplies the API document and can configure the document slug and metadata from
`nuxt.config.ts`.

The OpenAPI module may generate searchable records that link to Scalar operation and schema pages.
Those links must be built through the shared routing helpers so path parameters and URL segments are
encoded consistently.

Scalar styling follows the layer's color-mode and CSS token conventions. Consumers should import
the layer stylesheet before adding their own tokens in `app/app.css`.

Configure multiple documents through `openApi.configurations`. The OpenAPI module translates them
to Scalar's native `scalar.configurations` option after Nuxt reads the consumer configuration, while
the app receives the API Explorer dropdown data through `appConfig.openApiSources`.
