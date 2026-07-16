![Stichting Onderwijs in](https://raw.githubusercontent.com/onderwijsin/.github/main/banner.png)

# Docus Plus

`docus-plus` is a reusable Nuxt layer for building documentation sites with Nuxt 4, Docus, and
Nuxt Content. It provides an opinionated approach to Docus, and extends it with Scalar API reference,
enhanced search, Vercel Gateway-free assistant integration, and a release notes timeline.

This repository contains the published layer, the official documentation site, a development playground, and a standalone starter template with CLI.

For detailed guidance, visit [docus-plus.onderwijsin.nl](https://docus-plus.onderwijsin.nl).

## Use the layer

The reusable layer is published as [@onderwijsin/docus-plus](https://www.npmjs.com/package/@onderwijsin/docus-plus).
For setup, configuration, extension points, and deployment guidance, read the
[layer README](./layer/README.md) or visit the [official documentation site](https://docus-plus.onderwijsin.nl).

## Repository contents

This repository contains the reusable layer, its official documentation site, a feature-complete
playground, a standalone starter template, and the project generator CLI.

## Local development

This repository is a pnpm workspace. The official docs application is the default development
target, while the playground is the compact, feature-complete integration harness:

```bash
pnpm install
pnpm dev              # Run the official docs site
pnpm playground:dev   # Run the feature playground
```

Both applications extend the local workspace package. The `create-docus-plus` CLI packages the
complete `.starters/default/` consumer example, including app overrides, multi-source Scalar,
changelog examples, and guides.

## Repository structure

```text
layer/     Published Docus Plus Nuxt layer
docs/      Official Docus Plus documentation site and internal notes
playground/ Feature-complete integration consumer
.starters/ Standalone starter templates used by the CLI
cli/       Published create-docus-plus project generator
```

Read [docs/internal/README.md](./docs/internal/README.md) for the maintainer documentation index. Contributions must
follow [AGENTS.md](./AGENTS.md). Agents do not commit changes in this repository.
