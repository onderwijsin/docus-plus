# @vueuse/integrations



> This is an add-on of VueUse, providing integration wrappers for utility libraries.

## Install

```bash
npm i @vueuse/integrations
```

## Functions




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



## Tree-shaking

For better tree-shaking result, import functions from submodules, for example:

```ts
// Don't
import { useAxios } from '@vueuse/integrations'

import { useAxios } from '@vueuse/integrations/useAxios'
```

## License

MIT License  2019-PRESENT Anthony Fu
