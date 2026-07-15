# Assistant configuration

The assistant is configured from the consuming application's `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  ai: {
    model: "mistral-large-latest",
    systemPrompt: "You are the documentation assistant for Example Docs."
  }
});
```

`ai` accepts model, generation, retry, tool-calling, provider, and streaming controls. The
defaults are defined in [`AssistantAiConfig`](../../layer/shared/types/ai.ts), whose property comments are
the reference for each option. `systemPrompt` is optional; when omitted, the layer generates a
documentation-aware prompt from the site's identity and enabled API features.
