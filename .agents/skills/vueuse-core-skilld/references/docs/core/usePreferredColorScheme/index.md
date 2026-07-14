---
category: Browser
---

# usePreferredColorScheme

Reactive prefers-color-scheme media query.

## Usage

```ts
import { usePreferredColorScheme } from '@vueuse/core'

const preferredColor = usePreferredColorScheme()
```

## Component Usage

```vue
<template>
  <UsePreferredColorScheme v-slot="{ colorScheme }">
    Preferred Color Scheme: {{ colorScheme }}
  </UsePreferredColorScheme>
</template>
```
