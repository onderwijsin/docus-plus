# @onderwijsin/resolve-runtime

Nuxt module that resolves the active Nitro runtime preset and applies runtime-specific Nitro
configuration.

## Context

- Supported presets:
  - `node-server`
  - `cloudflare_module`
- Runtime selection is driven by `NITRO_PRESET` (required).
- The module requires `NITRO_PRESET` to be explicitly set to either `node-server` or
  `cloudflare_module`.

## What It Does

During module setup it:

1. Resolves the active preset from `NITRO_PRESET` (required).
2. Merges the matching Nitro config into `nuxt.options.nitro`.
3. Publishes `runtimeConfig.resolveRuntime.preset` for runtime server logic.
4. Registers the Cloudflare Sentry Nitro plugin only for `cloudflare_module`.
5. Adds a generated `sentry.server.config.ts` template for `node-server` builds so production Node
   startup can preload the module-local Sentry config.
6. Removes the upstream `sentry-rollup-plugin` Nitro upload pass by default when
   `SENTRY_UPLOAD_SOURCE_MAPS=true` so prerendered builds do not duplicate Sentry artifact work in
   the final Nitro bundle stage.

## Cloudflare Runtime

When `NITRO_PRESET=cloudflare_module`, the module validates:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_KV_API_TOKEN`
- `CLOUDFLARE_WORKER_NAME`
- `CLOUDFLARE_CACHE_NAMESPACE_ID`

`CLOUDFLARE_KV_API_TOKEN` must include KV namespace read and write access.

It then injects Wrangler config for:

- worker `name`
- Worker observability logs
- the `CACHE` KV namespace binding

The Cloudflare runtime also uses the module-local Nitro plugin in
[`runtime/plugins/sentry-cloudflare.ts`](./runtime/plugins/sentry-cloudflare.ts) instead of the Node
preload file.

### Sentry Nitro Upload Guard

- When `SENTRY_UPLOAD_SOURCE_MAPS=true`, the upstream `@sentry/nuxt` module adds:
  - Sentry Vite uploads for the Nuxt client/server builds
  - a second Sentry Rollup upload during the final Nitro build
- In this repository that extra Nitro upload can push prerendered production builds over CI memory
  limits, especially on `cloudflare_module`.
- `resolve-runtime` strips the Nitro `sentry-rollup-plugin` by default.
- Set `SENTRY_UPLOAD_NITRO_SOURCE_MAPS=true` to restore the upstream Nitro upload behavior.

## Node Runtime

When `NITRO_PRESET=node-server`, the module keeps the Node server preset in place, writes
`sentry.server.config.ts` into the Nuxt build directory with the resolved build-time Sentry values
inlined, and does not add extra runtime-specific Nitro config beyond the Node Sentry preload.
