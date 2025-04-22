import path from "path";

import {
  USE_SERVER_LOGICS,
  USE_SERVER_COMPONENTS,
  USE_SERVER_FUNCTIONS,
  USE_CLIENT_LOGICS,
  USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_LOGICS,
  USE_AGNOSTIC_COMPONENTS,
  EXTENSIONS,
  useServerJSXMessageId,
  importBreaksImportRulesMessageId,
  reExportNotSameMessageId,
} from "../../constants/core/bases.js";

import {
  resolveImportPath,
  getDirectiveFromImportedModule,
  getEffectiveDirective,
  isImportBlocked,
  makeMessageFromEffectiveDirective,
  findSpecificViolationMessage,
} from "./helpers.js";

/* flow */

/**
 * The core flow that is shared between import and export traversals to obtain the import file's effective directive.
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @returns {{skip: true; importedFileEffectiveDirective: undefined;} | {importedFileEffectiveDirective: USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS; skip: undefined;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileEffectiveDirective`.
 */
const flow = (currentDir, importPath, cwd) => {
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

  const result = flow(
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

  const result = flow(
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
