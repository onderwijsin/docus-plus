/**
 * Ambient declaration entrypoint.
 *
 * Nuxt uses multiple generated TypeScript projects. This file is included from
 * the project root and imports declaration augmentations that must be visible
 * across app, server, shared, and test typechecking contexts.
 */
import "./envs/env";
import "./shared/types/runtimeConfig";

export {};
