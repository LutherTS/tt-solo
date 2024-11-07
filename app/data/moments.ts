import { Option } from "@/app/types/globals";
import { MomentFormIds, MomentFormVariant } from "@/app/types/moments";

// searchParams keys

export const CONTAINS = "contains" as const;
export const USERMOMENTSPAGE = "userMomentsPage" as const;
export const PASTUSERMOMENTSPAGE = "pastUserMomentsPage" as const;
export const CURRENTUSERMOMENTSPAGE = "currentUserMomentsPage" as const;
export const FUTUREUSERMOMENTSPAGE = "futureUserMomentsPage" as const;
export const VIEW = "view" as const;
export const SUBVIEW = "subView" as const;
export const MOMENTID = "momentId" as const;

// currently unused
export const MOMENTS_SEARCH_PARAMS_KEYS = [
  CONTAINS,
  USERMOMENTSPAGE,
  PASTUSERMOMENTSPAGE,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  VIEW,
  SUBVIEW,
  MOMENTID,
] as const;

// initial and lowest moments page number
export const INITIAL_PAGE = 1;

// TAKE will need to be in here to when I'll work on the success state of CreateOrUpdateMomentState

// global take (limit in SQL) for all four subViews
export const TAKE = 2;

// HTML ids

export const SEARCH_FORM_ID = "search-form";

/* FLASH IDEA
On data files:
If I make a dictionary of ids with keys, the name is in all caps.
If it's an array, the name is in camelCase.
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

const updateMomentFormSuffix = "update-moment-form";
const UPDATE_MOMENT_FORM_IDS = makeMomentFormIds(updateMomentFormSuffix);

const createMomentFormSuffix = "create-moment-form";
const CREATE_MOMENT_FORM_IDS = makeMomentFormIds(createMomentFormSuffix);

export const MOMENT_FORM_IDS: { [K in MomentFormVariant]: MomentFormIds } = {
  updating: UPDATE_MOMENT_FORM_IDS,
  creating: CREATE_MOMENT_FORM_IDS,
};

// select options

export const activityOptions: Option[] = [
  { key: 1, label: "Atelier", value: "Atelier" },
  { key: 2, label: "Comité", value: "Comité" },
  { key: 3, label: "Conférence", value: "Conférence" },
  { key: 4, label: "Entretien individuel", value: "Entretien individuel" },
  { key: 5, label: "Embauche", value: "Embauche" },
  { key: 6, label: "Pomodoro", value: "Pomodoro" },
  { key: 7, label: "Intégration", value: "Intégration" },
  { key: 8, label: "Partage d'informations", value: "Partage d'informations" },
  { key: 9, label: "Présentation", value: "Présentation" },
  { key: 10, label: "Réseautage", value: "Réseautage" },
  { key: 11, label: "Rituel agile", value: "Rituel agile" },
  { key: 12, label: "Résolution de problème", value: "Résolution de problème" },
  { key: 13, label: "Rendez-vous client", value: "Rendez-vous client" },
  { key: 14, label: "Réunion commerciale", value: "Réunion commerciale" },
  { key: 15, label: "Suivi de projet", value: "Suivi de projet" },
  { key: 16, label: "Séminaire", value: "Séminaire" },
];

// form defaults

export const STEP_DURATION_ORIGINAL = "10";

// I've effectively decided not to use STEP_DURATION_DEFAULT of 0
// export const STEP_DURATION_DEFAULT = "0";

// views and subviews

export const views = [
  "update-moment",
  "read-moments",
  "create-moment",
] as const;

export const viewTitles = {
  "update-moment": "Éditez",
  "read-moments": "Vos moments",
  "create-moment": "Créez",
};

export const subViews = [
  "all-moments",
  "past-moments",
  "current-moments",
  "future-moments",
] as const;

export const subViewTitles = {
  "all-moments": "Tous",
  "past-moments": "Passés",
  "current-moments": "Actuels",
  "future-moments": "Futurs",
};

export const subViewPages = {
  "all-moments": USERMOMENTSPAGE,
  "past-moments": PASTUSERMOMENTSPAGE,
  "current-moments": CURRENTUSERMOMENTSPAGE,
  "future-moments": FUTUREUSERMOMENTSPAGE,
};

// default error messages

export const DEFAULT_MOMENT_MESSAGE =
  "Erreurs sur le renseignement moment du formulaire.";
export const DEFAULT_MOMENT_SUBMESSAGE =
  "Veuillez vérifier les champs concernés.";

export const DEFAULT_STEP_MESSAGE =
  "Erreurs sur le renseignement étapes du formulaire.";
export const DEFAULT_STEP_SUBMESSAGE =
  "Veuillez vérifier les champs concernés.";
