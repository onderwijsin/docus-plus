# Conventions

- Prefer small changes that follow nearby Nuxt and Docus patterns.
- Use Vue Composition API with `<script setup>` and TypeScript.
- Validate external input at boundaries with Zod where applicable.
- Keep presentational code in components and reusable logic in composables or server utilities.
- Keep consumer identity, branding, content, and design tokens out of layer defaults.
- Preserve public route, component, module-option, and response contracts.
- Add JSDoc for exported utilities, module options, and non-obvious runtime behavior.
- Use Nuxt Content frontmatter and documented MDC components in content examples.

The root README is the public implementation guide. Update it when consumers need a new setup step
or override pattern. Keep this directory focused on internal implementation and maintenance notes.
