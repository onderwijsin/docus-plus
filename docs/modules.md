# Local modules

The layer includes small Nuxt modules for reusable runtime capabilities. Each module owns its
configuration, runtime code, generated types, and documentation:

- `cache` — Nitro storage cache management routes and drivers.
- `css` — shared CSS integration.
- `healthcheck` — public ping and health endpoints.
- `openapi` — build-time OpenAPI parsing and generated Content records.
- `resolve-runtime` — runtime-preset configuration.
- `routing` — shared route integration.
- `turnstile` — Turnstile configuration and runtime helpers.

Read the README next to a module before changing its options or endpoint contract. Do not duplicate
module-specific details in this index. Any module exposed to consumers must keep its configuration
and response shapes backward-compatible unless the change is explicitly versioned.
