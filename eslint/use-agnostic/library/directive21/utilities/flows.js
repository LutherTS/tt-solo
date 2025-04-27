import path from "path";

import {
  EXTENSIONS,
  importBreaksCommentedImportRulesMessageId,
  reExportNotSameMessageId,
} from "../../_commons/constants/bases.js";
import {
  USE_SERVER_LOGICS,
  USE_CLIENT_LOGICS,
  USE_AGNOSTIC_LOGICS,
  USE_SERVER_COMPONENTS,
  USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_COMPONENTS,
  USE_SERVER_FUNCTIONS,
  USE_CLIENT_CONTEXTS,
  USE_AGNOSTIC_CONDITIONS,
  USE_AGNOSTIC_STRATEGIES,
} from "../constants/bases.js";

import { resolveImportPath } from "../../_commons/utilities/helpers.js";
import {
  getCommentedDirectiveFromCurrentModule,
  getVerifiedCommentedDirective,
  getCommentedDirectiveFromImportedModule,
  isImportBlocked,
  makeMessageFromCommentedDirective,
  findSpecificViolationMessage,
  getStrategizedDirective,
} from "./helpers.js";

/* currentFileFlow */

/**
 * The flow that begins the import rules enforcement rule, retrieving the valid directive of the current file before comparing it to upcoming valid directives of the files it imports.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof importBreaksCommentedImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @returns {{skip: true; verifiedCommentedDirective: undefined;} | {skip: undefined; verifiedCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES;}} Returns either an object with `skip: true` to disregard or one with the non-null `verifiedCommentedDirective`.
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

  // gets the commented directive from the current file
  const commentedDirective = getCommentedDirectiveFromCurrentModule(context);
  console.log({ commentedDirective });

  // reports if there is no directive or no valid directive (same, but eventually no directive could have defaults) (report will be made later)
  if (!commentedDirective) {
    console.log("No or no valid commented directive.");
    return { skip: true };
  }

  const verifiedCommentedDirective = getVerifiedCommentedDirective(
    commentedDirective,
    currentFileExtension,
  );
  console.log({ verifiedCommentedDirective });

  // reports if the verification failed (report will be made later)
  if (!verifiedCommentedDirective) {
    console.log("Verification failed for the commented directive.");
    return { skip: true };
  }

  return {
    verifiedCommentedDirective,
  };
};

/* importedFileFlow */

/**
 * The flow that is shared between import and re-export traversals to obtain the import file's commented directive.
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof importBreaksCommentedImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ImportDeclaration} node The ESLint `node` of the rule's current traversal.
 * @returns {{skip: true; importedFileCommentedDirective: undefined;} | {skip: undefined; importedFileCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileCommentedDirective`.
 */
const importedFileFlow = (currentDir, importPath, cwd, context, node) => {
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
  let importedFileCommentedDirective =
    getCommentedDirectiveFromImportedModule(resolvedImportPath);
  console.log({
    getCommentedDirectiveFromImportedModule: importedFileCommentedDirective,
  });

  // returns early if there is no directive or no valid directive (same, but eventually no directive could have defaults)
  if (!importedFileCommentedDirective) return { skip: true };

  /* GETTING THE CORRECT DIRECTIVE INTERPRETATION OF STRATEGY FOR AGNOSTIC STRATEGIES MODULES IMPORTS. 
  (The Directive-First Architecture does not check whether the export and import Strategies are the same at this time, meaning a @clientLogics strategy could be wrongly imported and interpreted as a @serverLogics strategy. However, Strategy exports are plan to be linting in the future within their own Agnostic Strategies Modules to ensure they respect import rules within their own scopes. It may also become possible to check whether the export and import Strategies are the same in the future when identifiers as defined and the same, especially for components module where a convention could be to for all non-type export to be named and PascalCase.) */
  if (importedFileCommentedDirective === USE_AGNOSTIC_STRATEGIES) {
    importedFileCommentedDirective = getStrategizedDirective(context, node);
    console.log({ getStrategizedDirective: importedFileCommentedDirective });

    if (importedFileCommentedDirective === null) {
      // next it will be a report
      console.warn(
        "All imports from Agnostic Strategies Modules must be strategized.",
      );
    }
  }

  // returns early again this time if there is no Strategy or no valid Strategy from an Agnostic Strategies Module import, since they can only be imported via Strategies
  if (!importedFileCommentedDirective) return { skip: true };

  console.log({
    importedFileCommentedDirective,
  });

  return {
    importedFileCommentedDirective,
  };
};

/* importsFlow */

/** The full flow for import traversals to enforce effective directives import rules.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof importBreaksCommentedImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ImportDeclaration} node The ESLint `node` of the rule's current traversal.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} currentFileCommentedDirective The current file's commented directive.
 * @returns Returns early if the flow needs to be interrupted.
 */
