![Stichting Onderwijs in](https://raw.githubusercontent.com/onderwijsin/.github/main/banner.png)

# Create Docus Plus

Create a complete, standalone Docus Plus documentation site from the maintained default starter.
The generated project extends the published `@onderwijsin/docus-plus` package and includes working
content, UI overrides, multi-source Scalar references, Oxlint, and Oxfmt.

## Quick start

```bash
npx create-docus-plus my-docs
cd my-docs
pnpm install
pnpm dev
```

The command asks for a package name when one is not supplied. It also works fully interactively:

```bash
npx create-docus-plus
```

## Automation

Pass both the destination and a valid npm package name in non-interactive environments:

```bash
npx create-docus-plus ./my-docs --name my-docs
```

Project names may contain lowercase letters, numbers, dots, hyphens, and underscores. Scoped names
such as `@example/my-docs` are also supported.

## Existing directories

The generator refuses to write to a non-empty directory. To intentionally copy the starter into an
existing directory, use `--force`:

```bash
npx create-docus-plus ./my-docs --name my-docs --force
```

`--force` may overwrite files supplied by the starter. Review the target directory first.

## Next steps

After installing dependencies, start the development server with `pnpm dev`. See the
[Docus Plus documentation](https://docus-plus.onderwijsin.nl) for configuration and deployment
guidance.
