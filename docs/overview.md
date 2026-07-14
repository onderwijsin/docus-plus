# Overview

`docus-plus` is a reusable Nuxt layer for documentation products. It extends Docus and Nuxt
Content, then adds shared application components, styling, search behavior, assistant integration,
optional API-reference support, and reusable local Nuxt modules.

The layer owns generic behavior. A consuming project owns its documentation content, landing-page
data, product identity, organization metadata, branding, design tokens, environment values, and
deployment configuration.

The `.playground/` directory is a working consumer. It is the best place to verify how a layer
change behaves when a project supplies its own `content/`, `app/app.config.ts`, `app/app.css`, and
component overrides.
