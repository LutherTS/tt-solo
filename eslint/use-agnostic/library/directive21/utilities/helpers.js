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
  directivesSet,
  directivesArray,
  commentedDirectives_4RawImplementations,
  commentedStrategies_CommentedDirectives,
  commentedDirectives_BlockedImports,
  commentedDirectives_CommentedModules,
} from "../constants/bases.js";

import {
  getImportedFileFirstLine,
  isImportBlocked as commonsIsImportBlocked,
  makeMessageFromResolvedDirective,
  findSpecificViolationMessage as commonsFindSpecificViolationMessage,
} from "../../_commons/utilities/helpers.js";

/* getCommentedDirectiveFromCurrentModule */

/**
 * Gets the commented directive of the current module.
 *
 * Accepted directives for the default Directive-First Architecture are (single or double quotes included):
 * - `'use server logics'`, `"use server logics"` denoting a Server Logics Module.
 * - `'use client logics'`, `"use client logics"` denoting a Client Logics Module.
 * - `'use agnostic logics'`, `"use agnostic logics"` denoting an Agnostic Logics Module.
 * - `'use server components'`, `"use server components"` denoting a Server Components Module.
 * - `'use client components'`, `"use client components"` denoting a Client Components Module.
 * - `'use agnostic components'`, `"use agnostic components"` denoting an Agnostic Components Module.
 * - `'use agnostic logics'`, `"use agnostic logics"` denoting an Agnostic Logics Module.
 * - `'use server functions'`, `"use server functions"` denoting a Server Functions Module.
 * - `'use client contexts'`, `"use client contexts"` denoting a Client Contexts Module.
 * - `'use agnostic conditions'`, `"use agnostic conditions"` denoting an Agnostic Conditions Module.
 * - `'use agnostic strategies'`, `"use agnostic strategies"` denoting an Agnostic Strategies Module.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context The ESLint rule's `context` object.
 * @returns {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES | null} The commented directive, or lack thereof via `null`. Given the strictness of this architecture, the lack of a directive is considered a mistake. (Though rules may provide the opportunity to declare a default, and configs with preset defaults may be provided.)
 */
export const getCommentedDirectiveFromCurrentModule = (context) => {
  // gets the first comment from the source code
  const firstComment = context.sourceCode.getAllComments()[0];

  // returns null early if there is no first comment
  if (!firstComment) return null;

  // returns null early if the first comment is not on the first line and the first column
  if (firstComment.loc.start.line !== 1 || firstComment.loc.start.column !== 0)
    return null;

  // gets the trimmed raw value of the first comment
  const rawValue = firstComment.value.trim();

  // checks if the raw value is single- or double-quoted (or neither)
  const isSingleQuoted = detectQuoteType(rawValue);

  // return null early if the raw value (trimmed prior) is neither single- nor double-quoted
  if (isSingleQuoted === null) return null;

  // Obtains the value depending on whether the raw value is single- or double-quoted. (Note: The same string is returned if, for some impossible reason, the raw value does not correspond in terms of quote types. It does not matter because the check coming next will always fail to null if that's the case.)
  const value = isSingleQuoted
    ? stripSingleQuotes(rawValue)
    : stripDoubleQuotes(rawValue);

  // certifies the directive or lack thereof from the obtained value
  const commentedDirective = directivesSet.has(value) ? value : null;

  return commentedDirective;
};

/**
 * @param {string} string
 * @returns
 */
const detectQuoteType = (string) => {
  if (string.startsWith("'") && string.endsWith("'")) {
    return true; // single quotes
  } else if (string.startsWith('"') && string.endsWith('"')) {
    return false; // double quotes
  } else {
    return null; // neither
  }
};

/**
 * @param {string} string
 * @returns
 */
const stripSingleQuotes = (string) => {
  if (string.startsWith("'") && string.endsWith("'")) {
    return string.slice(1, -1);
  }
  return string;
};

/**
 * @param {string} string
 * @returns
 */
