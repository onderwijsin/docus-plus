---
category: Sensors
---

# useSpeechRecognition

Reactive SpeechRecognition.

> Can I use?

## Usage

```ts
import { useSpeechRecognition } from '@vueuse/core'

const {
  isSupported,
  isListening,
  isFinal,
  result,
  start,
  stop,
} = useSpeechRecognition()
```

### Options

The following shows the default values of the options, they will be directly passed to SpeechRecognition API.

```ts
import { useSpeechRecognition } from '@vueuse/core'
// ---cut---
useSpeechRecognition({
  lang: 'en-US',
  interimResults: true,
  continuous: true,
})
```
