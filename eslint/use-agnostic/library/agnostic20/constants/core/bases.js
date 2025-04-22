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
export const effectiveDirectives_EffectiveModules = {
  [USE_SERVER_LOGICS]: SERVER_LOGICS_MODULE,
  [USE_SERVER_COMPONENTS]: SERVER_COMPONENTS_MODULE,
  [USE_SERVER_FUNCTIONS]: SERVER_FUNCTIONS_MODULE,
  [USE_CLIENT_LOGICS]: CLIENT_LOGICS_MODULE,
  [USE_CLIENT_COMPONENTS]: CLIENT_COMPONENTS_MODULE,
  [USE_AGNOSTIC_LOGICS]: AGNOSTIC_LOGICS_MODULE,
  [USE_AGNOSTIC_COMPONENTS]: AGNOSTIC_COMPONENTS_MODULE,
};

// messageIds
export const useServerJSXMessageId = "use-server-has-jsx-extension";
export const importBreaksImportRulesMessageId =
  "import-breaks-effective-directive-import-rule";
export const reExportNotSameMessageId = "re-export-not-same-directive";

/* from the getDirectiveFromCurrentModule utility */

export const directivesSet = new Set([USE_SERVER, USE_CLIENT, USE_AGNOSTIC]);

/* from the resolveImportPath utility */

export const TSX = ".tsx";
export const TS = ".ts";
export const JSX = ".jsx";
export const JS = ".js";
export const MJS = ".mjs";
export const CJS = ".cjs";

export const EXTENSIONS = [TSX, TS, JSX, JS, MJS, CJS]; // In priority order

/* from the getDirectiveFromImportedModule utility */

export const directivesArray = Array.from(directivesSet);

/* from the isImportBlocked utility */

export const ARE_NOT_ALLOWED_TO_IMPORT = "are not allowed to import";
