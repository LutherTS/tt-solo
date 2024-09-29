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

// Now the action types will also be kept here, to be manually shared wherever the actions are to be used.
export type CreateOrUpdateMoment = (
  variant: "creating" | "updating",
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

// The type of the return of createOrUpdateMoment as it is being shared between the server and the client.
// It is then reused between createOrUpdateMoment on the server and the type CreateOrUpdateMoment made on the client.
// Then, MANUALLY I do insist, I need to make sure that the arguments on createOrUpdateMoment and CreateOrUpdateMoment are exactly the same. (In fact, they're meant to be directly copypastable between one another.)
// This type allows to manually define beforehand exactly what the return should be between the server and the client so that whoever works with the action knows exactly they could output.
// For example, changing null to void, I went back to createOrUpdateMoment and removed the last return, then went the useState of createOrUpdateMomentState, and initiated it with literally no argument.
// Then if for some reason I learn that it is imperative that a null should be returned, then I can change void to null here and to the relevant changes across the server and the client.
export type CreateOrUpdateMomentState = { message: string } | void;

export type DeleteMoment = (
  momentFromCRUD?: MomentToCRUD,
) => Promise<DeleteMomentState>;

// same as CreateOrUpdateMomentState for now but differentiated nonetheless because subject to change.
export type DeleteMomentState = { message: string } | void;

export type RevalidateMoments = () => Promise<void>;
