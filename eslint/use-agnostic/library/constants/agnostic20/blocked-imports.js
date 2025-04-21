import {
  USE_SERVER_LOGICS,
  USE_SERVER_COMPONENTS,
  USE_SERVER_FUNCTIONS,
  USE_CLIENT_LOGICS,
  USE_CLIENT_COMPONENTS,
  USE_AGNOSTIC_LOGICS,
  USE_AGNOSTIC_COMPONENTS,
} from "./core/bases.js";

import { makeIntroForSpecificViolationMessage } from "../../../utilities/agnostic20/crossed/make-intro.js";

export const effectiveDirectives_BlockedImports = {
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
};
