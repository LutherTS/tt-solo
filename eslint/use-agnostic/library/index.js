import fs from "fs";

import { enforceEffectiveDirectivesRuleName } from "./constants/names.js";

import enforceEffectiveDirectivesImportRules from "./rules/agnostic20/import-rules-enforcement.js";

import { makeAgnostic20Config } from "./configs/makers.js";

const packageDotJSON = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const plugin = {
  meta: { ...packageDotJSON },
  configs: {}, // applied below
  rules: {
    [enforceEffectiveDirectivesRuleName]: enforceEffectiveDirectivesImportRules,
  },
  processors: {}, // not used
};

Object.assign(plugin.configs, makeAgnostic20Config(plugin));

export default plugin;
