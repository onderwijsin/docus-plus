import { defineDriver } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";

import { createCacheDriverWithMeta } from "./utils.mjs";

/**
 * In-memory cache driver with sidecar metadata support.
 */
export default defineDriver(() =>
  createCacheDriverWithMeta({
    name: "memory-cache-with-meta",
    driver: memoryDriver()
  })
);
