import fs from "fs";
import path from "path";

import { loadConfig, createMatchPath } from "tsconfig-paths";

export const useAgnosticPluginName = "use-agnostic";
export const forUseServerRuleName = "server-functions-no-import-client";
export const forUseClientRuleName = "client-no-import-server";
export const forUseAgnosticRuleName = "agnostic-import-agnostic-only";

/* makeDirectiveImportRule */

const NO_DIRECTIVE = null;
export const USE_SERVER = "use server";
export const USE_CLIENT = "use client";
export const USE_AGNOSTIC = "use agnostic";

const descriptions = {
  [USE_SERVER]:
    "Enforces that a Server Functions Module does not import Client Modules. ",
  [USE_CLIENT]:
    "Enforces that a Client Module does not import modules that are server by default. ",
  [USE_AGNOSTIC]:
    "Enforces that an Agnostic Module only imports other Agnostic Modules. ",
};

export const useServerMessageId = "importDirectiveIsClient";
export const useClientMessageId = "importDirectiveIsNull";
export const useAgnosticMessageId = "importDirectiveIsNotAgnostic";

export const messageIds = {
  [USE_SERVER]: useServerMessageId,
  [USE_CLIENT]: useClientMessageId,
  [USE_AGNOSTIC]: useAgnosticMessageId,
};

const messages = {
  [USE_SERVER]:
    "Server Functions Modules cannot import Client Modules. Please remove the import, or adapt it accordingly by making it a server-by-default module (via no directive), a fellow Server Functions Module (not recommended) or an Agnostic Module (via 'use agnostic' on top of the file). ...Or perhaps the current module shouldn't be marked with the 'use server' directive. ",
  [USE_CLIENT]:
    "The imported module lacks a directive. (Neither marked with 'use client', nor 'use server', nor 'use agnostic'.) There is a likelihood that the imported module is not meant to leave the server. If that is not the case, please mark it with 'use agnostic' on top of the file to allow it for import on the client as well, thus differentiating it from an actual Server Module. ...Or perhaps the current module shouldn't be marked with the 'use client' directive. ",
  [USE_AGNOSTIC]:
    "Agnostic Modules can only import other Agnostic Modules. Please remove the import, or adapt it accordingly by making it a fellow Agnostic Module (via 'use agnostic' on top of the file). ...Or perhaps the current module shouldn't be marked with the 'use agnostic' directive. ",
};

const conditions = {
  [USE_SERVER]: (importedFileDirective) => importedFileDirective === USE_CLIENT,
  [USE_CLIENT]: (importedFileDirective) =>
    importedFileDirective === NO_DIRECTIVE,
  [USE_AGNOSTIC]: (importedFileDirective) =>
    importedFileDirective !== USE_AGNOSTIC,
};

/**
 * Makes a directive's import rule.
 * @param {USE_CLIENT | USE_SERVER | USE_AGNOSTIC} directive The directive the rule is to be made for.
 * @returns {import('@typescript-eslint/utils').TSESLint.RuleModule<useServerMessageId | useClientMessageId | useAgnosticMessageId, []>} The directive's import rule.
 */
export const makeDirectiveImportRule = (directive) => ({
  meta: {
    type: "problem",
    docs: {
      description: descriptions[directive],
    },
    schema: [],
    messages: {
      [messageIds[directive]]: messages[directive],
    },
  },
  create: (context) => {
    /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
    const currentFileDirective = getDirectiveFromCurrentModule(context);
    console.log({ currentFileDirective });

    return {
      ImportDeclaration: (node) => {
        // only operates on the rule's dedicated directive
        if (currentFileDirective !== directive) return;
        // does not operate on `import type`
        if (node.importKind === "type") return;

        // finds the full path of the import
        const resolvedImportPath = resolveImportPath(
          path.dirname(context.filename),
          node.source.value,
          context.cwd,
        );

        // does not operates on paths it did not resolve
        if (resolvedImportPath === null) return;
        // does not operate on non-JS files
        const isJS = EXTENSIONS.some((ext) => resolvedImportPath.endsWith(ext));
        if (!isJS) return;

        /* GETTING THE DIRECTIVE (or lack thereof) OF THE IMPORTED FILE */
        const importedFileDirective =
          getDirectiveFromImportedModule(resolvedImportPath);
        console.log({ importedFileDirective });

        if (conditions[directive](importedFileDirective))
          context.report({
            node,
            messageId: messageIds[directive],
          });
      },
    };
  },
});

/* getDirectiveFromCurrentModule */

