# Environment schemas

The [`layer/envs/`](../../layer/envs/) directory is the layer's environment contract. It is used for Varlock schema
validation and TypeScript type generation. It deliberately does not choose a secret manager or
contain provider-specific secret references.

The root schema imports focused sections for core application settings, development flags, Docus,
Cloudflare, and Redis. Comments in those files are the authoritative source for each variable's type,
sensitivity, and required or optional status. The consumer-facing summary is in the [README
environment table](../../README.md#environment-variables).

## Consumer setup

A consuming project can copy the relevant schemas and then add the secret locations appropriate for
its environment. Those locations may be local `.env` files, CI secrets, a password manager, or a
Varlock provider plugin. Keep provider expressions in the consuming repository so this reusable
layer remains neutral.

The layer repository should only keep safe empty values, validation annotations, and generated types.
Never commit populated secrets or credentials.

Run type generation with:

```bash
corepack pnpm env:typegen
```
