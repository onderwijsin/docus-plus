# Changelog collection

The layer defines a `changelogs` Nuxt Content collection in
[`layer/content.config.ts`](../../layer/content.config.ts). It uses `type: "data"` and includes
`content/changelog/**/*.md` from the consuming application. Changelog entries deliberately do not
have individual routes: [`layer/app/pages/changelog.vue`](../../layer/app/pages/changelog.vue) queries the entire
collection and renders it at `/changelog`.

## Entry contract

Each entry must provide this frontmatter:

```md
---
name: Version 1.2.0
tag: v1.2.0
publishedAt: 2026-07-15
---
```

- `name` is the release heading shown in the timeline.
- `tag` is the stable Vue key and version badge value; it must be unique across entries.
- `publishedAt` is a date and controls descending release order. Use the ISO 8601 date form
  (`YYYY-MM-DD`) so YAML parses it as a date.

The Markdown body is rendered inside the changelog version component. Add entries in the consumer's
`content/changelog/` directory; no route or navigation configuration is needed.

## Runtime behavior

The `/changelog` page sorts entries by `publishedAt` descending and marks the first entry as
**Latest**. It returns a 404 when the collection is empty. `AppFooterRight` counts the collection
and exposes the Changelog link only when at least one entry exists.

Treat the collection name, entry schema, `/changelog` route, and conditional footer link as layer
contracts. Keep release content in the consumer or playground, never in the reusable layer.
