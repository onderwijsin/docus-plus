import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";

const EXCLUDED_DIRECTORIES = new Set([
  ".data",
  ".nuxt",
  ".output",
  "coverage",
  "dist",
  "node_modules"
]);
const EXCLUDED_FILES = new Set(["pnpm-lock.yaml"]);

export interface CreateProjectOptions {
  name: string;
  target: string;
  template: string;
  force?: boolean;
}

export function validateProjectName(name: string) {
  if (!name) {
    return "Project name cannot be empty.";
  }

  if (!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return "Invalid project name. Use lowercase letters, numbers, dots, hyphens, underscores, and an optional @scope/.";
  }
}

export async function createProject(options: CreateProjectOptions) {
  await assertTarget(options.target, options.force);

  try {
    await mkdir(options.target, { recursive: true });
    await cp(options.template, options.target, {
      recursive: true,
      force: Boolean(options.force),
      errorOnExist: !options.force,
      filter: (source) => shouldCopy(options.template, source)
    });
    await updateProjectIdentity(options.target, options.name);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not create the project: ${message}`, { cause: error });
  }
}

async function assertTarget(target: string, force = false) {
  try {
    const targetStats = await stat(target);

    if (!targetStats.isDirectory()) {
      throw new Error(`Destination ${target} is not a directory.`);
    }

    if (!force && (await readdir(target)).length > 0) {
      throw new Error(
        `Destination ${target} is not empty. Use --force to allow overwriting files.`
      );
    }
  } catch (error) {
    if (isMissingPath(error)) {
      return;
    }

    throw error;
  }
}

function shouldCopy(template: string, source: string) {
  const pathParts = relative(template, source).split("/");
  return !pathParts.some((part) => EXCLUDED_DIRECTORIES.has(part) || EXCLUDED_FILES.has(part));
}

async function updateProjectIdentity(target: string, name: string) {
  const packagePath = join(target, "package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as Record<string, unknown>;
  packageJson.name = name;
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const title = toTitle(name);
  await replaceInFile(join(target, "config/constants.ts"), "Example Docs", title);
  await replaceInFile(join(target, "config/siteMcp.ts"), "Example Docs", title);
  await replaceInFile(join(target, "app/app.config.ts"), "Example Docs", title);
  await replaceInFile(join(target, "content/index.yml"), "Example Docs", title);
}

async function replaceInFile(path: string, search: string, replacement: string) {
  const content = await readFile(path, "utf8");
  await writeFile(path, content.replaceAll(search, replacement));
}

function toTitle(name: string) {
  const plainName = basename(name);
  return plainName.replace(/[-_.]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function isMissingPath(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
