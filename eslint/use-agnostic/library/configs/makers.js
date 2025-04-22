import { defineConfig } from "eslint/config";

import {
  useAgnosticPluginName,
  agnostic20ConfigName,
  enforceEffectiveDirectivesRuleName,
} from "../constants/names.js";

/**
 * Makes the agnostic20 config for the use-agnostic ESLint plugin.
 */
export const makeAgnostic20Config = (plugin) => ({
  [agnostic20ConfigName]: defineConfig([
    {
      plugins: {
        [useAgnosticPluginName]: plugin,
      },
      rules: {
        [`${useAgnosticPluginName}/${enforceEffectiveDirectivesRuleName}`]:
          "warn",
      },
    },
  ]),
});
