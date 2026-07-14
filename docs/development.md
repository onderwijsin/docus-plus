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

Releases are published from the GitHub repository and consumed with a versioned layer reference:

```ts
extends: ["github:onderwijsin/docus-plus@v0.0.1"]
```

Keep release notes and commit messages in Conventional Commit format. Agents must leave commits to
the human collaborator.
