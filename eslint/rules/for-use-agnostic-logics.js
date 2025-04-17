import {
  useAgnosticLogicsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_AGNOSTIC_LOGICS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useAgnosticLogicsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_AGNOSTIC_LOGICS);

export default rule; // agnostic-logics-modules-import-rules
