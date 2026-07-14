---
category: Sensors
---

# useSpeechSynthesis

Reactive SpeechSynthesis.

> Can I use?

## Usage

```ts
import { useSpeechSynthesis } from '@vueuse/core'

const {
  isSupported,
  isPlaying,
  status,
  voiceInfo,
  utterance,
  error,
  stop,
  toggle,
  speak,
} = useSpeechSynthesis()
```

### Options

The following shows the default values of the options, they will be directly passed to SpeechSynthesis API.

```ts
import { useSpeechSynthesis } from '@vueuse/core'
// ---cut---
useSpeechSynthesis({
  lang: 'en-US',
  pitch: 1,
  rate: 1,
  volume: 1,
})
```
