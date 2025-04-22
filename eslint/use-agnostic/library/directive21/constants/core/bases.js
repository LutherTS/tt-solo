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

/* from getCommentedDirectiveFromCurrentModule utility */

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
