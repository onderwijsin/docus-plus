# Runtime and configuration

The layer supports two Nitro deployment paths, selected through the `NITRO_PRESET` environment
variable:

- `node-server` for Node environments.
- `cloudflare_module` for Cloudflare Workers.

Configure the target before building:

```dotenv
# Selected Nitro deployment target. Must be set to either `node-server` or `cloudflare_module`.
NITRO_PRESET=node-server
```

The layer does not choose a hosting provider beyond this Nitro target. Deployment, secrets, public
URLs, and environment loading belong to the consuming application. Cloudflare builds additionally
require the conditional Cloudflare variables documented in the [README](../../README.md#environment-variables).

The consumer supplies site identity in `nuxt.config.ts` through options such as `site`, `mcp`, and,
when needed, `schemaOrg.identity`. Public MCP identity is also mirrored under
`runtimeConfig.public.mcp` in the playground example.

Consumer configuration is merged with the layer by Nuxt. Treat shared configuration keys, routes,
component names, and generated content collection shapes as public contracts. Review the generated
Nuxt configuration and run the playground build when changing them.
