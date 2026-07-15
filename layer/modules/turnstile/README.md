# @onderwijsin/nuxt-turnstile

Nuxt module that centralizes the app's Cloudflare Turnstile runtime contract.

## What It Owns

- `turnstile` config from `nuxt.config.ts`
- `useTurnstile()` composable
- `assertTurnstileToken(event, expectedAction)` server utility
- Turnstile error schema/types
- `x-turnstile-token` request-header constant

## Nuxt Config

Keep `@nuxtjs/turnstile` in `modules`, then configure this local module through the same `turnstile`
key:

```ts
import { ENV } from "varlock/env";

export default defineNuxtConfig({
  modules: ["@nuxtjs/turnstile", "./modules/turnstile"],
  turnstile: {
    enabled: true,
    siteKey: ENV.TURNSTILE_SITE_KEY ?? "",
    secretKey: ENV.TURNSTILE_SECRET_KEY ?? ""
  }
});
```

The module mirrors that config into:

- `runtimeConfig.turnstile.secretKey`
- `runtimeConfig.public.turnstile.siteKey`
- top-level `turnstile.siteKey` for `@nuxtjs/turnstile`

## Runtime Surface

- Client: `useTurnstile()`
- Server: `assertTurnstileToken(event, expectedAction)`
- Shared constant: `TURNSTILE_TOKEN_HEADER`

## Notes

- Runtime behavior remains Node/Coolify compatible.
- The server helper still honors the existing admin bypass logic via `isAdmin(event)`.
- Existing legacy imports in `app/composables`, `server/utils`, and `schema/security` are kept as
  thin compatibility re-exports.
