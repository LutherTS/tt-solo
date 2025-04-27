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
} from "../constants/bases.js";

import { resolveImportPath } from "../../_commons/utilities/helpers.js";
import {
  getCommentedDirectiveFromCurrentModule,
  getVerifiedCommentedDirective,
  getCommentedDirectiveFromImportedModule,
} from "./helpers.js";

/* currentFileFlow */

/**
 *
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context The ESLint rule's `context` object.
 * @returns {{skip: true; verifiedCommentedDirective: undefined;} | {skip: undefined; verifiedCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS;}}
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

/* coreflow */

/**
 * The core flow that is shared between import and re-export traversals to obtain the import file's commented directive.
 * @param {string} currentDir Directory of the file containing the import (from `path.dirname(context.filename)`).
 * @param {string} importPath The import specifier (e.g., `@/components/Button` or `./utils`).
 * @param {string} cwd Project root (from `context.cwd`). Caveat: only as an assumption currently.
 * @returns {{skip: true; importedFileCommentedDirective: undefined; resolvedImportPath: undefined;} | {skip: undefined; importedFileCommentedDirective: USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS; resolvedImportPath: string;}} Returns either an object with `skip: true` to disregard or one with the non-null `importedFileCommentedDirective`.
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
  let importedFileCommentedDirective =
    getCommentedDirectiveFromImportedModule(resolvedImportPath);
  console.log({
    getCommentedDirectiveFromImportedModule: importedFileCommentedDirective,
  });

  // returns null early if there is no directive or no valid directive (same, but eventually no directive could have defaults)
  if (!importedFileCommentedDirective) return { skip: true };

  /* GETTING THE CORRECT DIRECTIVE INTERPRETATION OF STRATEGY FOR AGNOSTIC STRATEGIES MODULES IMPORTS. 
  (The Directive-First Architecture does not check whether the export and import Strategies are the same at this time, meaning a @clientLogics strategy could be wrongly imported and interpreted as a @serverLogics strategy. However, Strategy exports are plan to be linting in the future within their own Agnostic Strategies Modules to ensure that respect import rules within their own scopes. It may also become possible to check whether the export and import Strategies are the same in the future when identifier as the defined and the same.) */
  if (importedFileCommentedDirective === USE_AGNOSTIC_STRATEGIES) {
    importedFileCommentedDirective = getStrategizedDirective(context, node);
    console.log({ getStrategizedDirective: importedFileCommentedDirective });
  }

  // returns null again this time if there is no Strategy or no valid Strategy from an Agnostic Strategies Module import, since they can only be imported via Strategies
  if (!importedFileCommentedDirective) return { skip: true };

  console.log({
    importedFileCommentedDirective,
  });

  return {
    importedFileCommentedDirective,
    resolvedImportPath, // bonus
  };
};
