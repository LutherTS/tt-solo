import {
  useClientLogicsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_CLIENT_LOGICS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useClientLogicsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_CLIENT_LOGICS);

export default rule; // client-logics-modules-import-rules
