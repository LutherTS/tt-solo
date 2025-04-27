import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

import {
  useAgnosticPluginName,
  agnostic20ConfigName,
  directive21ConfigName,
} from "./eslint/use-agnostic/library/_commons/constants/bases.js";

import useAgnostic from "./eslint/use-agnostic/library/index.js";

export default defineConfig([
  globalIgnores([".next"]),
  {
    files: [
      // "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.ts",
      // "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.tsx",
      // "app/actions/**/*.ts",
      // "app/actions/**/*.tsx",
      // "app/adapts/**/*.ts",
      // "app/adapts/**/*.tsx",
      // "app/components/**/*.ts",
      // "app/components/**/*.tsx",
      // "app/constants/**/*.ts",
      // "app/constants/**/*.tsx",
      // "app/fetches/**/*.ts",
      // "app/fetches/**/*.tsx",
      // "app/icons/**/*.ts",
      // "app/icons/**/*.tsx",
      // "app/reads/**/*.ts",
      // "app/reads/**/*.tsx",
      // "app/types/**/*.ts",
      // "app/types/**/*.tsx",
      // "app/utilities/**/*.ts",
      // "app/utilities/**/*.tsx",
      // "app/validations/**/*.ts",
      // "app/validations/**/*.tsx",
      // "app/writes/**/*.ts",
      // "app/writes/**/*.tsx",
      // "app/global-error.tsx",
      // "app/layout.tsx",

      "app/actions/server/test-1.ts",
      "app/actions/server/test-1.tsx",

      "app/actions/server/test-2.ts",
      "app/actions/server/test-2.tsx",
    ],
    plugins: {
      [useAgnosticPluginName]: useAgnostic,
    },
    // extends: [`${useAgnosticPluginName}/${agnostic20ConfigName}`],
    extends: [`${useAgnosticPluginName}/${directive21ConfigName}`],
    languageOptions: {
      // for compatibility with .ts and .tsx
      parser: tseslint.parser,
    },
  },
]);
