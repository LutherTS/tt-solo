import fs from "fs";
import path from "path";

import { loadConfig, createMatchPath } from "tsconfig-paths";

export const useAgnosticPluginName = "use-agnostic";
// rule names for directives

export const forUseServerRuleName = "server-functions-no-import-client";
export const forUseClientRuleName = "client-no-import-server";
export const forUseAgnosticRuleName = "agnostic-Componentsimport-agnostic-only";
// rule names for effective directives (I could make a utility but since this is JavaScript and not TypeScript, I want to have the rule names visible at a glance.)
export const forUseServerLogicsRuleName = "server-logics-modules-import-rules";
export const forUseServerComponentsRuleName =
  "server-components-modules-import-rules";
export const forUseServerFunctionsRuleName =
  "server-functions-modules-import-rules";
export const forUseClientLogicsRuleName = "client-logics-modules-import-rules";
export const forUseClientComponentsRuleName =
  "client-components-modules-import-rules";
export const forUseAgnosticLogicsRuleName =
  "agnostic-logics-modules-import-rules";
export const forUseAgnosticComponentsRuleName =
  "agnostic-components-modules-import-rules";

/* makeDirectiveImportRule */

// directives
const NO_DIRECTIVE = null;
export const USE_SERVER = "use server";
export const USE_CLIENT = "use client";
export const USE_AGNOSTIC = "use agnostic";

// effective directives
export const USE_SERVER_LOGICS = "use server logics";
export const USE_SERVER_COMPONENTS = "use server components";
export const USE_SERVER_FUNCTIONS = "use server functions";
export const USE_CLIENT_LOGICS = "use client logics";
export const USE_CLIENT_COMPONENTS = "use client components";
export const USE_AGNOSTIC_LOGICS = "use agnostic logics";
export const USE_AGNOSTIC_COMPONENTS = "use agnostic components";

// effective modules
const SERVER_LOGICS_MODULE = "Server Logics Module";
const SERVER_COMPONENTS_MODULE = "Server Components Module";
const SERVER_FUNCTIONS_MODULE = "Server Functions Module";
const CLIENT_LOGICS_MODULE = "Client Logics Module";
const CLIENT_COMPONENTS_MODULE = "Client Components Module";
const AGNOSTIC_LOGICS_MODULE = "Agnostic Logics Module";
const AGNOSTIC_COMPONENTS_MODULE = "Agnostic Components Module";

const effectiveDirectives_EffectiveModules = {
  [USE_SERVER_LOGICS]: SERVER_LOGICS_MODULE,
  [USE_SERVER_COMPONENTS]: SERVER_COMPONENTS_MODULE,
  [USE_SERVER_FUNCTIONS]: SERVER_FUNCTIONS_MODULE,
  [USE_CLIENT_LOGICS]: CLIENT_LOGICS_MODULE,
  [USE_CLIENT_COMPONENTS]: CLIENT_COMPONENTS_MODULE,
  [USE_AGNOSTIC_LOGICS]: AGNOSTIC_LOGICS_MODULE,
  [USE_AGNOSTIC_COMPONENTS]: AGNOSTIC_COMPONENTS_MODULE,
};

const makeDescriptionFromEffectiveDirective = (effectiveDirective) =>
  `Enforces import rules for ${effectiveDirectives_EffectiveModules[effectiveDirective]}s.`;

const descriptions = {
  // previous
  [USE_SERVER]:
    "Enforces that a Server Functions Module does not import Client Modules. ",
  [USE_CLIENT]:
    "Enforces that a Client Module does not import modules that are server by default. ",
  [USE_AGNOSTIC]:
    "Enforces that an Agnostic Module only imports other Agnostic Modules. ",
  // next
  [USE_SERVER_LOGICS]: makeDescriptionFromEffectiveDirective(USE_SERVER_LOGICS),
  [USE_SERVER_COMPONENTS]: makeDescriptionFromEffectiveDirective(
    USE_SERVER_COMPONENTS,
  ),
  [USE_SERVER_FUNCTIONS]:
    makeDescriptionFromEffectiveDirective(USE_SERVER_FUNCTIONS),
  [USE_CLIENT_LOGICS]: makeDescriptionFromEffectiveDirective(USE_CLIENT_LOGICS),
  [USE_CLIENT_COMPONENTS]: makeDescriptionFromEffectiveDirective(
    USE_CLIENT_COMPONENTS,
  ),
  [USE_AGNOSTIC_LOGICS]:
    makeDescriptionFromEffectiveDirective(USE_AGNOSTIC_LOGICS),
  [USE_AGNOSTIC_COMPONENTS]: makeDescriptionFromEffectiveDirective(
    USE_AGNOSTIC_COMPONENTS,
  ),
};

