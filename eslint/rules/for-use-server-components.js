import {
  useServerComponentsMessageId,
  makeEffectiveDirectiveImportRule,
  USE_SERVER_COMPONENTS,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerComponentsMessageId, []>} */
const rule = makeEffectiveDirectiveImportRule(USE_SERVER_COMPONENTS);

export default rule; // server-components-modules-import-rules
