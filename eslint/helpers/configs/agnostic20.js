import fs from "fs";
import path from "path";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import { loadConfig, createMatchPath } from "tsconfig-paths";

import {
  agnostic20ConfigName,
  useAgnosticPluginName,
  importRulesEnforcementRuleName,
} from "../names/use-agnostic.js";

/**
 * Makes the agnostic20 config for the use-agnostic ESLint plugin.
 */
export const makeAgnostic20Config = (plugin) => ({
  [agnostic20ConfigName]: defineConfig([
    {
      plugins: {
        [useAgnosticPluginName]: plugin,
      },
      languageOptions: {
        // for compatibility with .ts and .tsx
        parser: tseslint.parser,
      },
      rules: {
        [`${useAgnosticPluginName}/${importRulesEnforcementRuleName}`]: "warn",
      },
    },
  ]),
});

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

// mapping effective directives with effective modules
const effectiveDirectives_EffectiveModules = {
  [USE_SERVER_LOGICS]: SERVER_LOGICS_MODULE,
  [USE_SERVER_COMPONENTS]: SERVER_COMPONENTS_MODULE,
  [USE_SERVER_FUNCTIONS]: SERVER_FUNCTIONS_MODULE,
  [USE_CLIENT_LOGICS]: CLIENT_LOGICS_MODULE,
  [USE_CLIENT_COMPONENTS]: CLIENT_COMPONENTS_MODULE,
  [USE_AGNOSTIC_LOGICS]: AGNOSTIC_LOGICS_MODULE,
  [USE_AGNOSTIC_COMPONENTS]: AGNOSTIC_COMPONENTS_MODULE,
};

// messageIds
export const useServerJSXMessageId = "use-server-has-jsx-extension";
export const importBreaksImportRulesMessageId =
  "import-breaks-effective-directive-import-rule";
export const reExportNotSameMessageId = "re-export-not-same-directive";

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
export const getDirectiveFromCurrentModule = (context) => {
  // the AST body to check for the top-of-the-file directive
  const { body } = context.sourceCode.ast;

  // the first statement from the source code's Abstract Syntax Tree
  const firstStatement = body[0];

  // the value of that first statement or null
  const value =
    firstStatement?.type === "ExpressionStatement" &&
    firstStatement.expression?.type === "Literal"
      ? firstStatement.expression.value
      : null;

  // considers early a null value as the absence of a directive
  if (value === null) return value;

  // the value to be exactly 'use client', 'use server' or 'use agnostic' in order not to be considered null by default, or server-by-default
  const currentFileDirective = directivesSet.has(value) ? value : null;

  return currentFileDirective;
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
 * @returns {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS | null} The effective directive, from which imports rules are applied.
 */
export const getEffectiveDirective = (directive, extension) => {
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

  return null; // default error, should be unreachable
};

/* resolveImportPath */

const TSX = ".tsx";
const TS = ".ts";
const JSX = ".jsx";
const JS = ".js";
const MJS = ".mjs";
const CJS = ".cjs";

export const EXTENSIONS = [TSX, TS, JSX, JS, MJS, CJS]; // Priority order

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
  // gets the first line of the code of the import
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

/* isImportBlocked */

const ARE_NOT_ALLOWED_TO_IMPORT = "are not allowed to import";

const makeIntroForSpecificViolationMessage = (
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  `${effectiveDirectives_EffectiveModules[currentFileEffectiveDirective]}s ${ARE_NOT_ALLOWED_TO_IMPORT} ${effectiveDirectives_EffectiveModules[importedFileEffectiveDirective]}s.`;

const effectiveDirectives_BlockedImports = {
  [USE_SERVER_LOGICS]: [
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_SERVER_FUNCTIONS)} Server Functions are only to be triggered by Client Components.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_COMPONENTS)} Client Components cannot be tinkered with on the server.`,
    },
  ],
  [USE_SERVER_COMPONENTS]: [
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_SERVER_FUNCTIONS)} Server Components Modules can make their own Server Functions through inline 'use server' directives.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
  ],
  [USE_SERVER_FUNCTIONS]: [
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_SERVER_COMPONENTS)} Server Functions have no business working with React Components.`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_SERVER_FUNCTIONS)} Server Functions don't need to import one another. Import their logic through Server Logics Modules instead. (Made with no directive and no JSX extension.)`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_CLIENT_COMPONENTS)} Server Functions have no business working with React Components.`,
    },
    {
      blockedImport: USE_AGNOSTIC_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_AGNOSTIC_COMPONENTS)} Server Functions have no business working with React Components.`,
    },
  ],
  [USE_CLIENT_LOGICS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_LOGICS)} Server logic should never leak to the client.`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_COMPONENTS)} Server Components cannot be thinkered with on the client.`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_FUNCTIONS)} Server Functions only interact with the client through Client Components.`,
    },
  ],
  [USE_CLIENT_COMPONENTS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_COMPONENTS, USE_SERVER_LOGICS)} Server logic should never leak to the client.`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_COMPONENTS, USE_SERVER_COMPONENTS)} Server Components may only pass through Client Components through the children prop within Server Components Modules.`,
    },
  ],
  [USE_AGNOSTIC_LOGICS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_LOGICS)} Server Logic cannot run in both the server and the client.`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_COMPONENTS)} Server Components cannot be tinkered with on both the server and the client.`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_FUNCTIONS)} Server Functions are only to be triggered by Client Components.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_CLIENT_LOGICS)} Client Logic cannot run in both the server and the client.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_CLIENT_COMPONENTS)} Client Components cannot be tinkered with on both the server and the client.`,
    },
  ],
  [USE_AGNOSTIC_COMPONENTS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_COMPONENTS, USE_SERVER_LOGICS)} Server Logic cannot run in both the server and the client.`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_COMPONENTS, USE_SERVER_COMPONENTS)} Unlike Client Components, Server Components cannot make a silo of their own once on the client, and can therefore not be executed from the client.`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_COMPONENTS, USE_SERVER_FUNCTIONS)} Though Server Functions could be passed to Client Components in Agnostic Components Modules, prefer importing them directly in Client Components Modules instead.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_COMPONENTS, USE_CLIENT_LOGICS)} Client Logic cannot run in both the server and the client.`,
    },
  ],
};

