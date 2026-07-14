---
category: Sensors
---

# useTextSelection

Reactively track user text selection based on `Window.getSelection`.

## Usage

```vue
<script setup lang="ts">
import { useTextSelection } from '@vueuse/core'

const state = useTextSelection()
</script>

<template>
  <p>{{ state.text }}</p>
</template>
```
