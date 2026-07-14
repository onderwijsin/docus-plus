![Stichting Onderwijs in](https://raw.githubusercontent.com/onderwijsin/docus-plus/main/public/onderwijsin_banner.png)

# Docus Plus

`docus-plus` is a reusable Nuxt layer for building documentation sites with Nuxt 4, Docus, and
Nuxt Content. It provides an opinionated approach to Docus, and extends it with Scalar API referenced,
enhanced search, and Vercel Gateway-free assistant integration.

The repository is the layer itself. The `.playground/` application is the reference implementation
for consuming and customising it.

## Create a documentation site

Start with a fresh Nuxt 4 project, install the package, and extend it from your project's
`nuxt.config.ts`:

```bash
corepack pnpm add @onderwijsin/docus-plus
```

```ts
export default defineNuxtConfig({
  extends: ["@onderwijsin/docus-plus"]
});
```

Pin the package version in production so that the site does not change unexpectedly when the layer
is updated.

### Add the content directory

Create `content/index.yml` for the landing page. The layer validates the landing-page shape, so
include SEO metadata, a hero, features, and a call to action. Add documentation pages under
`content/docs/`.

```yml
seo:
  title: Example documentation
  description: Documentation for the Example project.
  ogImage: https://example.com/og-image.png
hero:
  title: Build with the Example platform
  description: Learn how to use the Example platform.
  links:
    - label: Get started
      to: /getting-started
      color: primary
features:
  title: Everything you need
  description: A focused set of guides and references.
  items:
    - icon: i-lucide-book-open
      title: Guides
      description: Explain the main integration paths.
cta:
  title: Start building
  description: Follow the guides to create your first integration.
  links:
    - label: Read the guide
      to: /getting-started
      color: primary
```

Documentation pages use Nuxt Content frontmatter:

```md
---
title: Getting started
description: Create your first integration.
---

Your guide starts here.
```

### Configure site identity and integrations

Set the identity that belongs to your site in `nuxt.config.ts`. The exact options depend on the
integrations you enable, but the playground demonstrates the shared identity contract:

```ts
export default defineNuxtConfig({
  site: {
    name: "Example Docs",
    description: "Documentation for the Example platform."
  },
  mcp: {
    name: "Example Docs MCP",
    description: "Read-only documentation discovery for Example Docs."
  }
});
```

If your site publishes structured organization metadata, provide your own `schemaOrg.identity`
value as well. Do not inherit the layer's default organization (Stichting Onderwijs in) identity for a different brand.

### Configure the UI

Use `app/app.config.ts` for site-specific Docus and Nuxt UI settings. For example, configure the
header title, GitHub link, colors, table of contents, and assistant visibility:

```ts
export default defineAppConfig({
  header: { title: "Example Docs" },
  github: {
    owner: "example",
    name: "example-docs",
    url: "https://github.com/example/example-docs"
  },
  ui: {
    colors: { primary: "brand", neutral: "slate" }
  },
  assistant: {
    floatingInput: true,
    explainWithAi: true
  }
});
```

### Configure the assistant

Override AI behavior from the consuming app's `nuxt.config.ts` with the `ai` prop. Defaults
include the Mistral medium model, an 8,000-token output limit, two retries, and up to ten
tool-calling steps.

```ts
export default defineNuxtConfig({
  ai: {
    model: "mistral-large-latest",
    maxOutputTokens: 12000,
    maxRetries: 3,
    maxSteps: 12,
    temperature: 0.2,
    providerOptions: {
      gateway: { caching: "auto" }
    },
    systemPrompt: "You are the documentation assistant for Example Docs."
  }
});
```

The `systemPrompt` value replaces the generated documentation-aware prompt when provided.
See the [assistant configuration reference](docs/assistant.md) for all available options.

### Add your design tokens

Create `app/app.css` and import the layer stylesheet first. This import is required: it preserves
the layer's base styles and tokens while allowing your site to add or override them.

```css
@import "#layers/docus-plus/app/app.css";

@theme {
  /* Add your tailwind theme tokens here */
  --color-brand-500: oklch(60% 0.2 250);
}
```

### Replace the default logo when needed

The layer supplies an `AppHeaderLogo` component. To use your own mark or remove the default
Onderwijs in branding, create `app/components/AppHeaderLogo.vue` in the consuming application.
Nuxt's component resolution will use the application component as the override.

## Local development

This repository includes the playground used to verify the layer:

```bash
corepack pnpm install
corepack pnpm dev
```

The playground is configured in `.playground/nuxt.config.ts` and extends the local layer with
`extends: [".."]`. Its content, app config, stylesheet, and logo override are the canonical setup
examples for a consuming project.

## Environment variables

The repository keeps a Varlock schema in [`envs/`](./envs/). In this layer repository, Varlock is
used for schema validation and TypeScript type generation; the schemas do not prescribe a secret
manager. Required values are listed below. Conditional requirements apply only when the matching
runtime or feature is enabled.

| Variable                        | Type                                           | Required                                      |
| ------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `APP_ENV`                       | `development \| preview \| production \| next` | Yes                                           |
| `MODE`                          | `development \| preview \| production \| test` | Yes                                           |
| `NITRO_PRESET`                  | `node-server \| cloudflare_module`             | No, defaults to `node-server`                 |
| `BUILD`                         | boolean                                        | No                                            |
| `NUXT_PUBLIC_SITE_URL`          | URL                                            | Yes                                           |
| `API_TOKEN`                     | string, sensitive                              | Yes                                           |
| `PLAUSIBLE_DOMAIN`              | string                                         | No                                            |
| `DISABLE_TRACKING`              | boolean                                        | No                                            |
| `DISABLE_INDEXING`              | boolean                                        | No                                            |
| `MAILCHIMP_API_KEY`             | string, sensitive                              | No                                            |
| `MAILCHIMP_LIST`                | string                                         | No                                            |
| `MAILCHIMP_SERVER`              | string                                         | No                                            |
| `TURNSTILE_SITE_KEY`            | string                                         | No                                            |
| `TURNSTILE_SECRET_KEY`          | string, sensitive                              | No                                            |
| `MISTRAL_API_KEY`               | string, sensitive                              | Yes                                           |
| `OPENAPI_SOURCE_TYPE`           | `local \| remote`                              | No                                            |
| `OPENAPI_LOCATION`              | string                                         | No                                            |
| `DIRECTUS_URL`                  | URL                                            | Yes                                           |
| `DIRECTUS_PUBLIC_TOKEN`         | string                                         | Yes                                           |
| `AI_GATEWAY_API_KEY`            | string, sensitive                              | Yes                                           |
| `CLOUDFLARE_WORKER_NAME`        | string                                         | Conditional: `NITRO_PRESET=cloudflare_module` |
| `CLOUDFLARE_ACCOUNT_ID`         | string                                         | Conditional: `NITRO_PRESET=cloudflare_module` |
| `CLOUDFLARE_CACHE_NAMESPACE_ID` | string, sensitive                              | Conditional: `NITRO_PRESET=cloudflare_module` |
| `CLOUDFLARE_KV_API_TOKEN`       | string, sensitive (`cfat_…`)                   | Conditional: `NITRO_PRESET=cloudflare_module` |
| `REDIS_URL`                     | URL, sensitive                                 | No                                            |
| `REDIS_HOST`                    | string                                         | No                                            |
| `REDIS_PORT`                    | port                                           | No                                            |
| `REDIS_USERNAME`                | string                                         | No                                            |
| `REDIS_PASSWORD`                | string, sensitive                              | No                                            |
| `REDIS_DB`                      | number                                         | No                                            |
| `REDIS_TLS`                     | boolean                                        | No                                            |
| `REDIS_TLS_REJECT_UNAUTHORIZED` | boolean                                        | No                                            |
| `DEBUG`                         | boolean                                        | Yes                                           |
| `DISABLE_PRE_COMMIT_FORMAT`     | boolean                                        | No                                            |
| `DISABLE_PRE_COMMIT_LINT`       | boolean                                        | No                                            |
| `DISABLE_PRE_COMMIT_TYPECHECK`  | boolean                                        | No                                            |
| `DISABLE_PRE_PUSH_TYPECHECK`    | boolean                                        | No                                            |
| `DISABLE_PRE_PUSH_FORMAT`       | boolean                                        | No                                            |
| `DISABLE_PRE_PUSH_LINT`         | boolean                                        | No                                            |
| `VITEST`                        | boolean                                        | No                                            |
| `NUXT_TEST`                     | boolean                                        | No                                            |
| `NODE_ENV`                      | `development \| test \| production`            | No                                            |

Mailchimp is optional. The Mailchimp module is disabled when any of
`MAILCHIMP_API_KEY`, `MAILCHIMP_LIST`, or `MAILCHIMP_SERVER` is missing, and its `/api/mailchimp`
server route is not registered in that case. When all three values are set, the newsletter signup
is enabled automatically.

The schema also uses `VARLOCK_IS_CI` internally when Varlock is running in CI. `NITRO_PRESET` selects
the deployment path supported by the layer:

- `node-server` builds a Nitro server for Node environments.
- `cloudflare_module` builds a Cloudflare Worker and enables the conditional Cloudflare settings.

Set it explicitly in the environment used for the build:

```dotenv
# Selected Nitro deployment target. Must be set to either `node-server` or `cloudflare_module`.
NITRO_PRESET=node-server
```

The default schema value is `node-server`. When using `cloudflare_module`, provide the required
Cloudflare variables listed above.

### Add secrets in a consuming project

Copy the relevant files from `envs/` into the consuming repository, keep the type and required
annotations, and add the secret location syntax supported by your environment. For example, a
consumer can add a Varlock plugin or a provider expression for a password manager, CI secret, or
local development file. The layer remains independent of that choice.

Do not commit populated secret values or provider credentials. Keep only schemas, safe examples, and
the generated type contract in version control.

Useful checks are:

```bash
corepack pnpm typecheck
corepack pnpm fmt:check
corepack pnpm lint
corepack pnpm build
```

## Repository structure

```text
app/       Shared components, layouts, composables, and CSS
config/    Shared configuration helpers and defaults
content/   Layer-owned content collection configuration
docs/      Internal layer documentation
modules/   Reusable local Nuxt modules
server/    Shared Nitro routes and utilities
shared/    Code shared by the app and server
.playground/ Reference consuming application
```

Read [docs/README.md](./docs/README.md) for the internal documentation index. Contributions must
follow [AGENTS.md](./AGENTS.md). Agents do not commit changes in this repository.
