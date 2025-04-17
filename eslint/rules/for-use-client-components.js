import {
  useClientComponentsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_CLIENT_COMPONENTS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useClientComponentsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_CLIENT_COMPONENTS);

export default rule; // client-components-modules-import-rules
