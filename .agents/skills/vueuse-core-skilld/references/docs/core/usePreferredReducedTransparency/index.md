---
category: Browser
---

# usePreferredReducedTransparency

Reactive prefers-reduced-transparency media query.

## Usage

```ts
import { usePreferredReducedTransparency } from '@vueuse/core'

const preferredTransparency = usePreferredReducedTransparency()
```

## Component Usage

```vue
<template>
  <UsePreferredReducedTransparency v-slot="{ transparency }">
    Preferred Reduced transparency: {{ transparency }}
  </UsePreferredReducedTransparency>
</template>
```
