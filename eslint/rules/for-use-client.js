import {
  useClientMessageId,
  makeDirectiveImportRule,
  USE_CLIENT,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useClientMessageId, []>} */
const rule = makeDirectiveImportRule(USE_CLIENT);

export default rule; // client-no-import-server
