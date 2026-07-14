import { defineDriver } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";

import { createCacheDriverWithMeta } from "./utils.mjs";

/**
 * Cloudflare KV binding-backed cache driver with sidecar metadata support.
 */
export default defineDriver((driverOptions) =>
  createCacheDriverWithMeta({
    name: "cloudflare-kv-binding-cache-with-meta",
    driver: cloudflareKVBindingDriver(driverOptions)
  })
);
