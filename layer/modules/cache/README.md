# @onderwijsin/nuxt-cache

Nuxt module that exposes admin-protected `/api/_cache/*` routes for managing Nitro storage cache
entries.

## Context

- Runtime targets
  - `node-server` (default, Coolify deployment path)
  - `cloudflare_module`
- Storage backend is selected automatically from the active runtime:
  - development: filesystem
  - `node-server`: Valkey/Redis when configured, otherwise Nitro's memory driver
  - `cloudflare_module`: Cloudflare KV binding
- The module owns cache-driver orchestration through its Nuxt module options.
- The module wires custom storage drivers from [`runtime/drivers/`](./runtime/drivers).

## Module Configuration

Configure the module from `nuxt.config.ts` under `cache`:

```ts

import { ENV } from 'varlock/env'

cache: {
  redis: {
    redisUrl: ENV.REDIS_URL,
    host: ENV.REDIS_HOST,
    port: ENV.REDIS_PORT,
    username: ENV.REDIS_USERNAME,
    password: ENV.REDIS_PASSWORD,
    db: ENV.REDIS_DB,
    tls: ENV.REDIS_TLS,
    tlsRejectUnauthorized: ENV.REDIS_TLS_REJECT_UNAUTHORIZED !== false
  }
}
```

Validation rules on module startup:

- `cache.redis.redisUrl` enables URL-based Redis configuration.
- Otherwise `cache.redis.host`, `cache.redis.username`, and `cache.redis.password` are required.
- Redis is optional for `node-server` production builds. If no Redis settings are provided, the
  module uses Nitro's in-memory driver.
- `cloudflare_module` builds require:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_KV_API_TOKEN`
  - `CLOUDFLARE_CACHE_NAMESPACE_ID`
  - `CLOUDFLARE_WORKER_NAME`
- `CLOUDFLARE_KV_API_TOKEN` must include Cloudflare KV namespace read and write access.
- `nuxt dev` always uses the module-managed filesystem cache driver, using Nitro’s normal
  build-cache base directory unless an explicit dev cache base is already configured.

## Custom Drivers

The cache module ships driver wrappers that:

1. Use an underlying Unstorage driver implementation (`redis`, `memory`, or `fs`).
2. Persists cache metadata in sidecar meta keys (`<cacheKey>$`).
3. Stores `metadata.path` from the active Nitro request path.

This metadata is required for targeted invalidation in `POST /api/_cache/flush`.

Current drivers:

- [`runtime/drivers/redis.mjs`](./runtime/drivers/redis.mjs)
- [`runtime/drivers/memory.mjs`](./runtime/drivers/memory.mjs)
- [`runtime/drivers/fs.mjs`](./runtime/drivers/fs.mjs)
- [`runtime/drivers/cloudflare-kv-binding.mjs`](./runtime/drivers/cloudflare-kv-binding.mjs)

The shared metadata wrapper logic lives in
[`runtime/drivers/utils.mjs`](./runtime/drivers/utils.mjs) so additional drivers can reuse the same
path-metadata behavior later.

## Endpoints

- `GET /api/_cache/keys`
- `GET /api/_cache/[...key]`
- `DELETE /api/_cache/[...key]`
- `GET /api/_cache/base/[...base]`
- `DELETE /api/_cache/base/[...base]`
- `POST /api/_cache/clear`
- `POST /api/_cache/invalidate`
- `POST /api/_cache/flush`

All JSON responses follow the project API contract:

- `useApiResponse(...)` -> `{ data: ... }`

Key format notes:

- `GET /api/_cache/keys` returns mount-local cache keys (for example `pages:article-one`).
- Metadata responses can expose canonical fully-qualified keys (for example
  `cache:pages:article-one`).
- `GET /api/_cache/[...key]` and `DELETE /api/_cache/[...key]` accept both formats.

## Auth

Routes require either:

- `x-admin-token: <API_TOKEN>`
- `Authorization: Bearer <API_TOKEN>`

Token resolution order:

1. `cache.apiToken`
2. top-level runtime `apiToken`
3. `API_TOKEN` env

## Flush Integration

`POST /api/_cache/flush` validates CMS payloads with module-local Zod schemas and resolves storage
keys via `cacheMap`.

For Cloudflare production builds, bulk cache deletion uses the Cloudflare KV HTTP API because KV
bindings do not support bulk delete. The module expands each cache key to include its metadata
sidecar key (`<key>$`) so path metadata stays consistent after invalidation.

When Cloudflare KV API access is enabled, the private runtime config shape uses
`runtimeConfig.cache.cloudflare.kvApiToken` sourced from `CLOUDFLARE_KV_API_TOKEN`.
