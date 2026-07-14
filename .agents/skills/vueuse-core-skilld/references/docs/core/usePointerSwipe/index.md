---
category: Sensors
---

# usePointerSwipe

Reactive swipe detection based on PointerEvents.

## Usage

```vue
<script setup lang="ts">
import { usePointerSwipe } from '@vueuse/core'
import { useTemplateRef } from 'vue'

const el = useTemplateRef('el')
const { isSwiping, direction } = usePointerSwipe(el)
</script>

<template>
  <div ref="el">
    Swipe here
  </div>
</template>
```
