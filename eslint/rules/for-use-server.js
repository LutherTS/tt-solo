import {
  useServerMessageId,
  makeDirectiveImportRule,
  USE_SERVER,
} from "../helpers/agnostic20.js";

/** @type {import('@typescript-eslint/utils').TSESLint.RuleModule<typeof useServerMessageId, []>} */
const rule = makeDirectiveImportRule(USE_SERVER);

export default rule; // server-functions-no-import-client
