---
category: Watch
---

# watchOnce

Shorthand for watching value with `{ once: true }`. Once the callback fires once, the watcher will be stopped.
See Vue's docs for full details.

## Usage

Similar to `watch`, but with `{ once: true }`

```ts
import { watchOnce } from '@vueuse/core'

watchOnce(source, () => {
  // triggers only once
  console.log('source changed!')
})
```
