---
category: Animation
---

# useTransition

Transition between values

## Usage

Define a source value to follow, and when changed the output will transition to the new value. If the source changes while a transition is in progress, a new transition will begin from where the previous one was interrupted.

```ts
import { TransitionPresets, useTransition } from '@vueuse/core'
import { shallowRef } from 'vue'

const source = shallowRef(0)

const output = useTransition(source, {
  duration: 1000,
  easing: TransitionPresets.easeInOutCubic,
})
```

Transition easing can be customized using cubic bezier curves.

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
useTransition(source, {
  easing: [0.75, 0, 0.25, 1],
})
```

The following transitions are available via the `TransitionPresets` constant.

- `linear`
- `easeInSine`
- `easeOutSine`
- `easeInOutSine`
- `easeInQuad`
- `easeOutQuad`
- `easeInOutQuad`
- `easeInCubic`
- `easeOutCubic`
- `easeInOutCubic`
- `easeInQuart`
- `easeOutQuart`
- `easeInOutQuart`
- `easeInQuint`
- `easeOutQuint`
- `easeInOutQuint`
- `easeInExpo`
- `easeOutExpo`
- `easeInOutExpo`
- `easeInCirc`
- `easeOutCirc`
- `easeInOutCirc`
- `easeInBack`
- `easeOutBack`
- `easeInOutBack`

For more complex easing, a custom function can be provided.

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
function easeOutElastic(n) {
  return n === 0
    ? 0
    : n === 1
      ? 1
      : (2 ** (-10 * n)) * Math.sin((n * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
}

useTransition(source, {
  easing: easeOutElastic,
})
```

By default the `source` must be a number, or array of numbers. For more complex values, define a custom `interpolation` function. For example, the following would transition a Three.js rotation.

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
import { Quaternion } from 'three'

const source = ref(new Quaternion())

const output = useTransition(source, {
  interpolation: (q1, q2, t) => new Quaternion().slerpQuaternions(q1, q2, t)
})
```

To control when a transition starts, set a `delay` value. To choreograph behavior around a transition, define `onStarted` or `onFinished` callbacks.

```ts
import { useTransition } from '@vueuse/core'
// ---cut---
useTransition(source, {
  delay: 1000,
  onStarted() {
    // called after the transition starts
  },
  onFinished() {
    // called after the transition ends
  },
})
```

To stop transitioning, define a boolean `disabled` property. Be aware, this is not the same a `duration` of `0`. Disabled transitions track the source value **_synchronously_**. They do not respect a `delay`, and do not fire `onStarted` or `onFinished` callbacks.

For even more control, transitions can be executed manually via the `transition` function. This function returns a promise that resolves when the transition is complete. Manual transitions can be cancelled by defining an `abort` function that returns a truthy value.

```ts
import { transition } from '@vueuse/core'

await transition(source, from, to, {
  abort() {
    if (shouldAbort)
      return true
  }
})
```
