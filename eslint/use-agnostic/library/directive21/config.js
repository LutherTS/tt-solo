import { defineConfig } from "eslint/config";

import {
  useAgnosticPluginName,
  directive21ConfigName,
  enforceCommentedDirectivesRuleName,
} from "../_commons/constants/bases.js";

/**
 * Makes the directive21 config for the use-agnostic ESLint plugin.
 */
export const makeDirective21Config = (plugin) => ({
  [directive21ConfigName]: defineConfig([
    {
      plugins: {
        [useAgnosticPluginName]: plugin,
      },
      rules: {
        [`${useAgnosticPluginName}/${enforceCommentedDirectivesRuleName}`]:
          "warn",
      },
    },
  ]),
});
