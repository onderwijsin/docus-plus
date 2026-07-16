import { resolve } from "node:path";
import { defineCommand, runMain } from "citty";
import type { CLIOptions } from "./types";

export function createCLI(options: CLIOptions) {
  const main = defineCommand({
    meta: {
      name: options.name,
      description: options.description
    },
    args: {
      dir: {
        type: "positional",
        description: "Project directory",
        required: false,
        default: "docs"
      }
    },
    async setup(context) {
      const dir = resolve(context.args.dir as string);
      const { runCommand } = await import("@nuxt/cli");

      await runCommand("init", [dir, "-t", "gh:onderwijsin/docus-plus/.starters/default"]);
    }
  });

  return { runMain: () => runMain(main) };
}
