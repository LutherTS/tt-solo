import fs from "fs";

import {
  enforceEffectiveDirectivesRuleName,
  enforceCommentedDirectivesRuleName,
} from "./_commons/constants/bases.js";

import enforceEffectiveDirectivesImportRules from "./agnostic20/rules/import-rules-enforcement.js";
import enforceCommentedDirectivesImportRules from "./directive21/rules/import-rules-enforcement.js";

import { makeAgnostic20Config } from "./agnostic20/config.js";
import { makeDirective21Config } from "./directive21/config.js";

const packageDotJSON = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

const plugin = {
  meta: { ...packageDotJSON },
  configs: {}, // applied below
  rules: {
    [enforceEffectiveDirectivesRuleName]: enforceEffectiveDirectivesImportRules,
    [enforceCommentedDirectivesRuleName]: enforceCommentedDirectivesImportRules,
  },
  processors: {}, // not used
};

Object.assign(plugin.configs, makeAgnostic20Config(plugin));
Object.assign(plugin.configs, makeDirective21Config(plugin));

export default plugin;
