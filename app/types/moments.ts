import { Prisma } from "@prisma/client";

import { selectMomentId } from "../reads/subreads/moments";

export type StepFromCRUD = {
  id: string;
  intitule: string;
  details: string;
  duree: string;
};

export type StepToCRUD = {
  id: string;
  orderId: number;
  title: string;
  details: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
};

export type MomentToCRUD = {
  id: string;
  activity: string;
  objective: string;
  isIndispensable: boolean;
  context: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
  steps: StepToCRUD[];
  destinationIdeal: string;
};

export type MomentsDestinationToCRUD = {
  destinationIdeal: string;
  moments: MomentToCRUD[];
};

export type MomentsDateToCRUD = {
  date: string;
  destinations: MomentsDestinationToCRUD[];
  momentsTotal: number;
  momentFirstIndex: number;
  momentLastIndex: number;
  allMomentsTotal: number;
  currentPage: number;
  totalPage: number;
};

export type UserMomentsToCRUD = {
  dates: MomentsDateToCRUD[];
};

export type View = "update-moment" | "create-moment" | "read-moments";

export type SubView =
  | "all-moments"
  | "past-moments"
  | "current-moments"
  | "future-moments";

export type StepVisible = "create" | "creating" | "updating";

type DefaultFormVariant = "creating" | "updating";

export type MomentFormVariant = DefaultFormVariant;

export type StepFormVariant = DefaultFormVariant;

// Now the action types will also be kept here, to be manually shared wherever the actions are to be used.
export type CreateOrUpdateMoment = (
  variant: MomentFormVariant,
  indispensable: boolean,
  momentDate: string,
  steps: StepFromCRUD[],
  destination: string,
  activite: string,
  objectif: string,
  contexte: string,
  momentFromCRUD: MomentToCRUD | undefined,
  // formData: FormData,
) => Promise<CreateOrUpdateMomentState>;

export type TrueCreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<TrueCreateOrUpdateMomentState>;

// The type of the return of createOrUpdateMoment as it is being shared between the server and the client.
// It is then reused between createOrUpdateMoment on the server and the type CreateOrUpdateMoment made on the client.
// Then, MANUALLY I do insist, I need to make sure that the arguments on createOrUpdateMoment and CreateOrUpdateMoment are exactly the same. (In fact, they're meant to be directly copypastable between one another.)
// This type allows to manually define beforehand exactly what the return should be between the server and the client so that whoever works with the action knows exactly they could output.
// For example, changing null to void, I went back to createOrUpdateMoment and removed the last return, then went the useState of createOrUpdateMomentState, and initiated it with literally no argument.
// Then if for some reason I learn that it is imperative that a null should be returned, then I can change void to null here and to the relevant changes across the server and the client.
export type CreateOrUpdateMomentState = {
  momentMessage?: string;
  momentSubMessage?: string;
  stepsMessage?: string;
  stepsSubMessage?: string;
  errors?: {
    // moment
    destinationName?: string[];
    momentActivity?: string[];
    momentName?: string[];
    momentIsIndispensable?: string[];
    momentDescription?: string[];
    momentStartDateAndTime?: string[];
    // step
    stepName?: string[];
    stepDescription?: string[];
    realStepDuration?: string[];
  };
  // no choice but to implement this work around yet, if I'm honest, it's something I can see myself using in the future
  selectBug?: {
    // https://github.com/facebook/react/issues/30580
    destinationName?: string;
    momentActivity?: string;
  };
} | null;

export type TrueCreateOrUpdateMomentState = {
  momentMessage?: string;
  momentSubMessage?: string;
  stepsMessage?: string;
  stepsSubMessage?: string;
  errors?: {
    // moment
    destinationName?: string[];
    momentActivity?: string[];
    momentName?: string[];
    momentIsIndispensable?: string[];
    momentDescription?: string[];
    momentStartDateAndTime?: string[];
    // step
    stepName?: string[];
    stepDescription?: string[];
    realStepDuration?: string[];
  };
} | null;

export type DeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<CreateOrUpdateMomentState>;

export type RevalidateMoments = () => Promise<void>;

export type SelectMomentId = Prisma.UserGetPayload<{
  select: typeof selectMomentId;
}>;
