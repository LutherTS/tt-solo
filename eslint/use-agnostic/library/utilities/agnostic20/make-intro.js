import {
  effectiveDirectives_EffectiveModules,
  ARE_NOT_ALLOWED_TO_IMPORT,
} from "../../constants/agnostic20/core/bases.js";

/**
 * Makes the intro for each specific import rule violation messages.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} currentFileEffectiveDirective The current file's effective directive.
 * @param {USE_SERVER_LOGICS | USE_SERVER_COMPONENTS | USE_SERVER_FUNCTIONS | USE_CLIENT_LOGICS | USE_CLIENT_COMPONENTS | USE_AGNOSTIC_LOGICS | USE_AGNOSTIC_COMPONENTS} importedFileEffectiveDirective The imported file's effective directive.
 * @returns {string} Returns "[Current file effective modules] are not allowed to import [imported file effective modules]".
 */
export const makeIntroForSpecificViolationMessage = (
  currentFileEffectiveDirective,
  importedFileEffectiveDirective,
) =>
  `${effectiveDirectives_EffectiveModules[currentFileEffectiveDirective]}s ${ARE_NOT_ALLOWED_TO_IMPORT} ${effectiveDirectives_EffectiveModules[importedFileEffectiveDirective]}s.`;
