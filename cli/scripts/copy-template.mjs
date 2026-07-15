import { cp, rm } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve(import.meta.dirname, "../../.starters/default");
const target = resolve(import.meta.dirname, "../dist/template");

await rm(target, { recursive: true, force: true });
await cp(source, target, {
  recursive: true,
  filter(path) {
    return ![
      ".data",
      ".nuxt",
      ".output",
      "coverage",
      "dist",
      "node_modules",
      "pnpm-lock.yaml"
    ].some((segment) => path.split("/").includes(segment));
  }
});
