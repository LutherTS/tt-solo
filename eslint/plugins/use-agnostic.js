import { importRulesEnforcementRuleName } from "../helpers/agnostic20.js";

import enforceEffectiveDirectivesImportRules from "../rules/import-rules-enforcement.js";

// Note: Some limitations. I'm effectively running the same rule seven times, one time per effective directive. It could all be a single 'enforceEffectiveDirectivesImportRules'. It should run only on time per file, and then address everything within that single rule.
const plugin = {
  rules: {
    [importRulesEnforcementRuleName]: enforceEffectiveDirectivesImportRules,
  },
};

export default plugin;
