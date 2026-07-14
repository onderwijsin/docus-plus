# Add-ons

The core package aims to be lightweight and dependence free. While the add-ons are wrapping popular packages into the consistent API style.

## Head - `@vueuse/head` <carbon-link class="external-link"/>

Document head manager for Vue 3. SSR ready. Created and maintained by @egoist

## Motion - `@vueuse/motion` <carbon-link class="external-link"/>

**Vue Composables** putting your **components** in **motion**.

-  **Smooth animations** based on **Popmotion**
-  **Declarative** API
-  **Plug** & **play** with **10+ presets**
-  Supports **Nuxt** using **nuxt-use-motion**
-  Written in **TypeScript**
-  Lightweight with **<20kb** bundle size

> Created and maintained by @Tahul

## Gesture - `@vueuse/gesture` <carbon-link class="external-link"/>

**Vue Composables** making your app **interactive**

-  **Plug** & **play**
-  **Mouse** & **Touch** support
-  **Directives** support (**v-drag**, **v-pinch**, **v-move**...)
-  Written in **TypeScript**
-  Plays well with **vueuse/motion** or **any other** animation solution

> Created and maintained by @Tahul

## Sound - `@vueuse/sound` <carbon-link class="external-link"/>

Vue composables for playing sound effects.

-  Lets your website **communicate** using 2 **human senses** instead of 1
-  Built with **Vue** Composition API
-  Supports **Nuxt 3** using **@vueuse/sound/nuxt**
-  **<1kb** bytes (gzip) in your **bundle**! **~10kb** loaded **async**.
-  Built with **TypeScript**
-  Uses a powerful, battle-tested audio utility: **Howler.js**

> Created and maintained by @Tahul

## SchemaOrg - `@vueuse/schema-org` <carbon-link class="external-link"/>

Schema.org for Vue. Supports typed and automated Google Rich Results

-  No Schema knowledge required, get up and running in minutes with minimal configuration
-  20+ Typed Schemas for best practice (Google, Yoast) Rich Results
-  Automated Schema: `@id`, URL / date resolving, route meta and more
-  Integrations for VitePress, Nuxt, Vitesse and Vite with auto-imports
-  Choose your preferred API: Composables or Components
-  SSR, tree-shaking and Schema inheritance ready

> Created and maintained by @harlan-zw




## Router - `@vueuse/router`

Utilities for vue-router

- `useRouteHash` — shorthand for a reactive `route.hash`
- `useRouteParams` — shorthand for a reactive `route.params`
- `useRouteQuery` — shorthand for a reactive `route.query`

## Integrations - `@vueuse/integrations`

Integration wrappers for utility libraries

- `useAsyncValidator` — wrapper for `async-validator`
- `useAxios` — wrapper for `axios`
- `useChangeCase` — reactive wrapper for `change-case`
- `useCookies` — wrapper for `universal-cookie`
- `useDrauu` — reactive instance for drauu
- `useFocusTrap` — reactive wrapper for `focus-trap`
- `useFuse` — easily implement fuzzy search using a composable with Fuse.js
- `useIDBKeyval` — wrapper for `idb-keyval`
- `useJwt` — wrapper for `jwt-decode`
- `useNProgress` — reactive wrapper for `nprogress`
- `useQRCode` — wrapper for `qrcode`
- `useSortable` — wrapper for `sortable`

## RxJS - `@vueuse/rxjs`

Enables RxJS reactive functions in Vue

- `from` — wrappers around RxJS's `from()` and `fromEvent()` to allow them to accept `ref`s
- `toObserver` — sugar function to convert a `ref` into an RxJS Observer
- `useExtractedObservable` — use an RxJS `Observable` as extracted from one or more composables
- `useObservable` — use an RxJS `Observable`
- `useSubject` — bind an RxJS `Subject` to a `ref` and propagate value changes both ways
- `useSubscription` — use an RxJS `Subscription` without worrying about unsubscribing from it or creating memory leaks
- `watchExtractedObservable` — watch the values of an RxJS `Observable` as extracted from one or more composables

## Firebase - `@vueuse/firebase`

Enables realtime bindings for Firebase

- `useAuth` — reactive Firebase Auth binding
- `useFirestore` — reactive Firestore binding
- `useRTDB` — reactive Firebase Realtime Database binding

## Electron - `@vueuse/electron`

Electron renderer process modules for VueUse

- `useIpcRenderer` — provides ipcRenderer and all of its APIs with Vue reactivity
- `useIpcRendererInvoke` — reactive ipcRenderer.invoke API result
- `useIpcRendererOn` — use ipcRenderer.on with ease and ipcRenderer.removeListener automatically on unmounted
- `useZoomFactor` — reactive WebFrame zoom factor
- `useZoomLevel` — reactive WebFrame zoom level


