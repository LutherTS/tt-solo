import {
  useServerLogicsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_SERVER_LOGICS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerLogicsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_SERVER_LOGICS);

export default rule; // server-logics-modules-import-rules
