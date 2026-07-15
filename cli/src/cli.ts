import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCommand, runMain } from "citty";
import { promptForProject } from "./prompts";
import { createProject, validateProjectName } from "./scaffold";

export function createCLI() {
  const main = defineCommand({
    meta: {
      name: "create-docus-plus",
      description: "Create a new Docus Plus documentation project"
    },
    args: {
      dir: {
        type: "positional",
        description: "Project directory",
        default: ""
      },
      name: {
        type: "string",
        alias: "n",
        description: "Package name (defaults to the destination directory name)"
      },
      force: {
        type: "boolean",
        alias: "f",
        description: "Allow copying into a non-empty destination"
      }
    },
    async setup(context) {
      const answers = await promptForProject({
        dir: context.args.dir as string | undefined,
        name: context.args.name as string | undefined
      });
      const nameError = validateProjectName(answers.name);

      if (nameError) {
        throw new Error(nameError);
      }

      const target = resolve(answers.dir);
      await createProject({
        name: answers.name,
        target,
        force: Boolean(context.args.force),
        template: resolveTemplateDirectory()
      });

      process.stdout.write(
        `\nCreated ${answers.name} in ${target}\n\nNext steps:\n  cd ${answers.dir}\n  corepack pnpm install\n  corepack pnpm dev\n`
      );
    }
  });

  return { runMain: () => runMain(main) };
}

function resolveTemplateDirectory() {
  const directory = fileURLToPath(new URL(".", import.meta.url));
  const packagedTemplate = resolve(directory, "./template");
  return (
    process.env.DOCUS_PLUS_TEMPLATE_DIR ||
    (existsSync(packagedTemplate)
      ? packagedTemplate
      : resolve(directory, "../../.starters/default"))
  );
}
