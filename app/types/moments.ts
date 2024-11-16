import { Prisma } from "@prisma/client";

import {
  selectMomentDefault,
  selectMomentId,
  selectMomentIdNameAndDates,
} from "@/app/reads/subreads/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  MOMENTID,
  PASTUSERMOMENTSPAGE,
  SUBVIEW,
  USERMOMENTSPAGE,
  VIEW,
} from "@/app/data/moments";
import MomentsPage from "@/app/(pages)/(dashboard)/users/[username]/moments/page";
import {
  fetchMomentFormsDataFlow,
  fetchReadMomentsViewDataFlow,
  fetchViewAndMomentFlow,
} from "../flows/fetch/moments";
import { trueDeleteMomentServerFlow } from "../flows/server/moments";

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

export type StepAdapted = {
  key: string; // changed id to key
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

export type MomentAdapted = {
  key: string; // changed id to key
  activity: string;
  objective: string;
  isIndispensable: boolean;
  context: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
  steps: StepAdapted[];
  destinationIdeal: string;
};

export type MomentsDestinationToCRUD = {
  id: string;
  destinationIdeal: string;
  moments: MomentToCRUD[];
};

export type DestinationAdapted = {
  key: string; // changed id to key
  destinationIdeal: string;
  moments: MomentAdapted[];
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

export type DateAdapted = {
  date: string;
  destinations: DestinationAdapted[];
  // momentsTotal: number;
  // momentFirstIndex: number;
  // momentLastIndex: number;
  // allMomentsTotal: number;
  // currentPage: number;
  // totalPage: number;
};

export type UserMomentsToCRUD = {
  dates: MomentsDateToCRUD[];
};

export type PageDetails = {
  page: number;
  total: number;
  maxPage: number;
  momentsTotal: number;
  momentsFirstIndex: number;
  momentsLastIndex: number;
};

export type MomentsAdapted = {
  dates: DateAdapted[];
  pageDetails: PageDetails;
};

export type UserMomentsAdaptedCombined = {
  userAllMomentsAdapted: MomentsAdapted;
  userPastMomentsAdapted: MomentsAdapted;
  userCurrentMomentsAdapted: MomentsAdapted;
  userFutureMomentsAdapted: MomentsAdapted;
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
export type FalseCreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<FalseCreateOrUpdateMomentState>;

export type CreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

export type TrueCreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentAdapted | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

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
export type FalseCreateOrUpdateMomentState = {
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

export type CreateOrUpdateMomentState =
  | CreateOrUpdateMomentError
  | CreateOrUpdateMomentSuccess
  | null;

export type CreateOrUpdateMomentError = {
  isSuccess: false;
  error: {
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
  };
  success?: never;
};

export type CreateOrUpdateMomentSuccess = {
  isSuccess: true;
  error?: never;
  success: {
    moment?: SelectMomentIdNameAndDates; // voluntarily sending to the client the data from the moment that was needed in the server to obtain the expected effects of the after flow
    countPage?: number;
    subView?: SubView;
  };
};

export type FalseDeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<FalseCreateOrUpdateMomentState>;

export type DeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

// This can be dynamic. // Actually no, it's about the arguments, not the return type.
export type TrueDeleteMoment = (
  momentFromCRUD?: MomentAdapted,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

export type RevalidateMoments = () => Promise<void>;

// no longer used
export type SelectMomentId = Prisma.MomentGetPayload<{
  select: typeof selectMomentId;
}>;

export type SelectMomentIdNameAndDates = Prisma.MomentGetPayload<{
  select: typeof selectMomentIdNameAndDates;
}>;

export type SelectMomentDefault = Prisma.MomentGetPayload<{
  select: typeof selectMomentDefault;
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
  [VIEW]: View;
  [SUBVIEW]: SubView;
  [MOMENTID]: string;
};

export type FormSectionTopic = "moment" | "steps";

export type MomentsPageSearchParams = Parameters<
  typeof MomentsPage
>[0]["searchParams"];

export type FetchReadMomentsViewData = ReturnType<
  typeof fetchReadMomentsViewDataFlow
>;

export type ReadMomentsViewData = Awaited<
  ReturnType<typeof fetchReadMomentsViewDataFlow>
>;

export type FetchMomentFormsData = ReturnType<typeof fetchMomentFormsDataFlow>;

export type MomentFormsData = Awaited<
  ReturnType<typeof fetchMomentFormsDataFlow>
>;

export type FetchViewAndMomentData = ReturnType<typeof fetchViewAndMomentFlow>;

export type ViewAndMomentData = Awaited<
  ReturnType<typeof fetchViewAndMomentFlow>
>;
