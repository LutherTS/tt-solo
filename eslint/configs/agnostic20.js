import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";

import {
  useAgnosticPluginName,
  forUseServerRuleName,
  forUseClientRuleName,
  forUseAgnosticRuleName,
} from "../helpers/agnostic20.js";

import useAgnostic from "../plugins/use-agnostic";

export default defineConfig([
  {
    plugins: {
      [useAgnosticPluginName]: useAgnostic,
    },
    // for compatibility with .ts and .tsx
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      [`${useAgnosticPluginName}/${forUseServerRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseClientRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseAgnosticRuleName}`]: "warn",
    },
  },
]);
