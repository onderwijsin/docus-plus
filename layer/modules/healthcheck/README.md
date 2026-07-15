# @onderwijsin/nuxt-healthcheck

Nuxt module that exposes public system health endpoints for uptime and dependency checks.

## Endpoints

- `GET /api/system/ping`
  - returns plain text `pong`
- `GET /api/system/health`
  - checks Nitro cache storage with a write/read probe

## Response Contract

`GET /api/system/health` returns `useApiResponse(...)` with:

- top-level `status`
- top-level `timestamp`
- per-component `status`
- per-component `responseTimeMs`

When any dependency check fails, the endpoint responds with HTTP `503` and includes the failed
component status in the JSON payload.

## Thresholds

You can degrade component status based on response time thresholds in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  healthcheck: {
    cache: {
      threshold: {
        warn: 50,
        error: 200
      }
    }
  }
});
```

- `warn`: component status becomes `warn` when `responseTimeMs >= warn`
- `error`: component status becomes `error` when `responseTimeMs >= error`
- overall health status becomes the worst component status
- HTTP `503` is only used when overall status is `error`

## Notes

- `GET /api/system/ping` remains public and unauthenticated.
- `GET /api/system/health` is unauthenticated.
- Route caching and prerendering are disabled for `/api/system/**`.
- The cache probe writes, reads, and removes a short-lived value from the configured Nitro cache
  storage.
