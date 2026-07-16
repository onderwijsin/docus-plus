# Writing content articles

Published articles live under `content/docs/`. They explain the Onderwijsloket API, services, and
integration behavior to developers. The docus-plus layer provides the page layout and rendering;
this guide defines the editorial responsibilities of this repository.

## Start with the reader's task

State what the reader will be able to do and put the shortest useful path first. Prefer one clear
question or outcome per article. Use headings that describe an action, such as “Authenticate your
requests” or “Filter articles by topic”.

Explain Onderwijsloket-specific behavior here and link to the authoritative upstream documentation
for Directus, Algolia, Cloudinary, SavvyCal, or another external service. Do not copy platform
documentation that can change independently.

## Writing guidelines

- Write in clear, direct English; use active voice and address the reader as “you”.
- Keep paragraphs short and make each paragraph do one job.
- Introduce unfamiliar terms before using abbreviations or advanced concepts.
- Use concrete, copy-pasteable examples with realistic placeholders such as `YOUR_API_TOKEN`.
- Keep secrets out of examples, URLs, browser code, and committed files.
- Show the smallest request that proves the concept before adding optional fields or relationships.
- Explain important trade-offs, permissions, limits, and failure cases next to the relevant example.
- Keep terminology and route names consistent with the API reference.
- Add frontmatter with a useful `title` and one-sentence `description`.
- Use numbered filenames and the existing section structure; do not casually move published routes.
- Link related articles instead of repeating their full content.

For Onderwijsloket content, be factual, independent, and current. Distinguish platform guarantees
from examples, and flag information that depends on permissions, provider pricing, or deployment
configuration.

## Markdown and MDC

Use standard Markdown for prose, headings, lists, tables, links, and code blocks. Use the documented
Docus/Nuxt UI MDC components when they improve comprehension: callouts for warnings and notes,
steps for ordered workflows, code groups for equivalent package-manager commands, and cards for
related resources. Keep nested MDC delimiters balanced and preserve the established indentation.

Before opening a pull request, run the site locally and inspect every page changed, including code
blocks, links, callouts, and navigation.

## Skills to apply

Apply the smallest relevant set of repository skills when writing or revising an article:

- `create-docs` — establish the Docus/Nuxt Content structure and page conventions.
- `edit-article` — improve an existing article's structure, clarity, and flow.
- `mdc-syntax` — write or validate nested MDC components and slots.
- `nuxt-ui` — choose documented Nuxt UI Prose components and valid props when presentation matters.
- `review-docs` — check frontmatter, links, structure, clarity, and rendered-document quality.
- `cloudinary-docs` or `cloudinary-transformations` — use when an article covers Cloudinary media.
- `tiptap` — use when an article explains rich content documents or Tiptap JSON.

Read the relevant `SKILL.md` before using a skill. The skills are authoring aids; the published
Onderwijsloket documentation and linked service documentation remain the sources of truth.