export const importsFlow = (context, node, currentFileCommentedDirective) => {
  // does not operate on `import type`
  if (node.importKind === "type") return;

  const result = importedFileFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
    context,
    node,
  );

  if (result.skip) return;
  const { importedFileCommentedDirective } = result;

  if (
    isImportBlocked(
      currentFileCommentedDirective,
      importedFileCommentedDirective,
    )
  ) {
    context.report({
      node,
      messageId: importBreaksCommentedImportRulesMessageId,
      data: {
        commentedDirectiveMessage: makeMessageFromCommentedDirective(
          currentFileCommentedDirective,
        ),
        specificViolationMessage: findSpecificViolationMessage(
          currentFileCommentedDirective,
          importedFileCommentedDirective,
        ),
      },
    });
  }
};

/* WHAT'S NEXT: allExportsFlow */

/** The full flow for export traversals, shared between `ExportNamedDeclaration`and `ExportAllDeclaration`, to ensure same commented directive re-exports and strategized exports specifically in Agnostic Strategies Modules.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<typeof importBreaksCommentedImportRulesMessageId | typeof reExportNotSameMessageId, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ExportNamedDeclaration | import('@typescript-eslint/types').TSESTree.ExportAllDeclaration} node The ESLint `node` of the rule's current traversal.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} currentFileCommentedDirective The current file's effective directive.
 * @returns Returns early if the flow needs to be interrupted.
 */
export const allExportsFlow = (
  context,
  node,
  currentFileCommentedDirective,
) => {
  // does not operate on `export type`
  if (node.exportKind === "type") return;

  // operating on external exports except on Agnostic Strategies Modules
  if (
    node.source !== null &&
    currentFileCommentedDirective !== USE_AGNOSTIC_STRATEGIES
  ) {
    const result = importedFileFlow(
      path.dirname(context.filename),
      node.source.value,
      context.cwd,
      context,
      node,
    );

    if (result.skip) return;
    const { importedFileCommentedDirective } = result;

    // // TEST START (idem)
    // // It's not showing up because I'm doing this on a internal export. This will need to be addressed.
    // let importedFileCommentedDirective =
    //   getCommentedDirectiveFromImportedModule(resolvedImportPath);
    // console.log({ importedFileCommentedDirective });

    // if (importedFileCommentedDirective === USE_AGNOSTIC_STRATEGIES)
    //   importedFileCommentedDirective = getStrategizedDirective(context, node);
    // console.log({ importedFileCommentedDirective });
    // // TEST END (idem)

    // // TEST START
    // let currentExportCommentedDirective =
    //   getCommentedDirectiveFromImportedModule(context.filename);
    // console.log({ currentExportCommentedDirective });

    // if (currentExportCommentedDirective === USE_AGNOSTIC_STRATEGIES)
    //   currentExportCommentedDirective = getStrategizedDirective(context, node);
    // console.log({ currentExportCommentedDirective });
    // // TEST END

    /* THIS IS WHERE THE NEXT TEST IS EXPECTED
  reExportNotSame applies to all commented directives except for "use agnostic strategies", for which the re-export's Strategy needs to match the import. But then that means while the imported file's commented directive logic is made, that of the current file's commented directive will need be made. Something like `if (currentFileEffectiveDirective) === USE_AGNOSTIC_STRATEGIES` look up the inner comments, find the strategy, and update currentFileEffectiveDirective as the interpreted directive from the strategy.
  Bear in mind: this is really the last step for both agnostic20 and directive21 to be one-to-one with one another. At this point the plugin will really be ready for version 0.1.0, with both agnostic20 and directive21 entirely paralleled before I start improving directive21 first with customized defaults when there is no directive, making my first rule object in the process, with even more to come. 
  THE VERDICT IS.
  I need to make my own directive21 now in order to test these tests live. All the helpers are made. Now only the flows remain. These will need to be tested live.
  */

    if (currentFileCommentedDirective !== importedFileCommentedDirective) {
      context.report({
        node,
        messageId: reExportNotSameMessageId,
        data: {
          currentFileCommentedDirective,
          importedFileCommentedDirective,
        },
      });
    }
  }

  // now operating on internal exports for Agnostic Strategies Modules
  if (
    node.source === null &&
    currentFileCommentedDirective === USE_AGNOSTIC_STRATEGIES
  ) {
    const exportStrategizedDirective = getStrategizedDirective(context, node);
    console.log({ exportStrategizedDirective });

    if (exportStrategizedDirective === null) {
      // next it will be a report
      console.warn(
        "All exports from Agnostic Strategies Modules must be strategized.",
      );
    }
  }
};