export const useServerMessageId = "importDirectiveIsClient";
export const useClientMessageId = "importDirectiveIsNull";
export const useAgnosticMessageId = "importDirectiveIsNotAgnostic";

const effectiveDirectiveMessageId = "importBreaksEffectiveDirectiveImportRules";

export const useServerLogicsMessageId = effectiveDirectiveMessageId;
export const useServerComponentsMessageId = effectiveDirectiveMessageId;
export const useServerFunctionsMessageId = effectiveDirectiveMessageId;
export const useClientLogicsMessageId = effectiveDirectiveMessageId;
export const useClientComponentsMessageId = effectiveDirectiveMessageId;
export const useAgnosticLogicsMessageId = effectiveDirectiveMessageId;
export const useAgnosticComponentsMessageId = effectiveDirectiveMessageId;

export const messageIds = {
  // previous
  [USE_SERVER]: useServerMessageId,
  [USE_CLIENT]: useClientMessageId,
  [USE_AGNOSTIC]: useAgnosticMessageId,
  // next
  [USE_SERVER_LOGICS]: useServerLogicsMessageId,
  [USE_SERVER_COMPONENTS]: useServerComponentsMessageId,
  [USE_SERVER_FUNCTIONS]: useServerFunctionsMessageId,
  [USE_CLIENT_LOGICS]: useClientLogicsMessageId,
  [USE_CLIENT_COMPONENTS]: useClientComponentsMessageId,
  [USE_AGNOSTIC_LOGICS]: useAgnosticLogicsMessageId,
  [USE_AGNOSTIC_COMPONENTS]: useAgnosticComponentsMessageId,
};

// Note: There will be additional messageIds and messages for each effective directive's blocked import. (3, 2, 5, 3, 2, 5, 4.)

const effectiveDirectives_BlockedImports = {
  [USE_SERVER_LOGICS]: [
    USE_SERVER_FUNCTIONS,
    USE_CLIENT_LOGICS,
    USE_CLIENT_COMPONENTS,
  ],
  [USE_SERVER_COMPONENTS]: [USE_SERVER_FUNCTIONS, USE_CLIENT_LOGICS],
  [USE_SERVER_FUNCTIONS]: [
    USE_SERVER_COMPONENTS,
    USE_SERVER_FUNCTIONS,
    USE_CLIENT_LOGICS,
    USE_CLIENT_COMPONENTS,
    USE_AGNOSTIC_COMPONENTS,
  ],
  [USE_CLIENT_LOGICS]: [
    USE_SERVER_LOGICS,
    USE_SERVER_COMPONENTS,
    USE_SERVER_FUNCTIONS,
  ],
  [USE_CLIENT_COMPONENTS]: [USE_SERVER_LOGICS, USE_SERVER_COMPONENTS],
  [USE_AGNOSTIC_LOGICS]: [
    USE_SERVER_LOGICS,
    USE_SERVER_COMPONENTS,
    USE_SERVER_FUNCTIONS,
    USE_CLIENT_LOGICS,
    USE_CLIENT_COMPONENTS,
  ],
  [USE_AGNOSTIC_COMPONENTS]: [
    USE_SERVER_LOGICS,
    USE_SERVER_COMPONENTS,
    USE_SERVER_FUNCTIONS,
    USE_CLIENT_LOGICS,
  ],
};

