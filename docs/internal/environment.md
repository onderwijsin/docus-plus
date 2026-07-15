# Environment schemas

The [`layer/envs/`](../../layer/envs/) directory describes the layer's environment contract. Its
primary purpose is to generate TypeScript types for the layer and to provide reusable schema
boilerplate for consuming applications. The layer does not use these files to load environment
values or validate them at runtime, and it does not require consumers to use Varlock for either
purpose.

The generated [`layer/envs/env.d.ts`](../../layer/envs/env.d.ts) supplies the typed environment
contract. The source schemas are kept alongside it so a consuming application can copy and extend
the relevant declarations with its own environment-loading and validation setup.

The root schema imports focused sections for core application settings, development flags, Docus,
Cloudflare, and Redis. Comments in those files are the authoritative source for each variable's type,
sensitivity, and required or optional status. The consumer-facing summary is in the [README
environment table](../../README.md#environment-variables).

## Consumer setup

A consuming project can copy the relevant schemas as a starting point and then add the loading and
validation mechanism, secret locations, and provider expressions appropriate for its environment.
Those choices may include local `.env` files, CI secrets, a password manager, or Varlock, but they
belong to the consuming project. Keep them there so this reusable layer remains neutral.

The layer repository should only keep safe empty values, schema annotations, and generated types.
These annotations document the intended shape and support type generation; they are not a runtime
validation boundary in the layer. Never commit populated secrets or credentials.

Run type generation with:

```bash
corepack pnpm env:typegen
```
