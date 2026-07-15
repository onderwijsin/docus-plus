# Architecture

The layer entry point is [`nuxt.config.ts`](../nuxt.config.ts). It extends Docus, registers shared
components and integrations, and exposes reusable module configuration. A consuming project extends
the published GitHub layer from its own Nuxt config; the playground extends the local repository
with `extends: [".."]`.

## Ownership boundaries

- `app/` contains shared Vue components, layouts, composables, and base styling.
- `config/` contains generic defaults and helpers. Product identity belongs in the consumer.
- `content.config.ts` defines the landing, documentation, changelog, and optional generated API
  collections.
- `modules/` contains reusable Nuxt modules and their runtime surfaces.
- `server/` contains shared Nitro routes and server utilities that are intentionally part of the
  layer contract.
- `shared/` contains code used by both application and server contexts.
- `.playground/` demonstrates consumer overrides and is not layer runtime code.

## Extension model

Nuxt applies the consuming application's files and configuration on top of the layer. Consumers
can therefore add content, merge or override app configuration, import the layer stylesheet before
their own tokens, and replace components such as `AppHeaderLogo` without modifying this repository.

When changing an extension point, check both the layer and the playground, then document the
consumer-facing behavior in the root README.
