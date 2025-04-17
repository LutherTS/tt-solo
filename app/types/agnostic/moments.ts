"use agnostic";
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

import type { Option } from "@/app/types/agnostic/globals";

/* LOGIC */

// data adapted types

// previously StepFromCRUD, retains the previous id paradigm, left untouched
export type StepFromClient = {
  id: string;
  intitule: string;
  details: string;
  duree: string;
};

type StepToCRUD = {
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

type MomentsDestinationToCRUD = {
  id: string;
  destinationIdeal: string;
  moments: MomentToCRUD[];
};

type MomentsDateToCRUD = {
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

export type CreateOrUpdateMoment = (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentAdapted | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
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
