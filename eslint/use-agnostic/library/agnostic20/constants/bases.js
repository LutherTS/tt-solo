import {
  USE_SERVER_LOGICS as COMMONS_USE_SERVER_LOGICS,
  USE_SERVER_COMPONENTS as COMMONS_USE_SERVER_COMPONENTS,
  USE_SERVER_FUNCTIONS as COMMONS_USE_SERVER_FUNCTIONS,
  USE_CLIENT_LOGICS as COMMONS_USE_CLIENT_LOGICS,
  USE_CLIENT_COMPONENTS as COMMONS_USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_LOGICS as COMMONS_USE_AGNOSTIC_LOGICS,
  USE_AGNOSTIC_COMPONENTS as COMMONS_USE_AGNOSTIC_COMPONENTS,
  SERVER_LOGICS_MODULE as COMMONS_SERVER_LOGICS_MODULE,
  SERVER_COMPONENTS_MODULE as COMMONS_SERVER_COMPONENTS_MODULE,
  SERVER_FUNCTIONS_MODULE as COMMONS_SERVER_FUNCTIONS_MODULE,
  CLIENT_LOGICS_MODULE as COMMONS_CLIENT_LOGICS_MODULE,
  CLIENT_COMPONENTS_MODULE as COMMONS_CLIENT_COMPONENTS_MODULE,
  AGNOSTIC_LOGICS_MODULE as COMMONS_AGNOSTIC_LOGICS_MODULE,
  AGNOSTIC_COMPONENTS_MODULE as COMMONS_AGNOSTIC_COMPONENTS_MODULE,
} from "../../_commons/constants/bases.js";

import { makeIntroForSpecificViolationMessage as commonsMakeIntroForSpecificViolationMessage } from "../../_commons/utilities/helpers.js";

// directives
export const NO_DIRECTIVE = null;
export const USE_SERVER = "use server";
export const USE_CLIENT = "use client";
export const USE_AGNOSTIC = "use agnostic";

// effective directives
export const USE_SERVER_LOGICS = COMMONS_USE_SERVER_LOGICS;
export const USE_SERVER_COMPONENTS = COMMONS_USE_SERVER_COMPONENTS;
export const USE_SERVER_FUNCTIONS = COMMONS_USE_SERVER_FUNCTIONS;
export const USE_CLIENT_LOGICS = COMMONS_USE_CLIENT_LOGICS;
export const USE_CLIENT_COMPONENTS = COMMONS_USE_CLIENT_COMPONENTS;
export const USE_AGNOSTIC_LOGICS = COMMONS_USE_AGNOSTIC_LOGICS;
export const USE_AGNOSTIC_COMPONENTS = COMMONS_USE_AGNOSTIC_COMPONENTS;

// effective modules
const SERVER_LOGICS_MODULE = COMMONS_SERVER_LOGICS_MODULE;
const SERVER_COMPONENTS_MODULE = COMMONS_SERVER_COMPONENTS_MODULE;
const SERVER_FUNCTIONS_MODULE = COMMONS_SERVER_FUNCTIONS_MODULE;
const CLIENT_LOGICS_MODULE = COMMONS_CLIENT_LOGICS_MODULE;
const CLIENT_COMPONENTS_MODULE = COMMONS_CLIENT_COMPONENTS_MODULE;
const AGNOSTIC_LOGICS_MODULE = COMMONS_AGNOSTIC_LOGICS_MODULE;
const AGNOSTIC_COMPONENTS_MODULE = COMMONS_AGNOSTIC_COMPONENTS_MODULE;

// mapping effective directives with effective modules
export const effectiveDirectives_EffectiveModules = Object.freeze({
  [USE_SERVER_LOGICS]: SERVER_LOGICS_MODULE,
  [USE_SERVER_COMPONENTS]: SERVER_COMPONENTS_MODULE,
  [USE_SERVER_FUNCTIONS]: SERVER_FUNCTIONS_MODULE,
  [USE_CLIENT_LOGICS]: CLIENT_LOGICS_MODULE,
  [USE_CLIENT_COMPONENTS]: CLIENT_COMPONENTS_MODULE,
  [USE_AGNOSTIC_LOGICS]: AGNOSTIC_LOGICS_MODULE,
  [USE_AGNOSTIC_COMPONENTS]: AGNOSTIC_COMPONENTS_MODULE,
});

// messageIds
export const useServerJSXMessageId = "use-server-has-jsx-extension";
export const importBreaksImportRulesMessageId =
  "import-breaks-effective-directive-import-rule";
export const reExportNotSameMessageId = "re-export-not-same-directive";

/* from the getDirectiveFromCurrentModule utility */

export const directivesSet = new Set([USE_SERVER, USE_CLIENT, USE_AGNOSTIC]);

/* from the getDirectiveFromImportedModule utility */

export const directivesArray = Array.from(directivesSet);

/* from the isImportBlocked utility */

