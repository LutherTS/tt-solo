import path from "path";

import { EXTENSIONS } from "../../_commons/constants/bases.js";
import {
  USE_SERVER_LOGICS,
  USE_SERVER_COMPONENTS,
  USE_SERVER_FUNCTIONS,
  USE_CLIENT_LOGICS,
  USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_LOGICS,
  USE_AGNOSTIC_COMPONENTS,
  useServerJSXMessageId,
  importBreaksImportRulesMessageId,
  reExportNotSameMessageId,
} from "../constants/bases.js";

import { resolveImportPath } from "../../_commons/utilities/helpers.js";
import {
  getDirectiveFromCurrentModule,
  getDirectiveFromImportedModule,
  getEffectiveDirective,
  isImportBlocked,
  makeMessageFromEffectiveDirective,
  findSpecificViolationMessage,
} from "./helpers.js";

// TEST START
import { USE_AGNOSTIC_STRATEGIES } from "../../directive21/constants/bases.js";
import {
  getCommentedDirectiveFromImportedModule,
  getStrategizedDirective,
} from "../../directive21/utilities/helpers.js";
// TEST END

/* currentFileFlow */

/**
 *
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof useServerJSXMessageId | typeof importBreaksImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @returns {{skip: true; currentFileEffectiveDirective: undefined;} | {skip: undefined; currentFileEffectiveDirective: USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS;}}
 */
export const currentFileFlow = (context) => {
  // console.log({ currentFilename: context.filename });

  // GETTING THE EXTENSION OF THE CURRENT FILE
  const currentFileExtension = path.extname(context.filename);

  // fails if the file is not JavaScript (TypeScript)
  const iscurrentFileJS = EXTENSIONS.some(
    (ext) => currentFileExtension === ext,
  );
  if (!iscurrentFileJS) {
    console.error(
      "ERROR. Linted files for this rule should only be in JavaScript (TypeScript).",
    );
    return { skip: true };
  }

  // // TEST START
  // const commentedDirective = getCommentedDirectiveFromCurrentModule(context);
  // console.log({ commentedDirective });
  // const verifiedCommentedDirective = getVerifiedCommentedDirective(
  //   commentedDirective,
  //   currentFileExtension,
  // );
  // console.log({ verifiedCommentedDirective });
  // // TEST END

  /* GETTING THE DIRECTIVE (or lack thereof) OF THE CURRENT FILE */
  const currentFileDirective = getDirectiveFromCurrentModule(context);

  // reports if a file marked "use server" has a JSX extension
  if (
    currentFileDirective === "use server" &&
    currentFileExtension.endsWith("x")
  ) {
    context.report({
      loc: {
        start: { line: 1, column: 0 },
        end: { line: 1, column: context.sourceCode.lines[0].length },
      },
      messageId: useServerJSXMessageId,
    });
    return { skip: true };
  }

  // GETTING THE EFFECTIVE DIRECTIVE OF THE CURRENT FILE
  const currentFileEffectiveDirective = getEffectiveDirective(
    currentFileDirective,
    currentFileExtension,
  );

  // fails if one of the seven effective directives has not been obtained
  if (currentFileEffectiveDirective === null) {
    console.error("ERROR. Effective directive should never be null.");
    return { skip: true };
  }

  console.log({
    currentFileDirective,
    currentFileExtension,
    currentFileEffectiveDirective,
  });

  return {
    currentFileEffectiveDirective,
  };
};

/* importedFileFlow */

/**
 * The flow that is shared between import and re-export traversals to obtain the import file's effective directive.
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @returns {{skip: true; importedFileEffectiveDirective: undefined; resolvedImportPath: undefined;} | {skip: undefined; importedFileEffectiveDirective: USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS; resolvedImportPath: string;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileEffectiveDirective`.
 */
const importedFileFlow = (currentDir, importPath, cwd) => {
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
    resolvedImportPath, // bonus
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

  const result = importedFileFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
  );

  if (result.skip) return;
  const { importedFileEffectiveDirective, resolvedImportPath } = result;

  // TEST START
  let importedFileCommentedDirective =
    getCommentedDirectiveFromImportedModule(resolvedImportPath);
  console.log({ importedFileCommentedDirective });

  if (importedFileCommentedDirective === USE_AGNOSTIC_STRATEGIES)
    importedFileCommentedDirective = getStrategizedDirective(context, node);
  console.log({ importedFileCommentedDirective });
  // TEST END

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
export const reExportFlow = (context, node, currentFileEffectiveDirective) => {
  // does not operate on `export type`
  if (node.exportKind === "type") return;

  // does not operate on internal exports
  if (node.source === null) return;

  const result = importedFileFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
  );

  if (result.skip) return;
  const { importedFileEffectiveDirective, resolvedImportPath } = result;

  // TEST START (idem)
  // It's not showing up because I'm doing this on a internal export. This will need to be addressed.
  let importedFileCommentedDirective =
    getCommentedDirectiveFromImportedModule(resolvedImportPath);
  console.log({ importedFileCommentedDirective });

  if (importedFileCommentedDirective === USE_AGNOSTIC_STRATEGIES)
    importedFileCommentedDirective = getStrategizedDirective(context, node);
  console.log({ importedFileCommentedDirective });
  // TEST END (idem)

  // TEST START
  let currentExportCommentedDirective = getCommentedDirectiveFromImportedModule(
    context.filename,
  );
  console.log({ currentExportCommentedDirective });

  if (currentExportCommentedDirective === USE_AGNOSTIC_STRATEGIES)
    currentExportCommentedDirective = getStrategizedDirective(context, node);
  console.log({ currentExportCommentedDirective });
  // TEST END

  /* THIS IS WHERE THE NEXT TEST IS EXPECTED
  reExportNotSame applies to all commented directives except for "use agnostic strategies", for which the re-export's Strategy needs to match the import. But then that means while the imported file's commented directive logic is made, that of the current file's commented directive will need be made. Something like `if (currentFileEffectiveDirective) === USE_AGNOSTIC_STRATEGIES` look up the inner comments, find the strategy, and update currentFileEffectiveDirective as the interpreted directive from the strategy.
  Bear in mind: this is really the last step for both agnostic20 and directive21 to be one-to-one with one another. At this point the plugin will really be ready for version 0.1.0, with both agnostic20 and directive21 entirely paralleled before I start improving directive21 first with customized defaults when there is no directive, making my first rule object in the process, with even more to come. 
  THE VERDICT IS.
  I need to make my own directive21 now in order to test these tests live. All the helpers are made. Now only the flows remain. These will need to be tested live.
  */

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
