// commented directives
export const USE_SERVER_LOGICS = "use server logics";
export const USE_CLIENT_LOGICS = "use client logics";
export const USE_AGNOSTIC_LOGICS = "use agnostic logics";
export const USE_SERVER_COMPONENTS = "use server components";
export const USE_CLIENT_COMPONENTS = "use client components";
export const USE_AGNOSTIC_COMPONENTS = "use agnostic components";
export const USE_SERVER_FUNCTIONS = "use server functions";
export const USE_CLIENT_CONTEXTS = "use client contexts";
export const USE_AGNOSTIC_CONDITIONS = "use agnostic conditions";
export const USE_AGNOSTIC_STRATEGIES = "use agnostic strategies";

/* from the getCommentedDirectiveFromCurrentModule utility */

export const directivesSet = new Set([
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
]);

/* from the getCommentedDirectiveFromImportedModule utility */

export const directivesArray = Array.from(directivesSet);

// make all four accepted commented directive implementations
const makeRawCommentedDirectiveV1of4 = (directive) => `// '${directive}'`;
const makeRawCommentedDirectiveV2of4 = (directive) => `// "${directive}"`;
const makeRawCommentedDirectiveV3of4 = (directive) => `/* '${directive}' */`;
const makeRawCommentedDirectiveV4of4 = (directive) => `/* "${directive}" */`;

/**
 * Makes the array of all four accepted commented directive implementations on a directive basis.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} directive
 * @returns
 */
const make4RawImplementations = (directive) => [
  makeRawCommentedDirectiveV1of4(directive),
  makeRawCommentedDirectiveV2of4(directive),
  makeRawCommentedDirectiveV3of4(directive),
  makeRawCommentedDirectiveV4of4(directive),
];

// mapped commented directives to their 4 raw implementations
export const commentedDirectives_4RawImplementations = Object.freeze({
  [USE_SERVER_LOGICS]: make4RawImplementations(USE_SERVER_LOGICS),
  [USE_CLIENT_LOGICS]: make4RawImplementations(USE_CLIENT_LOGICS),
  [USE_AGNOSTIC_LOGICS]: make4RawImplementations(USE_AGNOSTIC_LOGICS),
  [USE_SERVER_COMPONENTS]: make4RawImplementations(USE_SERVER_COMPONENTS),
  [USE_CLIENT_COMPONENTS]: make4RawImplementations(USE_CLIENT_COMPONENTS),
  [USE_AGNOSTIC_COMPONENTS]: make4RawImplementations(USE_AGNOSTIC_COMPONENTS),
  [USE_SERVER_FUNCTIONS]: make4RawImplementations(USE_SERVER_FUNCTIONS),
  [USE_CLIENT_CONTEXTS]: make4RawImplementations(USE_CLIENT_CONTEXTS),
  [USE_AGNOSTIC_CONDITIONS]: make4RawImplementations(USE_AGNOSTIC_CONDITIONS),
  [USE_AGNOSTIC_STRATEGIES]: make4RawImplementations(USE_AGNOSTIC_STRATEGIES),
});

/* OR (but it loses typings in JavaScript):
export const commentedDirectives_4RawImplementations = Object.fromEntries(
  directivesArray.map((key) => [key, make4RawImplementations(key)]),
);
 */

// commented strategies
export const AT_SERVER_LOGICS = "@serverLogics";
export const AT_CLIENT_LOGICS = "@clientLogics";
export const AT_AGNOSTIC_LOGICS = "@agnosticLogics";
export const AT_SERVER_COMPONENTS = "@serverComponents";
export const AT_CLIENT_COMPONENTS = "@clientComponents";
export const AT_AGNOSTIC_COMPONENTS = "@agnosticComponents";
export const AT_SERVER_FUNCTIONS = "@serverFunctions";
export const AT_CLIENT_CONTEXTS = "@clientContexts";
export const AT_AGNOSTIC_CONDITIONS = "@agnosticConditions";

// mapped commented strategies to their commented directives
export const commentedStrategies_CommentedDirectives = Object.freeze({
  [AT_SERVER_LOGICS]: USE_SERVER_LOGICS,
  [AT_CLIENT_LOGICS]: USE_CLIENT_LOGICS,
  [AT_AGNOSTIC_LOGICS]: USE_AGNOSTIC_LOGICS,
  [AT_SERVER_COMPONENTS]: USE_SERVER_COMPONENTS,
  [AT_CLIENT_COMPONENTS]: USE_CLIENT_COMPONENTS,
  [AT_AGNOSTIC_COMPONENTS]: USE_AGNOSTIC_COMPONENTS,
  [AT_SERVER_FUNCTIONS]: USE_SERVER_FUNCTIONS,
  [AT_CLIENT_CONTEXTS]: USE_CLIENT_CONTEXTS,
  [AT_AGNOSTIC_CONDITIONS]: USE_AGNOSTIC_CONDITIONS,
});
