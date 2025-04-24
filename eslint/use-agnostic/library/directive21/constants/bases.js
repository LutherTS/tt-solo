import {
  USE_SERVER_LOGICS as COMMONS_USE_SERVER_LOGICS,
  USE_CLIENT_LOGICS as COMMONS_USE_CLIENT_LOGICS,
  USE_AGNOSTIC_LOGICS as COMMONS_USE_AGNOSTIC_LOGICS,
  USE_SERVER_COMPONENTS as COMMONS_USE_SERVER_COMPONENTS,
  USE_CLIENT_COMPONENTS as COMMONS_USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_COMPONENTS as COMMONS_USE_AGNOSTIC_COMPONENTS,
  USE_SERVER_FUNCTIONS as COMMONS_USE_SERVER_FUNCTIONS,
  USE_CLIENT_CONTEXTS as COMMONS_USE_CLIENT_CONTEXTS,
  USE_AGNOSTIC_CONDITIONS as COMMONS_USE_AGNOSTIC_CONDITIONS,
  USE_AGNOSTIC_STRATEGIES as COMMONS_USE_AGNOSTIC_STRATEGIES,
  SERVER_LOGICS_MODULE as COMMONS_SERVER_LOGICS_MODULE,
  CLIENT_LOGICS_MODULE as COMMONS_CLIENT_LOGICS_MODULE,
  AGNOSTIC_LOGICS_MODULE as COMMONS_AGNOSTIC_LOGICS_MODULE,
  SERVER_COMPONENTS_MODULE as COMMONS_SERVER_COMPONENTS_MODULE,
  CLIENT_COMPONENTS_MODULE as COMMONS_CLIENT_COMPONENTS_MODULE,
  AGNOSTIC_COMPONENTS_MODULE as COMMONS_AGNOSTIC_COMPONENTS_MODULE,
  SERVER_FUNCTIONS_MODULE as COMMONS_SERVER_FUNCTIONS_MODULE,
  CLIENT_CONTEXTS_MODULE as COMMONS_CLIENT_CONTEXTS_MODULE,
  AGNOSTIC_CONDITIONS_MODULE as COMMONS_AGNOSTIC_CONDITIONS_MODULE,
  AGNOSTIC_STRATEGIES_MODULE as COMMONS_AGNOSTIC_STRATEGIES_MODULE,
} from "../../_commons/constants/bases.js";

import { makeIntroForSpecificViolationMessage as commonsMakeIntroForSpecificViolationMessage } from "../../_commons/utilities/helpers.js";

// commented directives
export const USE_SERVER_LOGICS = COMMONS_USE_SERVER_LOGICS;
export const USE_CLIENT_LOGICS = COMMONS_USE_CLIENT_LOGICS;
export const USE_AGNOSTIC_LOGICS = COMMONS_USE_AGNOSTIC_LOGICS;
export const USE_SERVER_COMPONENTS = COMMONS_USE_SERVER_COMPONENTS;
export const USE_CLIENT_COMPONENTS = COMMONS_USE_CLIENT_COMPONENTS;
export const USE_AGNOSTIC_COMPONENTS = COMMONS_USE_AGNOSTIC_COMPONENTS;
export const USE_SERVER_FUNCTIONS = COMMONS_USE_SERVER_FUNCTIONS;
export const USE_CLIENT_CONTEXTS = COMMONS_USE_CLIENT_CONTEXTS;
export const USE_AGNOSTIC_CONDITIONS = COMMONS_USE_AGNOSTIC_CONDITIONS;
export const USE_AGNOSTIC_STRATEGIES = COMMONS_USE_AGNOSTIC_STRATEGIES;

