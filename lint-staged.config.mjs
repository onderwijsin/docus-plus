const formatEnabled = process.env.DISABLE_PRE_COMMIT_FORMAT !== "true";
const lintEnabled = process.env.DISABLE_PRE_COMMIT_LINT !== "true";

/**
 * Quote staged paths before composing commands for lint-staged.
 *
 * @param {string} file - The staged file path.
 * @returns {string} A shell-safe single-quoted path.
 */
const quotePath = (file) => `'${file.replaceAll("'", "'\\''")}'`;

/**
 * Build a lint-staged command with explicit file arguments.
 *
 * @param {string} command - The command to execute.
 * @param {string[]} files - The staged files matched by the glob.
 * @returns {string} The complete command.
 */
const task = (command, files) => `${command} ${files.map(quotePath).join(" ")}`;

export default {
  "*.{json,jsonc,md,mdc,yaml,yml}": (files) =>
    formatEnabled ? [task("oxfmt --no-error-on-unmatched-pattern", files)] : [],
  "*.{js,cjs,mjs,ts,cts,mts,jsx,tsx,vue}": (files) => {
    const tasks = [];

    if (formatEnabled) {
      tasks.push(task("oxfmt --no-error-on-unmatched-pattern", files));
    }

    if (lintEnabled) {
      tasks.push(task("oxlint --fix", files));
    }

    return tasks;
  }
};
