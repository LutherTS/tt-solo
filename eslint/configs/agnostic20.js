import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";

import {
  useAgnosticPluginName,
  // previous
  // forUseServerRuleName,
  // forUseClientRuleName,
  // forUseAgnosticRuleName,
  // next
  forUseServerLogicsRuleName,
  forUseServerComponentsRuleName,
  forUseServerFunctionsRuleName,
  forUseClientLogicsRuleName,
  forUseClientComponentsRuleName,
  forUseAgnosticLogicsRuleName,
  forUseAgnosticComponentsRuleName,
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
      // previous
      // [`${useAgnosticPluginName}/${forUseServerRuleName}`]: "warn",
      // [`${useAgnosticPluginName}/${forUseClientRuleName}`]: "warn",
      // [`${useAgnosticPluginName}/${forUseAgnosticRuleName}`]: "warn",
      // next
      [`${useAgnosticPluginName}/${forUseServerLogicsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseServerComponentsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseServerFunctionsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseClientLogicsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseClientComponentsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseAgnosticLogicsRuleName}`]: "warn",
      [`${useAgnosticPluginName}/${forUseAgnosticComponentsRuleName}`]: "warn",
    },
  },
]);
