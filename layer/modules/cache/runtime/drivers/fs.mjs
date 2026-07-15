import { defineDriver } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

import { createCacheDriverWithMeta } from "./utils.mjs";

/**
 * Filesystem-backed cache driver with sidecar metadata support.
 */
export default defineDriver((driverOptions) =>
  createCacheDriverWithMeta({
    name: "fs-cache-with-meta",
    driver: fsDriver(driverOptions)
  })
);
