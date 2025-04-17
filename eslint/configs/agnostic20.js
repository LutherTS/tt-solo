import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";

import {
  // plugin name
  useAgnosticPluginName,
  // rule names
  importRulesEnforcementRuleName,
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
      [`${useAgnosticPluginName}/${importRulesEnforcementRuleName}`]: "warn",
    },
  },
]);
