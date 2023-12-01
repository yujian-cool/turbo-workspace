/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/lint-config/react-internal.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.lint.json",
  },
};
