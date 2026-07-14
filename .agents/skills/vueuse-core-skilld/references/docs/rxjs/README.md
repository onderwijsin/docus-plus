# @vueuse/rxjs



> This is an add-on of VueUse, enabling a natural way of using RxJS.

## Install

```bash
npm i @vueuse/rxjs rxjs
```

## Functions




- `from` — wrappers around RxJS's `from()` and `fromEvent()` to allow them to accept `ref`s
- `toObserver` — sugar function to convert a `ref` into an RxJS Observer
- `useExtractedObservable` — use an RxJS `Observable` as extracted from one or more composables
- `useObservable` — use an RxJS `Observable`
- `useSubject` — bind an RxJS `Subject` to a `ref` and propagate value changes both ways
- `useSubscription` — use an RxJS `Subscription` without worrying about unsubscribing from it or creating memory leaks
- `watchExtractedObservable` — watch the values of an RxJS `Observable` as extracted from one or more composables



## Example

```ts
import { from, fromEvent, useObservable } from '@vueuse/rxjs'
import { forkJoin, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { concatAll, map, mergeMap, pluck, scan, take } from 'rxjs/operators'
import { useTemplateRef } from 'vue'

const BASE_URL = 'https://jsonplaceholder.typicode.com'
const button = useTemplateRef('buttonRef')

const posts = useObservable(
  fromEvent(button, 'click').pipe(
    mergeMap(() => ajax.getJSON(`${BASE_URL}/posts`).pipe(
      concatAll(),
      take(4),
      mergeMap(({ id, userId, title }) => forkJoin({
        id: of(id),
        comments: ajax.getJSON(`${BASE_URL}/posts/${id}/comments`).pipe(
          map(comments => comments.length),
        ),
        username: ajax.getJSON(`${BASE_URL}/users/${userId}`).pipe(
          pluck('username'),
        ),
      }), 2),
      scan((acc, curr) => [...acc, curr], []),
    )),
  ),
)
```

## License

MIT License  2019-PRESENT Anthony Fu
