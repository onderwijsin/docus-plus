---
category: Browser
---

# useEyeDropper

Reactive EyeDropper API

## Usage

```ts
import { useEyeDropper } from '@vueuse/core'

const { isSupported, open, sRGBHex } = useEyeDropper()
```

## Component Usage

```vue
<template>
  <UseEyeDropper v-slot="{ isSupported, sRGBHex, open }">
    <button :disabled="!isSupported" @click="() => open()">
      sRGBHex: {{ sRGBHex }}
    </button>
  </UseEyeDropper>
</template>
```
