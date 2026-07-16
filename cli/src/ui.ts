const supportsColor = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);

function color(code: number, value: string) {
  return supportsColor ? `\u001B[${code}m${value}\u001B[0m` : value;
}

function bold(value: string) {
  return color(1, value);
}

function cyan(value: string) {
  return color(36, value);
}

function green(value: string) {
  return color(32, value);
}

export function showWelcome() {
  if (!process.stdout.isTTY) {
    return;
  }

  process.stdout.write(
    `\n${cyan(bold("◆ Docus Plus"))}\n${color(2, "  Create a documentation site you will enjoy maintaining.")}\n\n`
  );
}

export function showCreating(target: string) {
  process.stdout.write(`${cyan("◌")} Creating your documentation site in ${bold(target)}…\n`);
}

export function showSuccess(name: string, dir: string) {
  process.stdout.write(
    `\n${green(bold("✓ Your Docus Plus site is ready!"))}\n\n` +
      `${bold("Next steps")}\n` +
      `  ${cyan("1.")} cd ${dir}\n` +
      `  ${cyan("2.")} pnpm install\n` +
      `  ${cyan("3.")} pnpm dev\n\n` +
      `Happy documenting, ${bold(name)}.\n`
  );
}
