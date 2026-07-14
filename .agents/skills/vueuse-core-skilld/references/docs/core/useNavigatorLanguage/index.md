---
category: Sensors
---

# useNavigatorLanguage

Reactive navigator.language.

## Usage

```ts
import { useNavigatorLanguage } from '@vueuse/core'

const { language } = useNavigatorLanguage()

watch(language, () => {
  // Listen to the value changing
})
```
