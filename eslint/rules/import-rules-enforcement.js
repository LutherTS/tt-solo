import {
  effectiveDirectiveMessageId,
  makeEffectiveDirectiveImportRule,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof effectiveDirectiveMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule();

export default rule; // enforce-effective-directives-import-rules