// commented modules
const SERVER_LOGICS_MODULE = COMMONS_SERVER_LOGICS_MODULE;
const CLIENT_LOGICS_MODULE = COMMONS_CLIENT_LOGICS_MODULE;
const AGNOSTIC_LOGICS_MODULE = COMMONS_AGNOSTIC_LOGICS_MODULE;
const SERVER_COMPONENTS_MODULE = COMMONS_SERVER_COMPONENTS_MODULE;
const CLIENT_COMPONENTS_MODULE = COMMONS_CLIENT_COMPONENTS_MODULE;
const AGNOSTIC_COMPONENTS_MODULE = COMMONS_AGNOSTIC_COMPONENTS_MODULE;
const SERVER_FUNCTIONS_MODULE = COMMONS_SERVER_FUNCTIONS_MODULE;
const CLIENT_CONTEXTS_MODULE = COMMONS_CLIENT_CONTEXTS_MODULE;
const AGNOSTIC_CONDITIONS_MODULE = COMMONS_AGNOSTIC_CONDITIONS_MODULE;
const AGNOSTIC_STRATEGIES_MODULE = COMMONS_AGNOSTIC_STRATEGIES_MODULE;

// mapping commented directives with commented modules
export const commentedDirectives_CommentedModules = Object.freeze({
  [USE_SERVER_LOGICS]: SERVER_LOGICS_MODULE,
  [USE_CLIENT_LOGICS]: CLIENT_LOGICS_MODULE,
  [USE_AGNOSTIC_LOGICS]: AGNOSTIC_LOGICS_MODULE,
  [USE_SERVER_COMPONENTS]: SERVER_COMPONENTS_MODULE,
  [USE_CLIENT_COMPONENTS]: CLIENT_COMPONENTS_MODULE,
  [USE_AGNOSTIC_COMPONENTS]: AGNOSTIC_COMPONENTS_MODULE,
  [USE_SERVER_FUNCTIONS]: SERVER_FUNCTIONS_MODULE,
  [USE_CLIENT_CONTEXTS]: CLIENT_CONTEXTS_MODULE,
  [USE_AGNOSTIC_CONDITIONS]: AGNOSTIC_CONDITIONS_MODULE,
  [USE_AGNOSTIC_STRATEGIES]: AGNOSTIC_STRATEGIES_MODULE,
});

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

/* commentedDirectives_4RawImplementations */

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

/* from the isImportBlocked utility */

/**
 * Makes the intro for each specific import rule violation messages.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS | USE_AGNOSTIC_STRATEGIES} currentFileCommentedDirective The current file's commented directive.
 * @param {USE_SERVER_LOGICS | USE_CLIENT_LOGICS | USE_AGNOSTIC_LOGICS | USE_SERVER_COMPONENTS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_CONTEXTS | USE_AGNOSTIC_CONDITIONS} importedFileCommentedDirective The imported file's commented directive.
 * @returns {string} Returns "[Current file commented modules] are not allowed to import [imported file commented modules]".
 */
const makeIntroForSpecificViolationMessage = (
  currentFileCommentedDirective,
  importedFileCommentedDirective,
) =>
  commonsMakeIntroForSpecificViolationMessage(
    commentedStrategies_CommentedDirectives,
    currentFileCommentedDirective,
    importedFileCommentedDirective,
  );

export const commentedDirectives_BlockedImports = Object.freeze({
  [USE_SERVER_LOGICS]: [
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_LOGICS)}`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_COMPONENTS)}`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_SERVER_FUNCTIONS)}`,
    },
    {
      blockedImport: USE_CLIENT_CONTEXTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_CONTEXTS)}`,
    },
  ],
  [USE_CLIENT_LOGICS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_LOGICS)}`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_COMPONENTS)}`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_CLIENT_LOGICS, USE_SERVER_FUNCTIONS)}`,
    },
  ],
  [USE_AGNOSTIC_LOGICS]: [
    {
      blockedImport: USE_SERVER_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_LOGICS)}`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_CLIENT_LOGICS)}`,
    },
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_COMPONENTS)}`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_CLIENT_COMPONENTS)}`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_SERVER_FUNCTIONS)}`,
    },
    {
      blockedImport: USE_CLIENT_CONTEXTS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_LOGICS, USE_CLIENT_CONTEXTS)}`,
    },
  ],
  [USE_SERVER_COMPONENTS]: [
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_SERVER_FUNCTIONS)} Server Components Modules can make their own Server Functions through inline 'use server' directives.`,
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
  [USE_CLIENT_CONTEXTS]: [
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
  [USE_AGNOSTIC_CONDITIONS]: [
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
  [USE_AGNOSTIC_STRATEGIES]: [],
});
