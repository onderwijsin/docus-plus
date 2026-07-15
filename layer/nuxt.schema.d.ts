/**
 * Ambient declaration entrypoint.
 *
 * Nuxt uses multiple generated TypeScript projects. This file is included from
 * the project root and imports declaration augmentations that must be visible
 * across app, server, shared, and test typechecking contexts.
 */
import "./app/types/appConfig";
import "./modules/cache/runtime/types/config";
import "./modules/healthcheck/runtime/types/config";
import "./modules/mailchimp/runtime/types/config";
import "./modules/openapi/build/types/config";
import "./modules/resolve-runtime/runtime/types/config";
import "./modules/turnstile/runtime/types/config";
import "./shared/types/ai";
import "./shared/types/runtimeConfig";

export {};
