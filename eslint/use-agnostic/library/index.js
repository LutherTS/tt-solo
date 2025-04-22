import { enforceEffectiveDirectivesRuleName } from "./constants/names.js";

import enforceEffectiveDirectivesImportRules from "./rules/agnostic20/import-rules-enforcement.js";

import { makeAgnostic20Config } from "./configs/makers.js";

const plugin = {
  meta: {},
  configs: {},
  rules: {
    [enforceEffectiveDirectivesRuleName]: enforceEffectiveDirectivesImportRules,
  },
  processors: {},
};

Object.assign(plugin.configs, makeAgnostic20Config(plugin));

export default plugin;
