import { defineConfig, globalIgnores } from "eslint/config";

import agnostic20 from "./eslint/configs/agnostic20.js";

export default defineConfig([
  globalIgnores(["./.next"]),
  {
    files: [
      "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.ts",
      "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.tsx",
      "app/actions/**/*.ts",
      "app/actions/**/*.tsx",
      "app/adapts/**/*.ts",
      "app/adapts/**/*.tsx",
      "app/components/**/*.ts",
      "app/components/**/*.tsx",
      "app/constants/**/*.ts",
      "app/constants/**/*.tsx",
      "app/fetches/**/*.ts",
      "app/fetches/**/*.tsx",
      "app/icons/**/*.ts",
      "app/icons/**/*.tsx",
      "app/reads/**/*.ts",
      "app/reads/**/*.tsx",
      "app/types/**/*.ts",
      "app/types/**/*.tsx",
      "app/utilities/**/*.ts",
      "app/utilities/**/*.tsx",
      "app/validations/**/*.ts",
      "app/validations/**/*.tsx",
      "app/writes/**/*.ts",
      "app/writes/**/*.tsx",
      "app/global-error.tsx",
      "app/layout.tsx",
    ],
    extends: [agnostic20],
  },
]);
