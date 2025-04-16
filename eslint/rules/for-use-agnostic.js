import {
  useAgnosticMessageId,
  makeDirectiveImportRule,
  USE_AGNOSTIC,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useAgnosticMessageId, []>} */
const rule = makeDirectiveImportRule(USE_AGNOSTIC);

export default rule; // agnostic-import-agnostic-only
