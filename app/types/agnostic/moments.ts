// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// Internal imports

import {
  momentsPageSearchParamsKeys,
  momentsPageSearchParamsKeysOfPages,
  subViews,
  views,
} from "@/app/constants/agnostic/moments";

// Types imports

import { Option } from "@/app/types/agnostic/globals";

/* LOGIC */

// data adapted types

// previously StepFromCRUD, retains the previous id paradigm, left untouched
export type StepFromClient = {
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

export type StepAdapted = {
  key: string; // changed id to key
  orderId: number;
  title: string;
  details: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
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

export type DestinationAdapted = {
  key: string; // changed id to key
  destinationIdeal: string;
  moments: MomentAdapted[];
};

export type DateAdapted = {
  date: string;
  destinations: DestinationAdapted[];
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

// constants types

export type View = (typeof views)[keyof typeof views];

export type SubView = (typeof subViews)[keyof typeof subViews];

export type FormSectionTopic = "moment" | "steps";

export type StepVisible = "create" | "creating" | "updating";

type DefaultFormVariant = "creating" | "updating";

export type MomentFormVariant = DefaultFormVariant;

export type StepFormVariant = DefaultFormVariant;

// jointly secures makeMomentFormIds and momentFormIds
export type MomentFormIds = {
  momentForm: string;
  yourMoment: string;
  itsSteps: string;
  stepFormCreating: string;
  stepFormUpdating: string;
};

// searchParams types

// now currently unused in favor of MomentsPageSearchParamsKeyOfPages
export type MomentsPageSearchParamsKey =
  (typeof momentsPageSearchParamsKeys)[keyof typeof momentsPageSearchParamsKeys];

export type MomentsPageSearchParamsKeyOfPages =
  (typeof momentsPageSearchParamsKeysOfPages)[keyof typeof momentsPageSearchParamsKeysOfPages];

export type MomentsPageSearchParamsHandled = {
  [momentsPageSearchParamsKeys.CONTAINS]: string;
  [momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE]: string;
  [momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE]: string;
  [momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE]: string;
  [momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE]: string;
  [momentsPageSearchParamsKeys.VIEW]: View;
  [momentsPageSearchParamsKeys.SUB_VIEW]: SubView;
  [momentsPageSearchParamsKeys.MOMENT_KEY]: string;
};

// server action types

// Now the action types will also be kept here, to be manually shared wherever the actions are to be used.
export type FalserCreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<FalseCreateOrUpdateMomentState>;

export type FalseCreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

export type CreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentAdapted | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

export type FalserDeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<FalseCreateOrUpdateMomentState>;

export type FalseDeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

// This can be dynamic. // Actually no, it's about the arguments, not the return type.
export type DeleteMoment = (
  momentFromCRUD?: MomentAdapted,
) => Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess>;

export type RevalidateMoments = () => Promise<void>;

// server action states types

type FormErrorMessages = {
  message?: string;
  subMessage?: string;
};

type MomentErrorMessages = FormErrorMessages;

type StepsErrorMessages = FormErrorMessages;

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
  momentMessages?: MomentErrorMessages;
  momentErrors?: {
    destinationName?: string[];
    momentActivity?: string[];
    momentName?: string[];
    momentIsIndispensable?: string[];
    momentDescription?: string[];
    momentStartDateAndTime?: string[];
  };
  stepsMessages?: StepsErrorMessages;
  stepsErrors?: {
    stepName?: string[];
    stepDescription?: string[];
    realStepDuration?: string[];
  };
  errorScrollPriority?: "moment" | "steps";
} | null;

export type CreateOrUpdateMomentError = {
  isSuccess: false;
  error: {
    momentMessages?: MomentErrorMessages;
    momentErrors?: {
      destinationName?: string[];
      momentActivity?: string[];
      momentName?: string[];
      momentIsIndispensable?: string[];
      momentDescription?: string[];
      momentStartDateAndTime?: string[];
    };
    stepsMessages?: StepsErrorMessages;
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
    // This is very important. Here, I'm literally sending the moment as it from the database to the client. And that's actually wrong. The moment that should be sent by the success is exactly the same that is created or modified.
    momentAdapted?: MomentAdapted; // voluntarily sending to the client the data from the moment that was needed in the server to obtain the expected effects of the after flow
    countPage?: number;
    subView?: SubView;
  };
};

export type CreateOrUpdateMomentState =
  | CreateOrUpdateMomentError
  | CreateOrUpdateMomentSuccess
  | null;

// fetch types // now to be maintained by hand

// THIS IS THE TYPE THAT ENDS UP ON THE CLIENT. THEREFORE, IT WILL HAVE TO BE HANDLED BY HAND
export type ReadMomentsViewData = {
  userMomentsAdaptedCombined: {
    userAllMomentsAdapted: {
      dates: DateAdapted[];
      pageDetails: PageDetails;
    };
    userPastMomentsAdapted: {
      dates: DateAdapted[];
      pageDetails: PageDetails;
    };
    userCurrentMomentsAdapted: {
      dates: DateAdapted[];
      pageDetails: PageDetails;
    };
    userFutureMomentsAdapted: {
      dates: DateAdapted[];
      pageDetails: PageDetails;
    };
  };
  subView: SubView;
};

export type MomentFormsData = {
  destinationOptions: Option[];
};

export type ViewAndMomentData = {
  view: View;
  moment: MomentAdapted | undefined;
};
