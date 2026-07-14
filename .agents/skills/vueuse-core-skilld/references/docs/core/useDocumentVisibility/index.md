---
category: Elements
---

# useDocumentVisibility

Reactively track `document.visibilityState`

## Usage

```vue
<script setup lang="ts">
import { useDocumentVisibility } from '@vueuse/core'

const visibility = useDocumentVisibility()
</script>
```

## Component Usage

```vue
<template>
  <UseDocumentVisibility v-slot="{ visibility }">
    Document Visibility: {{ visibility }}
  </UseDocumentVisibility>
</template>
```