const stripDoubleQuotes = (string) => {
  if (string.startsWith('"') && string.endsWith('"')) {
    return string.slice(1, -1);
  }
  return string;
};

/* getVerifiedCommentedDirective */

/**
 * Ensures that a module's commented directive is consistent with its file extension (depending on whether it ends with 'x' for JSX).
 * - `'use server logics'`: Server Logics Modules do NOT export JSX.
 * - `'use client logics'`: Client Logics Modules do NOT export JSX.
 * - `'use agnostic logics'`: Agnostic Logics Modules do NOT export JSX.
 * - `'use server components'`: Server Components Modules ONLY export JSX.
 * - `'use client components'`: Client Components Modules ONLY export JSX.
 * - `'use agnostic components'`: Agnostic Components Modules ONLY export JSX.
 * - `'use server functions'`: Server Functions Modules do NOT export JSX.
 * - `'use client contexts'`: Client Contexts Modules ONLY export JSX.
 * - `'use agnostic conditions'`: Agnostic Conditions Modules ONLY export JSX.
 * - `'use agnostic strategies'`: Agnostic Strategies Modules may export JSX.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} directive The commented directive as written on top of the file (cannot be `null` at that stage).
 * @param {TSX | TS | JSX | JS | MJS | CJS} extension The JavaScript (TypeScript) extension of the file.
 * @returns {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES | null} The verified commented directive, from which imports rules are applied. Returns `null` if the verification failed, upon which an error will be reported depending on the commented directive, since the error logic here is strictly binary.
 */
export const getVerifiedCommentedDirective = (directive, extension) => {
  // I could use a map, but because this is in JS with JSDoc, a manual solution is peculiarly more typesafe.
  if (directive === USE_SERVER_LOGICS && !extension.endsWith("x"))
    return directive;
  if (directive === USE_CLIENT_LOGICS && !extension.endsWith("x"))
    return directive;
  if (directive === USE_AGNOSTIC_LOGICS && !extension.endsWith("x"))
    return directive;
  if (directive === USE_SERVER_COMPONENTS && extension.endsWith("x"))
    return directive;
  if (directive === USE_CLIENT_COMPONENTS && extension.endsWith("x"))
    return directive;
  if (directive === USE_AGNOSTIC_COMPONENTS && extension.endsWith("x"))
    return directive;
  if (directive === USE_SERVER_FUNCTIONS && !extension.endsWith("x"))
    return directive;
  if (directive === USE_CLIENT_CONTEXTS && extension.endsWith("x"))
    return directive;
  if (directive === USE_AGNOSTIC_CONDITIONS && extension.endsWith("x"))
    return directive;
  if (directive === USE_AGNOSTIC_STRATEGIES) return directive;

  return null; // verification error
};

/* getCommentedDirectiveFromImportedModule */

/**
 * Gets the commented directive of the imported module.
 *
 * Accepted directives for the default Directive-First Architecture are (single or double quotes included):
 * - `'use server logics'`, `"use server logics"` denoting a Server Logics Module.
 * - `'use client logics'`, `"use client logics"` denoting a Client Logics Module.
 * - `'use agnostic logics'`, `"use agnostic logics"` denoting an Agnostic Logics Module.
 * - `'use server components'`, `"use server components"` denoting a Server Components Module.
 * - `'use client components'`, `"use client components"` denoting a Client Components Module.
 * - `'use agnostic components'`, `"use agnostic components"` denoting an Agnostic Components Module.
 * - `'use agnostic logics'`, `"use agnostic logics"` denoting an Agnostic Logics Module.
 * - `'use server functions'`, `"use server functions"` denoting a Server Functions Module.
 * - `'use client contexts'`, `"use client contexts"` denoting a Client Contexts Module.
 * - `'use agnostic conditions'`, `"use agnostic conditions"` denoting an Agnostic Conditions Module.
 * - `'use agnostic strategies'`, `"use agnostic strategies"` denoting an Agnostic Strategies Module.
 * @param {string} resolvedImportPath The resolved path of the import.
 * @returns {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES | null} The commented directive, or lack thereof via `null`. Given the strictness of this architecture, the lack of a directive is considered a mistake. (Though rules may provide the opportunity to declare a default, and configs with preset defaults may be provided.)
 */