const makeMessageFromEffectiveDirective = (effectiveDirective) => {
  const effectiveModule =
    effectiveDirectives_EffectiveModules[effectiveDirective];
  const effectiveModulesString = effectiveModule + "s"; // plural

  const blockedImports =
    effectiveDirectives_BlockedImports[effectiveDirective] || [];

  if (blockedImports.length === 0) {
    return `${effectiveModulesString} are not restricted from importing any modules.`;
  }

  const blockedEffectiveModules = blockedImports.map(
    (e) => effectiveDirectives_EffectiveModules[e] + "s", // plural
  );

  const blockedEffectiveModulesString =
    blockedEffectiveModules.length === 1
      ? blockedEffectiveModules[0]
      : blockedEffectiveModules.slice(0, -1).join(", ") +
        ", or " +
        blockedEffectiveModules.slice(-1);

  return `${effectiveModulesString} are not allowed to import ${blockedEffectiveModulesString}.`;
};

const messages = {
  // previous
  [USE_SERVER]:
    "Server Functions Modules cannot import Client Modules. Please remove the import, or adapt it accordingly by making it a server-by-default module (via no directive), a fellow Server Functions Module (not recommended) or an Agnostic Module (via 'use agnostic' on top of the file). ...Or perhaps the current module shouldn't be marked with the 'use server' directive. ",
  [USE_CLIENT]:
    "The imported module lacks a directive. (Neither marked with 'use client', nor 'use server', nor 'use agnostic'.) There is a likelihood that the imported module is not meant to leave the server. If that is not the case, please mark it with 'use agnostic' on top of the file to allow it for import on the client as well, thus differentiating it from an actual Server Module. ...Or perhaps the current module shouldn't be marked with the 'use client' directive. ",
  [USE_AGNOSTIC]:
    "Agnostic Modules can only import other Agnostic Modules. Please remove the import, or adapt it accordingly by making it a fellow Agnostic Module (via 'use agnostic' on top of the file). ...Or perhaps the current module shouldn't be marked with the 'use agnostic' directive. ",
  // next
  [USE_SERVER_LOGICS]: makeMessageFromEffectiveDirective(USE_SERVER_LOGICS),
  [USE_SERVER_COMPONENTS]: makeMessageFromEffectiveDirective(
    USE_SERVER_COMPONENTS,
  ),
  [USE_SERVER_FUNCTIONS]:
    makeMessageFromEffectiveDirective(USE_SERVER_FUNCTIONS),
  [USE_CLIENT_LOGICS]: makeMessageFromEffectiveDirective(USE_CLIENT_LOGICS),
  [USE_CLIENT_COMPONENTS]: makeMessageFromEffectiveDirective(
    USE_CLIENT_COMPONENTS,
  ),
  [USE_AGNOSTIC_LOGICS]: makeMessageFromEffectiveDirective(USE_AGNOSTIC_LOGICS),
  [USE_AGNOSTIC_COMPONENTS]: makeMessageFromEffectiveDirective(
    USE_AGNOSTIC_COMPONENTS,
  ),
};

