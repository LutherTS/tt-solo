import {
  useClientMessageId,
  makeEffectiveDirectiveImportRule,
  USE_CLIENT,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useClientMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_CLIENT);

export default rule; // client-no-import-server
