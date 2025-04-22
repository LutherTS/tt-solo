import fs from "fs";

import { enforceEffectiveDirectivesRuleName } from "./_commons/constants/names.js";

import enforceEffectiveDirectivesImportRules from "./agnostic20/rules/import-rules-enforcement.js";

import { makeAgnostic20Config } from "./agnostic20/config.js";

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
