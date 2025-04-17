import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";

import {
  useAgnosticPluginName,
  forUseServerRuleName,
  forUseClientRuleName,
  forUseAgnosticRuleName,
} from "../helpers/agnostic20.js";

import useAgnostic from "../plugins/use-agnostic.js";

export default defineConfig([
  {
    plugins: {
      [useAgnosticPluginName]: useAgnostic,
    },
    languageOptions: {
      // for compatibility with .ts and .tsx
      parser: tseslint.parser,
    },
    rules: {
      [`${useAgnosticPluginName}/${forUseServerRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseClientRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseAgnosticRuleName}`]: "warn",
    },
  },
]);
