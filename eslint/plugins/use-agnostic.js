import { importRulesEnforcementRuleName } from "../helpers/names/use-agnostic.js";

import enforceEffectiveDirectivesImportRules from "../rules/import-rules-enforcement.js";

import { makeAgnostic20Config } from "../helpers/configs/agnostic20.js";

const plugin = {
  meta: {},
  configs: {},
  rules: {
    [importRulesEnforcementRuleName]: enforceEffectiveDirectivesImportRules,
  },
  processors: {},
};

Object.assign(plugin.configs, makeAgnostic20Config(plugin));

export default plugin;
