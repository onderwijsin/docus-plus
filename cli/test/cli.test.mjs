import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

const cli = resolve(import.meta.dirname, "../dist/main.js");

test("shows the Docus-style project directory argument", () => {
  const result = spawnSync(process.execPath, [cli, "--help"], { encoding: "utf8" });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Project directory \(Default: docs\)/);
  assert.doesNotMatch(result.stdout, /--name|--force/);
});
