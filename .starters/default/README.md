# Docus Plus starter

This is a complete consumer project built with the Docus Plus Nuxt layer. Adapt the identity,
content, integrations, and deployment settings to your project.

## Start local development

Install the dependencies, copy the environment example, and start Nuxt:

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site. The detailed implementation
guides live in the [`content/docs/`](./content/docs/) directory and are also available in the
[official Docus Plus documentation](https://docus-plus.onderwijsin.nl).

## Upgrade Docus Plus

Update the layer package and review the generated lockfile before committing the change:

```bash
pnpm update @onderwijsin/docus-plus
```

Read the [release notes](https://docus-plus.onderwijsin.nl/changelog) for migration notes and
follow the official documentation for any configuration changes.

## Choose a deployment path

Docus Plus supports two server deployment paths. Select the target when building the application:

### Node server

Build for a Node deployment and start the generated Nitro server with your hosting provider:

```bash
NITRO_PRESET=node-server pnpm build
node .output/server/index.mjs
```

### Cloudflare Worker

Build for Cloudflare Workers and deploy the generated output with your Cloudflare deployment
workflow:

```bash
NITRO_PRESET=cloudflare_module pnpm build
```

Configure the required Cloudflare account, worker, URL, and secret values in the deployment
environment. See the [deployment guide](https://docus-plus.onderwijsin.nl/guides/integrations-and-deployment)
for the runtime requirements and environment variables.

Static `pnpm generate` deployments and zero-runtime OG images are not supported.