/* effectiveDirectives_BlockedImports */

/**
 * Makes the intro for each specific import rule violation messages.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} importedFileEffectiveDirective The imported file's effective directive.
 * @returns {string} Returns "[Current file effective modules] are not allowed to import [imported file effective modules]".
 */
const makeIntroForSpecificViolationMessage = (
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  commonsMakeIntroForSpecificViolationMessage(
    effectiveDirectives_EffectiveModules,
    currentFileEffectiveDirective,
    importedFileEffectiveDirective,
  );

export const effectiveDirectives_BlockedImports = Object.freeze({
  [USE_SERVER_LOGICS]: [
    // USE_SERVER_LOGICS allowed, because Server Logics can compose between one another.
    // USE_SERVER_COMPONENTS allowed, because Server Components are OK to be composed with Server Logics as long as the Server Logics Module, by convention, does not export React components.
    // USE_SERVER_FUNCTIONS allowed, because as Server Functions can import one another, it is only natural that they could compose through Server Logics.
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_COMPONENTS)} Client Components cannot be tinkered with on the server.`,
    },
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logic can run safely on the server just like it can on the client
    // USE_AGNOSTIC_COMPONENTS allowed, because Agnostic Components can be composed with Logics on the server just like they can on the client, again, as long at the Server Logics Module, by convention, does not export React components.
  ],
  [USE_SERVER_COMPONENTS]: [
    // USE_SERVER_LOGICS allowed, because logic from the server can safely support Server Components.
    // USE_SERVER_COMPONENTS allowed, because Server Components can composed with one another, assuming thanks to the inclusion of the 'use agnostic' directive that they are actual Server Components.
    // USE_SERVER_FUNCTIONS allowed, because as Server Components Modules can import Client Components, they are able to pass them Server Functions as props as well, even though indeed Server Components Modules can make their own Server Functions through inline 'use server' directives.
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    // USE_CLIENT_COMPONENTS allowed, because Client Components can be nested inside Server Components either to wrap some of the tree with client state accessible through child Client Components, or to create client boundaries when the root of the application is planted on the server.
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logic can run safely on the server just like it can on the client.
    // USE_AGNOSTIC_COMPONENTS allowed, because Agnostic Components can render safely on the server just like they can on the client.
  ],
  [USE_SERVER_FUNCTIONS]: [
    // USE_SERVER_LOGICS allowed, because logic from the server can safely support Server Functions.
    {
      blockedImport: USE_SERVER_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_SERVER_COMPONENTS)} Server Functions have no business working with React Components.`,
    },
    // USE_SERVER_FUNCTIONS allowed, because even though Server Functions don't need to import one another and the same results can be generated via Server Logic alone for the outcome of a single Server Function, a rational use case could be found for composing Server Functions with one another either today or in the future.
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_FUNCTIONS, USE_CLIENT_COMPONENTS)} Server Functions have no business working with React Components.`,
    },
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logic can run safely on the server just like it can on the client
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
    // USE_CLIENT_LOGICS allowed, because Client Logics can compose between one another.
    // USE_CLIENT_COMPONENTS allowed, because Client Components are OK to be composed with Client Logics as long as the Client Logics Module, by convention, does not export React components.
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logic can run safely on the client just like it can on the server
    // USE_AGNOSTIC_COMPONENTS allowed, because Agnostic Components can be composed with Logics on the client just like they can on the server, again, as long at the Client Logics Module, by convention, does not export React components.
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
    // USE_SERVER_FUNCTIONS allowed, because Server Functions are specifically triggered by Client Components.
    // USE_CLIENT_LOGICS allowed, because logic from the client can safely support Client Components.
    // USE_CLIENT_COMPONENTS allowed, because Client Components can composed with one another.
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logic can run safely on the client just like it can on the server.
    // USE_AGNOSTIC_COMPONENTS allowed, because Agnostic Components can render safely on the client just like they can on the server.
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
    // USE_AGNOSTIC_LOGICS allowed, because Agnostic Logics can compose between one another.
    // USE_AGNOSTIC_COMPONENTS allowed, because Agnostic Components can be composed with Logics agnostically as long as at the Agnositc Logics Module, by convention, does not export React components.
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
    // USE_SERVER_FUNCTIONS allowed, because as Agnostic Components Modules can import Client Components, they are able to pass them Server Functions as props as well.
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_AGNOSTIC_COMPONENTS, USE_CLIENT_LOGICS)} Client Logic cannot run in both the server and the client.`,
    },
    // USE_CLIENT_COMPONENTS allowed, because Client Components can be nested inside Agnostic Components either to wrap some of the tree with client state accessible through child Client Components, or to create client boundaries when the root of the application is planted on the server.
    // USE_AGNOSTIC_LOGICS allowed, because environment-agnostic logic can safely support Agnostic Components.
    // USE_CLIENT_COMPONENTS allowed, because Client Components can composed with one another.
  ],
});
