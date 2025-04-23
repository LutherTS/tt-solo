// directives
export const NO_DIRECTIVE = null;
export const USE_SERVER = "use server";
export const USE_CLIENT = "use client";
export const USE_AGNOSTIC = "use agnostic";

// effective directives
export const USE_SERVER_LOGICS = "use server logics";
export const USE_SERVER_COMPONENTS = "use server components";
export const USE_SERVER_FUNCTIONS = "use server functions";
export const USE_CLIENT_LOGICS = "use client logics";
export const USE_CLIENT_COMPONENTS = "use client components";
export const USE_AGNOSTIC_LOGICS = "use agnostic logics";
export const USE_AGNOSTIC_COMPONENTS = "use agnostic components";

// effective modules
const SERVER_LOGICS_MODULE = "Server Logics Module";
const SERVER_COMPONENTS_MODULE = "Server Components Module";
const SERVER_FUNCTIONS_MODULE = "Server Functions Module";
const CLIENT_LOGICS_MODULE = "Client Logics Module";
const CLIENT_COMPONENTS_MODULE = "Client Components Module";
const AGNOSTIC_LOGICS_MODULE = "Agnostic Logics Module";
const AGNOSTIC_COMPONENTS_MODULE = "Agnostic Components Module";

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

export const ARE_NOT_ALLOWED_TO_IMPORT = "are not allowed to import";

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
  `${effectiveDirectives_EffectiveModules[currentFileEffectiveDirective]}s ${ARE_NOT_ALLOWED_TO_IMPORT} ${effectiveDirectives_EffectiveModules[importedFileEffectiveDirective]}s.`;

export const effectiveDirectives_BlockedImports = Object.freeze({
  [USE_SERVER_LOGICS]: [
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_SERVER_FUNCTIONS)} Server Functions are only to be triggered by Client Components.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
    },
    {
      blockedImport: USE_CLIENT_COMPONENTS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_LOGICS, USE_CLIENT_COMPONENTS)} Client Components cannot be tinkered with on the server.`,
    },
  ],
  [USE_SERVER_COMPONENTS]: [
    {
      blockedImport: USE_SERVER_FUNCTIONS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_SERVER_FUNCTIONS)} Server Components Modules can make their own Server Functions through inline 'use server' directives.`,
    },
    {
      blockedImport: USE_CLIENT_LOGICS,
      message: `${makeIntroForSpecificViolationMessage(USE_SERVER_COMPONENTS, USE_CLIENT_LOGICS)} Client logic should never leak to the server.`,
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
});
