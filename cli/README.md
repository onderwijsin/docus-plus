![Stichting Onderwijs in](https://raw.githubusercontent.com/onderwijsin/.github/main/banner.png)

# Create Docus Plus

Create a complete, standalone Docus Plus documentation site from the maintained default starter.
The CLI delegates project creation to Nuxt's initializer, which downloads the starter directly from
the Docus Plus repository.

## Quick start

```bash
npx create-docus-plus my-docs
cd my-docs
pnpm install
pnpm dev
```

When no destination is supplied, it creates a project in `./docs`:

```bash
npx create-docus-plus
```

Nuxt's initializer handles prompts, package metadata, and an existing destination consistently with
other Nuxt starters.

## Next steps

After installing dependencies, start the development server with `pnpm dev`. See the
[Docus Plus documentation](https://docus-plus.onderwijsin.nl) for configuration and deployment
guidance.
