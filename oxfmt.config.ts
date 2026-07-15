import { defineConfig } from "oxfmt";

export default defineConfig({
  trailingComma: "none",
  ignorePatterns: [
    ".idea/",
    ".next/",
    "pnpm-lock.yaml",
    "CHANGELOG.md",
    "dist",
    ".nuxt",
    "nuxt/.nuxt",
    ".output",
    "node_modules",
    ".agent/skills",
    ".agents/skills",
    ".agents/**",
    "scripts/**/*.sh",
    "layer/envs/env.d.ts",
    ".starters/**",
    "content/**"
  ]
});
