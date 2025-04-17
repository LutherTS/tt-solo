import {
  useAgnosticComponentsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_AGNOSTIC_COMPONENTS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useAgnosticComponentsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_AGNOSTIC_COMPONENTS);

export default rule; // agnostic-components-modules-import-rules
