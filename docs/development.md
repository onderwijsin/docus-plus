# Development and releases

Use the package manager and version declared in `package.json` through Corepack:

```bash
corepack pnpm dev          # Run the reference playground
corepack pnpm build       # Build the playground consumer
corepack pnpm typecheck   # Generate types and type-check the layer
corepack pnpm fmt:check   # Check formatting
corepack pnpm lint        # Run Oxlint
```

The playground is the primary integration test. After changing shared styles, component resolution,
content collections, or Nuxt configuration, verify the corresponding consumer override there.

## Docus type-check patch

`docus@5.12.3` is patched in `patches/docus@5.12.3.patch` so dependency-source diagnostics do not
prevent the layer from running `nuxt typecheck`. Nuxt includes layer source files in the consumer's
TypeScript project, so `skipLibCheck` and `tsconfig.exclude` cannot suppress these errors.

The patch keeps runtime behavior intact: it accepts Docus's partial Nuxt UI app config, handles an
optional locale config, gives the close button a void event handler, and narrows assistant message
parts by their stable discriminants instead of crossing the AI SDK 6/7 type boundary. Remove the
patch and the two local `AppConfigInput["ui"]` casts when the upstream packages accept partial layer
app config and align their assistant message types.

Releases are published from the GitHub repository and consumed with a versioned layer reference:

```ts
extends: ["github:onderwijsin/docus-plus@v0.0.1"]
```

Keep release notes and commit messages in Conventional Commit format. Agents must leave commits to
the human collaborator.
