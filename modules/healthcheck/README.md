# @onderwijsin/nuxt-healthcheck

Nuxt module that exposes public system health endpoints for uptime and dependency checks.

## Endpoints

- `GET /api/system/ping`
  - returns plain text `pong`
- `GET /api/system/health`
  - checks Nitro cache storage with a write/read probe
  - checks Cloudinary availability through `GET https://api.cloudinary.com/v1_1/<cloud_name>/ping`
  - checks Directus availability through `GET /server/ping`

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
    cloudinary: {
      threshold: {
        warn: 150,
        error: 500
      }
    },
    directus: {
      threshold: {
        warn: 250,
        error: 750
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
- The Cloudinary probe uses `runtimeConfig.public.cloudinary.cloud`,
  `runtimeConfig.cloudinary.apiKey`, and `runtimeConfig.cloudinary.apiSecret`.
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are required for the Cloudinary healthcheck to
  work.
- The Directus probe uses `directus.rest.directusBaseUrl` from `nuxt.config.ts`.
- The Directus component is included only when `DIRECTUS_URL` is defined.
