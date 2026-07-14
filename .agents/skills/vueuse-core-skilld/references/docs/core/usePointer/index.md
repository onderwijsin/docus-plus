---
category: Sensors
---

# usePointer

Reactive pointer state.

## Basic Usage

```ts
import { usePointer } from '@vueuse/core'

const { x, y, pressure, pointerType } = usePointer()
```

## Component Usage

By default, the component will track the pointer on `window`

```vue
<template>
  <UsePointer v-slot="{ x, y }">
    x: {{ x }}
    y: {{ y }}
  </UsePointer>
</template>
```

To track local position in the element, set `target="self"`:

```vue
<template>
  <UsePointer v-slot="{ x, y }" target="self">
    x: {{ x }} y: {{ y }}
  </UsePointer>
</template>
```