export const getCommentedDirectiveFromImportedModule = (resolvedImportPath) => {
  // gets the first line of the code of the import
  const importedFileFirstLine = getImportedFileFirstLine(resolvedImportPath);
  // console.log({ importedFileFirstLine });

  // sees if the first line includes any of the directives and finds the directive that it includes
  let includedDirective = "";
  const lengthOne = directivesArray.length;
  for (let i = 0; i < lengthOne; i++) {
    const directive = directivesArray[i];
    // console.log({ directive });
    if (importedFileFirstLine.includes(directive)) {
      includedDirective = directive;
      // console.log({ includedDirective });
      break;
    }
  }

  // returns null early if there is none of the directives in the first line
  if (includedDirective === "") return null;

  let importFileDirective = "";
  const lengthTwo =
    // sucks for that any but, I'm working in JS here
    commentedDirectives_4RawImplementations[includedDirective].length;
  for (let i = 0; i < lengthTwo; i++) {
    const raw = commentedDirectives_4RawImplementations[includedDirective][i];
    // console.log({ raw });
    if (raw === importedFileFirstLine) {
      importFileDirective = includedDirective;
      // console.log({ importFileDirective });
      break;
    }
  }

  // returns null early if despite the presence of the directive it is not properly implemented
  if (importFileDirective === "") return null;

  return importFileDirective;
};

/* getStrategizedDirective */

/**
 * Gets the interpreted directive from a specified commented Strategy (such as `@serverLogics`) nested inside the import declaration for an import from an Agnostic Strategies Module.
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context The ESLint rule's `context` object.
 * @param {import('@typescript-eslint/types').TSESTree.ImportDeclaration} node The ESLint `node` of the rule's current traversal.
 * @returns {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | null} Returns the interpreted directive, a.k.a. strategized directive, or lack thereof via `null`.
 */
export const getStrategizedDirective = (context, node) => {
  const firstNestedComment = context.sourceCode.getCommentsInside(node)[0];

  // returns null early if there is no nested comments
  if (!firstNestedComment) return null;

  const strategy = firstNestedComment.value.trim() || null;

  return commentedStrategies_CommentedDirectives[strategy] || null;
};

/* isImportBlocked */

/**
 * Returns a boolean deciding if an imported file's commented directive is incompatible with the current file's commented directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileCommentedDirective The current file's commented directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} importedFileCommentedDirective The imported file's commented directive.
 * @returns {boolean} Returns `true` if the import is blocked, as established in `commentedDirectives_BlockedImports`.
 */
export const isImportBlocked = (
  currentFileCommentedDirective,
  importedFileCommentedDirective,
) =>
  commonsIsImportBlocked(
    commentedDirectives_BlockedImports,
    currentFileCommentedDirective,
    importedFileCommentedDirective,
  );

/* makeMessageFromCommentedDirective */

/**
 * Lists in an message the commented modules incompatible with a commented module based on its commented directive.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} commentedDirective The commented directive of the commented module.
 * @returns {string} The message listing the incompatible commented modules.
 */
export const makeMessageFromCommentedDirective = (commentedDirective) =>
  makeMessageFromResolvedDirective(
    commentedDirectives_CommentedModules,
    commentedDirectives_BlockedImports,
    commentedDirective,
  );

/* findSpecificViolationMessage */

/**
 * Finds the `message` for the specific violation of commented directives import rules based on `commentedDirectives_BlockedImports`.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} currentFileCommentedDirective The current file's commented directive.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS} importedFileCommentedDirective The imported file's commented directive.
 * @returns {string} The corresponding `message`.
 */
export const findSpecificViolationMessage = (
  currentFileCommentedDirective,
  importedFileCommentedDirective,
) =>
  commonsFindSpecificViolationMessage(
    commentedDirectives_BlockedImports,
    currentFileCommentedDirective,
    importedFileCommentedDirective,
  );
