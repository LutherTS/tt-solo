import { defineConfig, globalIgnores } from "eslint/config";

import agnostic20 from "./eslint/configs/agnostic20.js";

export default defineConfig([
  globalIgnores(["./.next"]),
  {
    files: [
      "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.ts",
      "app/\\(pages\\)/\\(dashboard\\)/users/\\[username\\]/moments-agnostic20/**/*.tsx",
    ],
    extends: [agnostic20],
  },
]);
