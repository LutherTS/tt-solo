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
} from "../../constants/core/bases.js";

/* getCommentedDirectiveFromCurrentModule */

/**
 * Gets the commented directive of the current module.
 *
 * Accepted directives for the default Directive-First Architecture are (single- or double-quote included):
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
 * @param {Readonly<import('@typescript-eslint/utils').TSESLint.RuleContext<string, []>>} context
 * @returns {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES | null} The commented directive, or lack thereof via `null`. Given the strictness of this architecture, the lack of a directive is considered a mistake.
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
 *
 * @param {string} str
 * @returns
 */
const detectQuoteType = (str) => {
  if (str.startsWith("'") && str.endsWith("'")) {
    return true; // single quotes
  } else if (str.startsWith('"') && str.endsWith('"')) {
    return false; // double quotes
  } else {
    return null; // neither
  }
};

/**
 *
 * @param {string} str
 * @returns
 */
const stripSingleQuotes = (str) => {
  if (str.startsWith("'") && str.endsWith("'")) {
    return str.slice(1, -1);
  }
  return str;
};

/**
 * @param {string} str
 * @returns
 */
const stripDoubleQuotes = (str) => {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str.slice(1, -1);
  }
  return str;
};

/* to be continued */
