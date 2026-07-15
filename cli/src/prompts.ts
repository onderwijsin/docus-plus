import { basename } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export interface ProjectAnswers {
  dir: string;
  name: string;
}

export async function promptForProject(
  inputOptions: Partial<ProjectAnswers>
): Promise<ProjectAnswers> {
  if (inputOptions.dir && inputOptions.name) {
    return { dir: inputOptions.dir, name: inputOptions.name };
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      "Project directory and package name are required without an interactive terminal. Use create-docus-plus <dir> --name <package-name>."
    );
  }

  const prompts = createInterface({ input, output });

  try {
    const dir = inputOptions.dir || (await prompts.question("Project directory: ")).trim();
    const defaultName = basename(dir);
    const name =
      inputOptions.name ||
      (await prompts.question(`Package name (${defaultName}): `)).trim() ||
      defaultName;

    return { dir, name };
  } finally {
    prompts.close();
  }
}
