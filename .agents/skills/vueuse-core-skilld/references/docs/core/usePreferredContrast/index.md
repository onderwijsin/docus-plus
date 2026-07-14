---
category: Browser
---

# usePreferredContrast

Reactive prefers-contrast media query.

## Usage

```ts
import { usePreferredContrast } from '@vueuse/core'

const preferredContrast = usePreferredContrast()
```

## Component Usage

```vue
<template>
  <UsePreferredContrast v-slot="{ contrast }">
    Preferred Contrast: {{ contrast }}
  </UsePreferredContrast>
</template>
```