/**
 * Returns a boolean deciding if an imported file's effective directive is incompatible with the current file's effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} importedFileEffectiveDirective The imported file's effective directive.
 * @returns {boolean} Returns `true` if the import is blocked, as established in `effectiveDirectives_BlockedImports`.
 */
const isImportBlocked = (
  // Note: "Blocked" here is preferred over "not allowed" because a specific message will be shared for each of the blocked situations, explaining their reasons and the solutions needed.
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  effectiveDirectives_BlockedImports[currentFileEffectiveDirective]
    .map((e) => e.blockedImport)
    .includes(importedFileEffectiveDirective);

/* makeMessageFromEffectiveDirective */

/**
 * Lists in an message the effective modules incompatible with an effective module based on its effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} effectiveDirective The effective directive of the effective module.
 * @returns {string} The message listing the incompatible effective modules.
 */
const makeMessageFromEffectiveDirective = (effectiveDirective) => {
  const effectiveModule =
    effectiveDirectives_EffectiveModules[effectiveDirective];
  const effectiveModulesString = effectiveModule + "s"; // plural

  const blockedImports =
    effectiveDirectives_BlockedImports[effectiveDirective].map(
      (e) => e.blockedImport,
    ) || [];

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

  return `${effectiveModulesString} ${ARE_NOT_ALLOWED_TO_IMPORT} ${blockedEffectiveModulesString}.`;
};

/* findSpecificViolationMessage */

/**
 * Finds the `message` for the specific violation of effective directives import rules based on `effectiveDirectives_BlockedImports`.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} importedFileEffectiveDirective The imported file's effective directive.
 * @returns {string} The corresponding `message`.
 */
const findSpecificViolationMessage = (
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  effectiveDirectives_BlockedImports[currentFileEffectiveDirective].find(
    (e) => e.blockedImport === importedFileEffectiveDirective,
  ).message;

/* coreFlow */

/**
 * The core flow that is shared between import and export traversals to obtain the import file's effective directive.
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @returns {{skip: true; importedFileEffectiveDirective: undefined;} | {importedFileEffectiveDirective: USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS; skip: undefined;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileEffectiveDirective`.
 */
const coreFlow = (currentDir, importPath, cwd) => {
  // finds the full path of the import
  const resolvedImportPath = resolveImportPath(currentDir, importPath, cwd);

  // does not operate on paths it did not resolve
  if (resolvedImportPath === null) return { skip: true };
  // does not operate on non-JS files
  const isImportedFileJS = EXTENSIONS.some((ext) =>
    resolvedImportPath.endsWith(ext),
  );
  if (!isImportedFileJS) return { skip: true };

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

  // also fails if one of the seven effective directives has not been obtained
  if (importedFileEffectiveDirective === null) {
    console.error("ERROR. Effective directive should never be null.");
    return { skip: true };
  }

  // console.log({
  //   importedFileDirective,
  //   importedFileFileExtension,
  //   importedFileEffectiveDirective,
  // });

  // For now skipping on both "does not operate" (which should ignore) and "fails" albeit with console.error (which should crash).

  return {
    importedFileEffectiveDirective,
  };
};

/* importFlow */

/** The full flow for import traversals to enforce effective directives import rules.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof useServerJSXMessageId | typeof importBreaksImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ImportDeclaration} node The ESLint `node` of the rule's current traversal.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @returns Returns early if the flow needs to be interrupted.
 */
export const importFlow = (context, node, currentFileEffectiveDirective) => {
  // does not operate on `import type`
  if (node.importKind === "type") return;

  const result = coreFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
  );

  if (result.skip) return;
  const { importedFileEffectiveDirective } = result;

  if (
    isImportBlocked(
      currentFileEffectiveDirective,
      importedFileEffectiveDirective,
    )
  ) {
    context.report({
      node,
      messageId: importBreaksImportRulesMessageId,
      data: {
        effectiveDirectiveMessage: makeMessageFromEffectiveDirective(
          currentFileEffectiveDirective,
        ),
        specificViolationMessage: findSpecificViolationMessage(
          currentFileEffectiveDirective,
          importedFileEffectiveDirective,
        ),
      },
    });
  }
};

/* exportFlow */

/** The full flow for export traversals, shared between `ExportNamedDeclaration`and `ExportAllDeclaration`, to ensure same effective directive re-exports.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof useServerJSXMessageId | typeof importBreaksImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ExportNamedDeclaration | import('@typescript-eslint/types').TSESTree.ExportAllDeclaration} node The ESLint `node` of the rule's current traversal.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @returns Returns early if the flow needs to be interrupted.
 */
export const exportFlow = (context, node, currentFileEffectiveDirective) => {
  // does not operate on `export type`
  if (node.exportKind === "type") return;

  // does not operate on internal exports
  if (node.source === null) return;

  const result = coreFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
  );

  if (result.skip) return;
  const { importedFileEffectiveDirective } = result;

  if (currentFileEffectiveDirective !== importedFileEffectiveDirective) {
    context.report({
      node,
      messageId: reExportNotSameMessageId,
      data: {
        currentFileEffectiveDirective,
        importedFileEffectiveDirective,
      },
    });
  }
};
