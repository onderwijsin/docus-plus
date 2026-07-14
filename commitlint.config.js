/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "ci", "build", "perf", "revert"]
    ],
    "subject-case": [2, "never"],
    "header-max-length": [2, "always", 93],
    "body-max-line-length": [0]
  }
};
