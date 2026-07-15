import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["jsdoc", "typescript", "vue"],
  categories: {
    correctness: "warn"
  },
  rules: {
    "vue/prop-name-casing": "off",
    "eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_"
      }
    ]
  },
  ignorePatterns: [
    ".agents/**",
    "content/**",
    "env.d.ts",
    "envs/env.d.ts",
    "node_modules/**",
    ".nuxt/**",
    ".output/**",
    ".data/**"
  ]
});