const isImportBlocked = (
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  effectiveDirectives_BlockedImports[currentFileEffectiveDirective].includes(
    importedFileEffectiveDirective,
  );

// previous
// const conditions = {
//   [USE_SERVER]: (importedFileDirective) => importedFileDirective === USE_CLIENT,
//   [USE_CLIENT]: (importedFileDirective) =>
//     importedFileDirective === NO_DIRECTIVE,
//   [USE_AGNOSTIC]: (importedFileDirective) =>
//     importedFileDirective !== USE_AGNOSTIC,
// };

/**
 * Makes an effective directive's import rule.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} effectiveDirective The effective directive the rule is to be made for.
 * @returns {import('@typescript-eslint/utils').TSESLint.RuleModule<useServerLogicsMessageId, []>} The effective directive's import rule.
 */
export const makeEffectiveDirectiveImportRule = (effectiveDirective) => ({
  meta: {
    type: "problem",
    docs: {
      description: descriptions[effectiveDirective],
    },
    schema: [],
    messages: {
      [messageIds[effectiveDirective]]: messages[effectiveDirective],
    },
  },
  create: (context) => {
    /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
    const currentFileDirective = getDirectiveFromCurrentModule(context);
    // GETTING THE EXTENSION OF THE CURRENT FILE
    const currentFileExtension = path.extname(context.filename);
    // GETTING THE EFFECTIVE DIRECTIVE OF THE CURRENT FILE
    const currentFileEffectiveDirective = getEffectiveDirective(
      currentFileDirective,
      currentFileExtension,
    );

    console.log({
      currentFileDirective,
      currentFileExtension,
      currentFileEffectiveDirective,
    });

    return {
      ImportDeclaration: (node) => {
        // only operates on the rule's dedicated directive
        if (currentFileDirective !== effectiveDirective) return;
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
        // GETTING THE EXTENSION OF THE IMPORTED FILE
        const importedFileFileExtension = path.extname(resolvedImportPath);
        // GETTING THE EFFECTIVE DIRECTIVE OF THE IMPORTED FILE
        const importedFileEffectiveDirective = getEffectiveDirective(
          importedFileDirective,
          importedFileFileExtension,
        );

        console.log({
          importedFileDirective,
          importedFileFileExtension,
          importedFileEffectiveDirective,
        });

        // if (conditions[directive](importedFileDirective))
        if (
          isImportBlocked(
            currentFileEffectiveDirective,
            importedFileEffectiveDirective,
          )
        )
          context.report({
            node,
            // messageId: messageIds[directive],
            messageId: messageIds[currentFileEffectiveDirective],
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
 * - `null` denotes a server-by-default module, ideally a Server Module.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<"importDirectiveIsNull", []>>} context
 * @returns {USE_SERVER | USE_CLIENT | USE_AGNOSTIC | NO_DIRECTIVE} The directive, or lack thereof via `null`. The lack of a directive is considered server-by-default.
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

const TSX = ".tsx";
const TS = ".ts";
const JSX = ".jsx";
const JS = ".js";
const MJS = ".mjs";
const CJS = ".cjs";

const EXTENSIONS = [TSX, TS, JSX, JS, MJS, CJS]; // Priority order

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
 * - `null` denotes a server-by-default module, ideally a Server Module.
 * @param {string} resolvedImportPath
 * @returns {USE_SERVER | USE_CLIENT | USE_AGNOSTIC | NO_DIRECTIVE} The directive, or lack thereof via `null`. The lack of a directive is considered server-by-default.
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

/* getEffectiveDirective */

/**
 * Gets the effective directive of a module, based on the combination of its directive (or lack thereof) and its extension (depending on whether it ends with 'x' for JSX).
 * - `'use server logics'` denotes a Server Logics Module.
 * - `'use server components'` denotes a Server Components Module.
 * - `'use server functions'` denotes a Server Functions Module.
 * - `'use client logics'` denotes a Client Logics Module.
 * - `'use client components'` denotes a Client Components Module.
 * - `'use agnostic logics'` denotes an Agnostic Logics Module.
 * - `'use agnostic components'` denotes an Agnostic Components Module.
 * @param {USE_SERVER | USE_CLIENT | USE_AGNOSTIC | NO_DIRECTIVE} directive The directive as written on top of the file (`null` if no valid directive).
 * @param {TSX | TS | JSX | JS | MJS | CJS} extension The JavaScript (TypeScript) extension of the file.
 * @returns {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} The effective directive, from which imports rules are applied.
 */
const getEffectiveDirective = (directive, extension) => {
  // I could use a map, but because this is in JS with JSDoc, a manual solution is peculiarly more typesafe.
  if (directive === NO_DIRECTIVE && !extension.endsWith("x"))
    return USE_SERVER_LOGICS;
  if (directive === NO_DIRECTIVE && extension.endsWith("x"))
    return USE_SERVER_COMPONENTS;
  if (directive === USE_SERVER && !extension.endsWith("x"))
    return USE_SERVER_FUNCTIONS;
  if (directive === USE_CLIENT && !extension.endsWith("x"))
    return USE_CLIENT_LOGICS;
  if (directive === USE_CLIENT && extension.endsWith("x"))
    return USE_CLIENT_COMPONENTS;
  if (directive === USE_AGNOSTIC && !extension.endsWith("x"))
    return USE_AGNOSTIC_LOGICS;
  if (directive === USE_AGNOSTIC && extension.endsWith("x"))
    return USE_AGNOSTIC_COMPONENTS;
  else return null; // default error, should be unreachable
};
