import {
  useServerFunctionsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_SERVER_FUNCTIONS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerFunctionsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_SERVER_FUNCTIONS);

export default rule; // server-functions-modules-import-rules
