import { importRulesEnforcementRuleName } from "../helpers/agnostic20.js";

import enforceEffectiveDirectivesImportRules from "../rules/import-rules-enforcement.js";

const plugin = {
  rules: {
    [importRulesEnforcementRuleName]: enforceEffectiveDirectivesImportRules,
  },
};

export default plugin;
