---
category: Sensors
---

# usePointerLock

Reactive pointer lock.

## Basic Usage

```ts
import { usePointerLock } from '@vueuse/core'

const {
  isSupported,
  lock,
  unlock,
  element,
  triggerElement
} = usePointerLock()
```

## Component Usage

```vue
<template>
  <UsePointerLock v-slot="{ lock }">
    <canvas />
    <button @click="lock">
      Lock Pointer on Canvas
    </button>
  </UsePointerLock>
</template>
```