const directivesSet = new Set([USE_SERVER, USE_CLIENT, USE_AGNOSTIC]);

/**
 * Gets the directive of the current module.
 * - `'use client'` denotes a Client Module.
 * - `'use server'` denotes a Server Functions Module.
 * - `'use agnostic'` denotes an Agnostic Module (formerly Shared Module).
 * - `null` denotes a server-by-default module, or ideally a Server Module.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<"importDirectiveIsNull", []>>} context
 * @returns {USE_CLIENT | USE_SERVER | USE_AGNOSTIC | NO_DIRECTIVE} The directive, or lack thereof via `null`. The lack of a directive is considered server-by-default.
 */
const getDirectiveFromCurrentModule = (context) => {
  // the AST body to check for "use client"
  const { body } = context.sourceCode.ast;

  // the first statement from the source code's Abstract Syntax Tree
  const firstStatement = body[0];

  // the value of that first statement or null
  const value =
    firstStatement?.type === "ExpressionStatement" &&
    firstStatement.expression?.type === "Literal"
      ? firstStatement.expression.value
      : null;

  // consider early a null value as the absence of a directive
  if (value === null) return value;

  // the value to be exactly 'use client', 'use server' or 'use agnostic' in order not to be considered null by default, or server-by-default
  const currentFileDirective = directivesSet.has(value) ? value : null;

  return currentFileDirective;
};

/* resolveImportPath */

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]; // Priority order

/**
 * Resolves an import path to a filesystem path, handling:
 * - Aliases (via tsconfig.json `paths`)
 * - Missing extensions (appends .ts, .tsx, etc.)
 * - Directory imports (e.g., `./components` → `./components/index.ts`)
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @returns {string | null} Absolute resolved path or `null` if not found.
 */
const resolveImportPath = (currentDir, importPath, cwd) => {
  // --- Step 1: Resolve aliases (if tsconfig.json `paths` exists) ---
  const config = loadConfig(cwd);

  const resolveTSConfig =
    config.resultType === "success"
      ? createMatchPath(config.absoluteBaseUrl, config.paths)
      : null;

  const aliasedPath = resolveTSConfig
    ? resolveTSConfig(importPath, undefined, undefined, EXTENSIONS)
    : null;

  // --- Step 2: Resolve relative/absolute paths ---
  const basePath = aliasedPath || path.resolve(currentDir, importPath);

  // does not resolve on node_modules
  if (basePath.includes("node_modules")) return null;

  // Case 1: File with extension exists
  if (path.extname(importPath) && fs.existsSync(basePath)) return basePath;

  // Case 2: Try appending extensions
  for (const ext of EXTENSIONS) {
    const fullPath = `${basePath}${ext}`;
    if (fs.existsSync(fullPath)) return fullPath;
  }

  // Case 3: Directory import (e.g., `./components` → `./components/index.ts`)
  const indexPath = path.join(basePath, "index");
  for (const ext of EXTENSIONS) {
    const fullPath = `${indexPath}${ext}`;
    if (fs.existsSync(fullPath)) return fullPath;
  }

  return null; // Not found
};

/* getDirectiveFromImportedModule */

const directivesArray = Array.from(directivesSet);

/**
 * Gets the directive of the imported module.
 * - `'use client'` denotes a Client Module.
 * - `'use server'` denotes a Server Functions Module.
 * - `'use agnostic'` denotes an Agnostic Module (formerly Shared Module).
 * - `null` denotes a server-by-default module, or ideally a Server Module.
 * @param {string} resolvedImportPath
 * @returns {USE_CLIENT | USE_SERVER | USE_AGNOSTIC | NO_DIRECTIVE} The directive, or lack thereof via `null`. The lack of a directive is considered server-by-default.
 */
const getDirectiveFromImportedModule = (resolvedImportPath) => {
  // gets the code of the import
  const importedFileContent = fs.readFileSync(resolvedImportPath, "utf8");
  // get the first line of the code of the import
  const importedFileFirstLine = importedFileContent.trim().split("\n")[0];

  // verifies that this first line begins by a valid directive, thus excluding comments
  const hasAcceptedDirective = directivesArray.some(
    (directive) =>
      importedFileFirstLine.startsWith(`'${directive}'`) ||
      importedFileFirstLine.startsWith(`"${directive}"`),
  );

  // applies the correct directive or the lack thereof with null
  const importedFileDirective = hasAcceptedDirective
    ? (directivesArray.find((directive) =>
        importedFileFirstLine.includes(directive),
      ) ?? null)
    : null;

  return importedFileDirective;
};
