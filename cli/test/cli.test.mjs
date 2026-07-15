import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cli = resolve(import.meta.dirname, "../dist/main.js");

function run(...args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

test("rejects invalid project package names", async () => {
  const target = join(await mkdtemp(join(tmpdir(), "create-docus-plus-")), "docs");
  const result = run(target, "--name", "Example Docs");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid project name/);
});

test("does not overwrite a non-empty target without force", async () => {
  const target = await mkdtemp(join(tmpdir(), "create-docus-plus-"));
  await writeFile(join(target, "existing.txt"), "keep me");

  const result = run(target, "--name", "example-docs");

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /not empty/);
});

test("creates a standalone project from the default starter", async () => {
  const parent = await mkdtemp(join(tmpdir(), "create-docus-plus-"));
  const target = join(parent, "product-docs");
  const result = run(target, "--name", "product-docs");

  assert.equal(result.status, 0, result.stderr);
  const packageJson = JSON.parse(await readFile(join(target, "package.json"), "utf8"));
  const constants = await readFile(join(target, "config/constants.ts"), "utf8");

  assert.equal(packageJson.name, "product-docs");
  assert.equal(packageJson.dependencies["@onderwijsin/docus-plus"], "latest");
  assert.match(constants, /Product Docs/);
  await assert.rejects(readFile(join(target, ".nuxt")));
  await assert.rejects(readFile(join(target, "node_modules")));
});

test("allows an existing target only with force", async () => {
  const target = await mkdtemp(join(tmpdir(), "create-docus-plus-"));
  await writeFile(join(target, "existing.txt"), "keep me");

  const result = run(target, "--name", "example-docs", "--force");

  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(join(target, "existing.txt"), "utf8"), "keep me");
});
