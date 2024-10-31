import { Prisma } from "@prisma/client";

import { selectMomentId } from "@/app/reads/subreads/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  MOMENTID,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
  VIEW,
} from "@/app/data/moments";

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
  id: string;
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

export type View = "update-moment" | "read-moments" | "create-moment";

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
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<CreateOrUpdateMomentState>;

type FormMessages = {
  message?: string;
  subMessage?: string;
};

type MomentMessages = FormMessages;

type StepsMessages = FormMessages;

// The type of the return of createOrUpdateMoment as it is being shared between the server and the client.
// It is then reused between createOrUpdateMoment on the server and the type CreateOrUpdateMoment made on the client.
// Then, MANUALLY I do insist, I need to make sure that the arguments on createOrUpdateMoment and CreateOrUpdateMoment are exactly the same. (In fact, they're meant to be directly copypastable between one another.)
// This type allows to manually define beforehand exactly what the return should be between the server and the client so that whoever works with the action knows exactly they could output.
// For example, changing null to void, I went back to createOrUpdateMoment and removed the last return, then went the useState of createOrUpdateMomentState, and initiated it with literally no argument.
// Then when it became kind of imperative that a null should be returned, I changed void to null here and did the relevant changes across the server and the client.
// ...
// IMPORTANT
// I'm gonna have to evolve CreateOrUpdateMomentState so that it includes a priority towards where it needs to scroll to after an error, because now I'm going to allow both momentMessage and stepsMessage stuff to remain.
// It's a completely different way to operate with this state, and since I'm even going to have to touch on how it is made, I'm gonna need to address pretty much everything related to it.
// Et il faut aussi que le travail des erreurs se fasse dans les deux sens...
// ...Looking at my afterflows I don't think I'll actually need errorScrollPriority since it's only the top form that actually does a priority scrolling and I've already established this priority in the afterflow.
// What I will need however, is a complete revamp of errors that clearly separates between momentErrors and stepsErrors, so that I don't have to always, always modify both when I only one to modify one. Let's go. // Done.
export type CreateOrUpdateMomentState = {
  momentMessages?: MomentMessages;
  momentErrors?: {
    destinationName?: string[];
    momentActivity?: string[];
    momentName?: string[];
    momentIsIndispensable?: string[];
    momentDescription?: string[];
    momentStartDateAndTime?: string[];
  };
  stepsMessages?: StepsMessages;
  stepsErrors?: {
    stepName?: string[];
    stepDescription?: string[];
    realStepDuration?: string[];
  };
  errorScrollPriority?: "moment" | "steps";
} | null;

export type DeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<CreateOrUpdateMomentState>;

export type RevalidateMoments = () => Promise<void>;

export type SelectMomentId = Prisma.UserGetPayload<{
  select: typeof selectMomentId;
}>;

export type MomentFormIds = {
  momentForm: string;
  yourMoment: string;
  itsSteps: string;
  stepFormCreating: string;
  stepFormUpdating: string;
};

export type MomentsSearchParamsKey =
  | typeof CONTAINS
  | typeof USERMOMENTSPAGE
  | typeof PASTUSERMOMENTSPAGE
  | typeof CURRENTUSERMOMENTSPAGE
  | typeof FUTUREUSERMOMENTSPAGE
  | typeof VIEW
  | typeof MOMENTID;

export type MomentsSearchParams = {
  [CONTAINS]: string;
  [USERMOMENTSPAGE]: string;
  [PASTUSERMOMENTSPAGE]: string;
  [CURRENTUSERMOMENTSPAGE]: string;
  [FUTUREUSERMOMENTSPAGE]: string;
  [VIEW]: string;
  [MOMENTID]: string;
};
