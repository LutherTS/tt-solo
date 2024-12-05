// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* PREVENTING CIRCULAR DEPENDENCIES
The should be NO IMPORTS OTHER TYPES in the data file. Any variable, or object or whatever that requires a mix of data and utilities import (as it happened) NEEDS TO MADE ON THE FILE WHERE IT IS USED. (Looking at you, formSectionTopicRemoves.)
...So far so good though...
*/

import { Option } from "@/app/types/agnostic/globals";
import {
  MomentFormIds,
  MomentFormVariant,
  MomentsPageSearchParamsKeyOfPages,
  SubView,
  View,
  // FormSectionTopic,
  // CreateOrUpdateMomentState,
} from "@/app/types/agnostic/moments";
// import {
//   removeMomentMessagesAndErrorsCallback,
//   removeStepsMessagesAndErrorsCallback,
// } from "@/app/utilities/moments";

// searchParams keys

export const momentsPageSearchParamsKeys = {
  CONTAINS: "contains",
  USER_ALL_MOMENTS_PAGE: "userallmomentspage",
  USER_PAST_MOMENTS_PAGE: "userpagemomentspage",
  USER_CURRENT_MOMENTS_PAGE: "usercurrentmomentspage",
  USER_FUTURE_MOMENTS_PAGE: "userfuturemomentspage",
  VIEW: "view",
  SUB_VIEW: "subview",
  MOMENT_KEY: "momentkey",
} as const;

export const MOMENTS_PAGE_SEARCH_PARAMS_KEYS = Object.values(
  momentsPageSearchParamsKeys,
) as ReadonlyArray<
  (typeof momentsPageSearchParamsKeys)[keyof typeof momentsPageSearchParamsKeys]
>;

export const momentsPageSearchParamsKeysOfPages = {
  USER_ALL_MOMENTS_PAGE: momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE,
  USER_PAST_MOMENTS_PAGE: momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE,
  USER_CURRENT_MOMENTS_PAGE:
    momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE,
  USER_FUTURE_MOMENTS_PAGE:
    momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE,
} as const;

export const MOMENTS_PAGE_SEARCH_PARAMS_KEYS_OF_PAGES = Object.values(
  momentsPageSearchParamsKeysOfPages,
) as ReadonlyArray<
  (typeof momentsPageSearchParamsKeysOfPages)[keyof typeof momentsPageSearchParamsKeysOfPages]
>;

// initial and lowest moments page number
export const INITIAL_PAGE = 1;

// global take (limit in SQL) for all four subViews
export const TAKE = 2;

// HTML ids // could eventually all be inside one single object

export const SEARCH_FORM_ID = "search-form";

/* FLASH IDEA
On data files:
If I make a dictionary of ids with keys, the name is in all caps.
If it's an array, the name is in camelCase.
...Actually I am now going for the opposite to emphasis consistency in the order of an array which an object does not require.
*/

const makeMomentFormIds = (suffix: string): MomentFormIds => {
  return {
    momentForm: `moment-form-${suffix}`,
    yourMoment: `your-moment-${suffix}`,
    itsSteps: `its-steps-${suffix}`,
    stepFormCreating: `step-form-creating-${suffix}`,
    stepFormUpdating: `step-form-updating-${suffix}`,
  };
};

export const momentFormIds: { [K in MomentFormVariant]: MomentFormIds } = {
  updating: makeMomentFormIds("update-moment-form"),
  creating: makeMomentFormIds("create-moment-form"),
};

// select options

const ACTIVITY_OPTIONS_STRINGS = [
  "Atelier",
  "Comité",
  "Conférence",
  "Entretien individuel",
  "Embauche",
  "Pomodoro",
  "Intégration",
  "Partage d'informations",
  "Présentation",
  "Réseautage",
  "Rituel agile",
  "Résolution de problème",
  "Rendez-vous client",
  "Réunion commerciale",
  "Suivi de projet",
  "Séminaire",
];

export const ACTIVITY_OPTIONS: Option[] = ACTIVITY_OPTIONS_STRINGS.map((e) => {
  return { key: e, label: e, value: e };
});

// form defaults

export const STEP_DURATION_ORIGINAL = "10";

// views

export const views = {
  UPDATE_MOMENT: "update-moment",
  READ_MOMENTS: "read-moments",
  CREATE_MOMENT: "create-moment",
} as const;

export const VIEWS = Object.values(views) as ReadonlyArray<
  (typeof views)[keyof typeof views]
>;

export const viewsTitles: { [K in View]: string } = {
  [views.UPDATE_MOMENT]: "Éditez",
  [views.READ_MOMENTS]: "Vos moments",
  [views.CREATE_MOMENT]: "Créez",
};

// subViews

export const subViews = {
  ALL_MOMENTS: "all-moments",
  PAST_MOMENTS: "past-moments",
  CURRENT_MOMENTS: "current-moments",
  FUTURE_MOMENTS: "future-moments",
} as const;

export const SUBVIEWS = Object.values(subViews) as ReadonlyArray<
  (typeof subViews)[keyof typeof subViews]
>;

export const subViewsMomentsPageSearchParamsKeys: {
  [K in SubView]: MomentsPageSearchParamsKeyOfPages;
} = {
  [subViews.ALL_MOMENTS]: momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE,
  [subViews.PAST_MOMENTS]: momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE,
  [subViews.CURRENT_MOMENTS]:
    momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE,
  [subViews.FUTURE_MOMENTS]:
    momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE,
};

export const subViewsTitles: { [K in SubView]: string } = {
  [subViews.ALL_MOMENTS]: "Tous",
  [subViews.PAST_MOMENTS]: "Passés",
  [subViews.CURRENT_MOMENTS]: "Actuels",
  [subViews.FUTURE_MOMENTS]: "Futurs",
};

export const subViewsPages = {
  [subViews.ALL_MOMENTS]: momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE,
  [subViews.PAST_MOMENTS]: momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE,
  [subViews.CURRENT_MOMENTS]:
    momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE,
  [subViews.FUTURE_MOMENTS]:
    momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE,
} as const;

// default error messages

const defaultErrorMessages = {
  MESSAGE: "Erreurs sur le renseignement moment du formulaire.",
  SUB_MESSAGE: "Veuillez vérifier les champs concernés.",
};

export const defaultMomentErrorMessages = {
  MESSAGE: defaultErrorMessages.MESSAGE,
  SUB_MESSAGE: defaultErrorMessages.SUB_MESSAGE,
};

export const defaultStepsErrorMessages = {
  MESSAGE: defaultErrorMessages.MESSAGE,
  SUB_MESSAGE: defaultErrorMessages.SUB_MESSAGE,
};

// form section topic removeMessagesAndErrorsCallbacks
// THIS SHOULD HAVE NEVER BEEN HERE SINCE IT'S UNIQUE TO FORMSECTION.
// KEEP THIS HERE NONETHELESS SO THAT I CAN TEST GLOBAL-ERROR IN SOME FORM OF PRODUCTION ENVIRONMENT.

// export const formSectionTopicRemoves: {
//   [K in FormSectionTopic]: (
//     s: CreateOrUpdateMomentState,
//   ) => CreateOrUpdateMomentState;
// } = {
//   moment: removeMomentMessagesAndErrorsCallback,
//   steps: removeStepsMessagesAndErrorsCallback,
// };
