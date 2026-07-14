# AGENTS.md

> Operational contract for contributors and coding agents working on the `docus-plus` Nuxt layer.

## Before you start

1. Understand whether the request changes the reusable layer, the playground, or both.
2. Read the relevant page in `docs/` and inspect nearby implementations.
3. Keep the change small and preserve the public layer contract unless a breaking change is
   explicitly requested.

## Repository context

This repository is a reusable Nuxt layer. It is not a customer documentation site and must not
contain product-specific assumptions in shared defaults. The `.playground/` directory is a local
consumer and reference implementation.

When a behavior is site-specific, put it in the consuming project or the playground. When it is
generic and useful to every consumer, put it in the layer and document the extension point.

## Hard rules

- Use the project-pinned package manager through `corepack pnpm`.
- Do not run `pnpm install`, change `node_modules`, or update the lockfile unless dependency work
  is explicitly requested.
- Do not create or configure a repository-local PNPM store.
- Do not edit `.husky/**`, `.agents/skills/**`, or `modules/*/runtime/types/**` unless explicitly
  requested. Put runtime type augmentation in the supported server/runtime location.
- Use Zod for boundary validation where applicable.
- Wrap JSON API responses with `useApiResponse(...)`, except passthrough, proxy, and streaming
  responses.
- Preserve route names, configuration keys, component names, and response shapes unless a breaking
  change is part of the request.
- Do not add dependencies without a clear, demonstrated need.
- Do not commit changes. The human collaborator reviews and commits them.

## Working principles

Prefer existing Nuxt, Docus, Nuxt Content, and module patterns. Keep presentational concerns in
components, reusable client logic in composables, and server behavior in modules or server
utilities. Keep consumer-specific identity, content, branding, and tokens out of shared layer
defaults.

## Documentation

`docs/` is the source of truth for the layer's internal implementation notes. Update it when a
non-obvious architecture or public extension point changes. The root README is the consumer-facing
implementation guide; keep it focused on setting up a project with the layer.

## Definition of done

For code changes, run the applicable checks:

```bash
corepack pnpm typecheck
corepack pnpm fmt:check
corepack pnpm lint
corepack pnpm build
```

For documentation-only changes, run formatting and any relevant validation available without
mutating dependency state. In your handoff, summarize what changed, contract or behavior impact,
verification performed, and open risks or follow-up work.

Use Conventional Commit syntax when describing a proposed commit, but do not create the commit.
