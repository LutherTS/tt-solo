import { Option } from "@/app/types/globals";

// searchParams keys

export const CONTAINS = "contains" as const;
export const USERMOMENTSPAGE = "usermomentspage" as const;
export const PASTUSERMOMENTSPAGE = "pastusermomentspage" as const;
export const CURRENTUSERMOMENTSPAGE = "currentusermomentspage" as const;
export const FUTUREUSERMOMENTSPAGE = "futureusermomentspage" as const;

// HTML ids

export const SEARCH_FORM_ID = "search-form";

export const YOUR_MOMENT_ID = "your-moment";
export const ITS_STEPS_ID = "its-steps";

export const STEP_FORM_ID = {
  creating: "step-form-creating",
  updating: "step-form-updating",
};

// barely used for now
export const MOMENT_FORM_ID = "moment-form";

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

export const STEP_DURATION_DEFAULT = "10";

// views and subviews

// currently unused
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
