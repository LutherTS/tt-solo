import path from "path";

import { EXTENSIONS } from "../../_commons/constants/bases.js";
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
  importBreaksImportRulesMessageId,
} from "../constants/bases.js";

import { resolveImportPath } from "../../_commons/utilities/helpers.js";
import {
  getCommentedDirectiveFromCurrentModule,
  getVerifiedCommentedDirective,
  getCommentedDirectiveFromImportedModule,
  isImportBlocked,
  makeMessageFromCommentedDirective,
  findSpecificViolationMessage,
} from "./helpers.js";

/* currentFileFlow */

/**
 * The flow that begins the import rules enforcement rule, retrieving the valid directive of the current file before comparing it to upcoming valid directives of the files it imports.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context The ESLint rule's `context` object.
 * @returns {{skip: true; verifiedCommentedDirective: undefined;} | {skip: undefined; verifiedCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS;}} Returns either an object with `skip: true` to disregard or one with the non-null `verifiedCommentedDirective`.
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
 * @returns {{skip: true; importedFileCommentedDirective: undefined; resolvedImportPath: undefined;} | {skip: undefined; importedFileCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS; resolvedImportPath: string;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileCommentedDirective`.
 */
const importedFileFlow = (currentDir, importPath, cwd) => {
  // finds the full path of the import
  const resolvedImportPath = resolveImportPath(currentDir, importPath, cwd);
  console.log({ resolvedImportPath });

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

/* importFlow */

/** The full flow for import traversals to enforce effective directives import rules.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ImportDeclaration} node The ESLint `node` of the rule's current traversal.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileCommentedDirective The current file's commented directive.
 * @returns Returns early if the flow needs to be interrupted.
 */
export const importFlow = (context, node, currentFileCommentedDirective) => {
  // !! A common utility could include the "does not operate" for a superImportFlow shared accross agnostic20 and directive21.
  // does not operate on `import type`
  if (node.importKind === "type") return;

  const result = importedFileFlow(
    path.dirname(context.filename),
    node.source.value,
    context.cwd,
  );

  console.log("Is importing", result.skip);

  if (result.skip) return;
  const { importedFileCommentedDirective } = result;
  console.log({ importedFileCommentedDirective });

  if (
    isImportBlocked(
      currentFileCommentedDirective,
      importedFileCommentedDirective,
    )
  ) {
    context.report({
      node,
      messageId: importBreaksImportRulesMessageId,
      data: {
        // effectiveDirectiveMessage for now
        effectiveDirectiveMessage: makeMessageFromCommentedDirective(
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
