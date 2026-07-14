---
name: mdc-syntax
description: Write, repair, and review Markdown Component (MDC) syntax in Nuxt Content or Docus Markdown files. Use when adding or editing `::component` blocks, named slots, nested components, Nuxt UI Prose components such as callouts, tabs, code groups, steps, field groups, card groups, or badges, or when a formatter has damaged MDC indentation or delimiters.
---

# MDC Syntax

Use this skill to preserve valid, readable MDC in Markdown.

## Repair workflow

1. Inventory every MDC opener, closer, slot, and YAML-prop fence in the affected files.
2. Match each opener with a closer of the same colon depth.
3. Restore nesting with both indentation and one additional colon per component level.
4. Keep Markdown content inside the intended default or named slot.
5. Run the site/content build and inspect rendered pages that contain every repaired pattern.

## Core syntax

- Use `:component` for inline components and `::component` for block components.
- Keep block openers and closers on their own lines.
- Use `#slot-name` for named slots.
- Nest a component by indenting it and adding one colon: `::` → `:::` → `::::`.
- Close a nested component with the same number of colons used to open it.
- Attach props immediately to the component: `::callout{icon="i-lucide-info" color="info"}`.
- Use `---` inside a component only for YAML props; it is not an MDC closing delimiter.

```mdc
::u-page-hero
#title
Title

#links
  :::u-button{to="/getting-started"}
  Start here
  :::
::
```

## Nuxt UI Prose patterns

Use standard Markdown for headings, paragraphs, lists, tables, links, and code blocks. Nuxt UI maps them to Prose components automatically.

````mdc
::callout{icon="i-lucide-info" color="info"}
Important context with **Markdown** support.
::

::note
Additional information.
::

::code-collapse
```ts [example.ts]
const answer = 42
```
::

::code-group
```bash [pnpm]
pnpm add package
```

```bash [npm]
npm install package
```
::

::field-group
  :::field{name="token" type="string"}
  A static API token.
  :::
::

::tabs
  :::tabs-item{label="First"}
  First tab content.
  :::

  :::tabs-item{label="Second"}
  Second tab content.
  :::
::

::steps
### First step
Do this first.

### Second step
Then continue.
::

::card-group
  :::card
  ---
  title: Example
  icon: i-lucide-star
  ---
  Card content.
  :::
::

::badge
**v1.0.0**
::
````

## Validation checklist

- Do not flatten nested children to column zero.
- Do not replace matching nested closers with `::`.
- Do not move component props onto a later line.
- Do not turn MDC component YAML props into page frontmatter.
- Keep fenced code blocks intact; their backticks are unrelated to MDC delimiters.
- Confirm every `#slot` belongs to the nearest open block component.
- In package-manager code groups, list tabs in this order: `pnpm`, `npm`, `yarn`, then `bun`.
- Check generated HTML or run the Nuxt build after changes.
