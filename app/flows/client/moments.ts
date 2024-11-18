import { FormEvent, MouseEvent } from "react";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";
import { compareAsc, compareDesc } from "date-fns";

import {
  defaultStepsErrorMessages,
  momentFormIds,
  STEP_DURATION_ORIGINAL,
  VIEW,
} from "@/app/data/moments";
import {
  FalserDeleteMoment,
  MomentFormVariant,
  MomentToCRUD,
  StepFormVariant,
  StepFromClient,
  StepVisible,
  FalserCreateOrUpdateMoment,
  FalseCreateOrUpdateMomentState,
  SubView,
  CreateOrUpdateMomentState,
  FalseCreateOrUpdateMoment,
  FalseDeleteMoment,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
  CreateOrUpdateMoment,
  DeleteMoment,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  roundTimeUpTenMinutes,
} from "@/app/utilities/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";
import { SetState } from "@/app/types/globals";

// best be to prepare the state right here
export const falserCreateOrUpdateMomentClientFlow = async (
  event: FormEvent<HTMLFormElement>,
  createOrUpdateMoment: FalserCreateOrUpdateMoment,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState,
  endMomentDate: string,
  setSubView: SetState<SubView>,
): Promise<FalseCreateOrUpdateMomentState> => {
  event.preventDefault();

  const createOrUpdateMomentBound = createOrUpdateMoment.bind(
    null,
    new FormData(event.currentTarget),
    variant,
    startMomentDate,
    steps,
    momentFromCRUD,
    destinationSelect,
    activitySelect,
  );
  let state = await createOrUpdateMomentBound();

  if (state) {
    return { ...createOrUpdateMomentState, ...state };
  } else {
    const currentNow = dateToInputDatetime(new Date());

    if (compareDesc(endMomentDate, currentNow) === 1)
      setSubView("past-moments");
    else if (compareAsc(startMomentDate, currentNow) === 1)
      setSubView("future-moments");
    // present by default
    else setSubView("current-moments");

    // resetting the whole form manually
    if (variant === "creating") {
      const momentForm = document.getElementById(
        momentFormIds[variant].momentForm,
      ) as HTMLFormElement | null;
      momentForm?.reset();
    }

    return state;
  }
};

export const falseCreateOrUpdateMomentClientFlow = async (
  event: FormEvent<HTMLFormElement>,
  createOrUpdateMoment: FalseCreateOrUpdateMoment,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  event.preventDefault();

  const createOrUpdateMomentBound = createOrUpdateMoment.bind(
    null,
    new FormData(event.currentTarget),
    variant,
    startMomentDate,
    steps,
    momentFromCRUD,
    destinationSelect,
    activitySelect,
  );
  let state = await createOrUpdateMomentBound();

  if (state?.isSuccess === false) {
    // return { ...createOrUpdateMomentState, ...state, isSuccess: false };
    return {
      isSuccess: false,
      error: { ...createOrUpdateMomentState?.error, ...state.error },
    };
  } else {
    // IMPORTANT
    // I'm sunsetting this feature, because in truth it does not scale as is. The way it should be done is that within the server action, I look on the server to see where the created or updated moment would appear on the three lists (past, present, future), including at what given page on these lists it would appear. Then I'd pass this data inside the state (meaning I will then justifiably have to distinguish CreateOrUpdateMomentState in two routes: error and success (!)), with a top enum that says whether it is in error or success state... or in truth I could just start with a boolean isSuccess. The boolean sends the relevant data to the client, and then the after flow handles the redirection correctly.
    // At this time I can even save in the success path of the state the id of the element that's been created or updated, find a way to scroll down to it on the new view, and complete with a little animation that shows where it has been added.
    // I would say that's a lot better than what I have right now, and a lot more thought out, so that's what I'll be exploring, hopefully before the 20 this month.

    // This is going back to the server flow.

    // const currentNow = dateToInputDatetime(new Date());

    // if (compareDesc(endMomentDate, currentNow) === 1)
    //   setSubView("past-moments");
    // else if (compareAsc(startMomentDate, currentNow) === 1)
    //   setSubView("future-moments");
    // // present by default
    // else setSubView("current-moments");

    // resetting the whole form manually
    if (variant === "creating") {
      const momentForm = document.getElementById(
        momentFormIds[variant].momentForm,
      ) as HTMLFormElement | null;
      momentForm?.reset();
    }

    return state;
  }
};

export const createOrUpdateMomentClientFlow = async (
  event: FormEvent<HTMLFormElement>,
  createOrUpdateMoment: CreateOrUpdateMoment,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentAdapted | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  event.preventDefault();

  const createOrUpdateMomentBound = createOrUpdateMoment.bind(
    null,
    new FormData(event.currentTarget),
    variant,
    startMomentDate,
    steps,
    momentFromCRUD,
    destinationSelect,
    activitySelect,
  );
  let state = await createOrUpdateMomentBound();

  if (state?.isSuccess === false) {
    return {
      isSuccess: false,
      error: { ...createOrUpdateMomentState?.error, ...state.error },
    };
  } else {
    // resetting the whole form manually
    if (variant === "creating") {
      const momentForm = document.getElementById(
        momentFormIds[variant].momentForm,
      ) as HTMLFormElement | null;
      momentForm?.reset();
    }

    return state;
  }
};

// reset is only on the creating variant of MomentForms
export const falseResetMomentClientFlow = (
  setStartMomentDate: SetState<string>,
  setSteps: SetState<StepFromClient[]>,
  setStepVisible: SetState<StepVisible>,
  variant: MomentFormVariant,
  setInputSwitchKey: SetState<string>,
  setDestinationSelect: SetState<boolean>,
  setActivitySelect: SetState<boolean>,
): null => {
  // if (revalidateMoments) await revalidateMoments();
  // The (side?) effects of the revalidation are felt after the action ends. That's why they can't be used within the action.
  // setStartMomentDate(nowRoundedUpTenMinutes);
  // the easy solution
  setStartMomentDate(roundTimeUpTenMinutes(dateToInputDatetime(new Date()))); // the harder solution would be returning that information from a server action, but since it can be obtained on the client and it's just for cosmetics, that will wait for a more relevant use case (it's an escape hatch I've then used to solve a bug from React 19)
  // Or actually the flow that I preconize now is to do what's next to be done inside a subsequent useEffect (but I don't think that would have worked). Here it had only to do with time so I could guess it manually, but for anything more complex, that's where useEffect currently comes in until the React team defeat it as the "final boss."
  // https://x.com/acdlite/status/1758231913314091267
  // https://x.com/acdlite/status/1758233493408973104

  // in complement to HTML reset
  setSteps([]);
  setStepVisible("creating");
  setDestinationSelect(false);
  setActivitySelect(false);

  // resetting the create step form along
  const stepFormCreating = document.getElementById(
    momentFormIds[variant].stepFormCreating,
  ) as HTMLFormElement | null;
  stepFormCreating?.reset();

  // "resetting" the InputSwitchKey fixing a bug from Radix
  setInputSwitchKey(uuidv4());

  return null;
};

export const resetMomentClientFlow = (
  setStartMomentDate: SetState<string>,
  setSteps: SetState<StepFromClient[]>,
  setStepVisible: SetState<StepVisible>,
  variant: MomentFormVariant,
  setInputSwitchKey: SetState<string>,
  setDestinationSelect: SetState<boolean>,
  setActivitySelect: SetState<boolean>,
): null => {
  // if (revalidateMoments) await revalidateMoments();
  // The (side?) effects of the revalidation are felt after the action ends. That's why they can't be used within the action.
  // setStartMomentDate(nowRoundedUpTenMinutes);
  // the easy solution
  setStartMomentDate(roundTimeUpTenMinutes(dateToInputDatetime(new Date()))); // the harder solution would be returning that information from a server action, but since it can be obtained on the client and it's just for cosmetics, that will wait for a more relevant use case (it's an escape hatch I've then used to solve a bug from React 19)
  // Or actually the flow that I preconize now is to do what's next to be done inside a subsequent useEffect (but I don't think that would have worked). Here it had only to do with time so I could guess it manually, but for anything more complex, that's where useEffect currently comes in until the React team defeat it as the "final boss."
  // https://x.com/acdlite/status/1758231913314091267
  // https://x.com/acdlite/status/1758233493408973104

  // in complement to HTML reset
  setSteps([]);
  setStepVisible("creating");
  setDestinationSelect(false);
  setActivitySelect(false);

  // resetting the create step form along
  const stepFormCreating = document.getElementById(
    momentFormIds[variant].stepFormCreating,
  ) as HTMLFormElement | null;
  stepFormCreating?.reset();

  // "resetting" the InputSwitchKey fixing a bug from Radix
  setInputSwitchKey(uuidv4());

  return null;
};

// delete is only on the updating variant of MomentForms
export const falserDeleteMomentClientFlow = async (
  deleteMoment: FalserDeleteMoment | undefined,
  moment: MomentToCRUD | undefined,
): Promise<FalseCreateOrUpdateMomentState> => {
  if (deleteMoment) {
    const deleteMomentBound = deleteMoment.bind(null, moment);
    // spreading from the original state is currently unnecessary
    const state = await deleteMomentBound();
    return state;
  } else {
    return {
      momentMessages: {
        message: "Erreur.",
        subMessage:
          "La fonction d'effacement du moment n'est pas disponible en interne.",
      },
      momentErrors: {},
      stepsMessages: {},
      stepsErrors: {},
    };
  }
};

export const falseDeleteMomentClientFlow = async (
  deleteMoment: FalseDeleteMoment | undefined,
  moment: MomentToCRUD | undefined,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  if (deleteMoment) {
    const deleteMomentBound = deleteMoment.bind(null, moment);
    // spreading from the original state is currently unnecessary
    const state = await deleteMomentBound();
    return state;
  } else {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "La fonction d'effacement du moment n'est pas disponible en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };
  }
};

export const deleteMomentClientFlow = async (
  deleteMoment: DeleteMoment | undefined,
  moment: MomentAdapted | undefined,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  if (deleteMoment) {
    const deleteMomentBound = deleteMoment.bind(null, moment);
    const state = await deleteMomentBound();
    return state;
  } else {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "La fonction d'effacement du moment n'est pas disponible en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };
  }
};

export const revalidateMomentsClientFlow = async (
  event: MouseEvent<HTMLButtonElement>,
  revalidateMoments: () => Promise<void>,
  replace: (href: string, options?: NavigateOptions) => void,
  pathname: string,
): Promise<void> => {
  const button = event.currentTarget;
  await revalidateMoments();
  button.form?.reset(); // Indeed. Better for type safety.

  replace(`${pathname}?${VIEW}=read-moments`); // It could have made more sense to have the redirection in an after flow. But since it doesn't depend on data received from the server (for now?), I can let this slide.
};

export const falseCreateOrUpdateStepClientFlow = (
  event: FormEvent<HTMLFormElement>,
  duree: string,
  steps: StepFromClient[],
  variant: StepFormVariant,
  currentStepId: string,
  setSteps: SetState<StepFromClient[]>,
  setStepVisible: SetState<StepVisible>,
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState,
): FalseCreateOrUpdateMomentState => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  let intitule = formData.get("intituledeleetape");
  let details = formData.get("detailsdeleetape");

  if (
    typeof intitule !== "string" ||
    typeof details !== "string" ||
    typeof duree !== "string"
  ) {
    return {
      momentMessages: {},
      momentErrors: {},
      stepsMessages: {
        message: "Erreur sur le renseignement étapes du formulaire.",
        subMessage:
          "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
      },
      stepsErrors: {},
    };
  }

  const [trimmedIntitule, trimmedDetails] = [intitule, details].map((e) =>
    e.trim(),
  );

  const numberedDuree = duree !== "" ? +duree : "";

  const validatedFields = CreateOrUpdateStepSchema.safeParse({
    stepName: trimmedIntitule,
    stepDescription: trimmedDetails,
    realStepDuration: numberedDuree,
  });

  if (!validatedFields.success) {
    return {
      ...createOrUpdateMomentState,
      stepsMessages: {
        message: defaultStepsErrorMessages.MESSAGE,
        subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
      },
      stepsErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { stepName, stepDescription, realStepDuration } = validatedFields.data;

  const stepsIntitules = steps.map((e) => e.intitule);
  const stepsDetails = steps.map((e) => e.details);

  if (stepsIntitules.includes(stepName) && variant === "creating") {
    return {
      ...createOrUpdateMomentState,
      stepsMessages: {
        message: defaultStepsErrorMessages.MESSAGE,
        subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
      },
      stepsErrors: {
        stepName: [
          "Vous ne pouvez pas créer deux étapes du même nom sur le même moment.",
        ],
      },
    };
  }

  if (stepsDetails.includes(stepDescription) && variant === "creating") {
    return {
      ...createOrUpdateMomentState,
      stepsMessages: {
        message: defaultStepsErrorMessages.MESSAGE,
        subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
      },
      stepsErrors: {
        stepDescription: [
          "Vous ne pouvez pas vraiment créer deux étapes avec les mêmes détails sur le même moment.",
        ],
      },
    };
  }

  intitule = stepName;
  details = stepDescription;
  duree = realStepDuration.toString();

  let id = "";
  if (variant === "creating") id = uuidv4();
  if (variant === "updating") id = currentStepId;

  const step = {
    id,
    intitule,
    details,
    duree,
  };

  let newSteps: StepFromClient[] = [];
  if (variant === "creating") newSteps = [...steps, step];
  if (variant === "updating")
    newSteps = steps.map((e) => {
      if (e.id === currentStepId) return step;
      else return e;
    });

  setSteps(newSteps);
  setStepVisible("create");

  return { ...createOrUpdateMomentState, stepsMessages: {}, stepsErrors: {} };
};

export const createOrUpdateStepClientFlow = (
  event: FormEvent<HTMLFormElement>,
  duree: string,
  steps: StepFromClient[],
  variant: StepFormVariant,
  currentStepId: string,
  setSteps: SetState<StepFromClient[]>,
  setStepVisible: SetState<StepVisible>,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setIsAnimationDelayed?: SetState<boolean>,
): CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  let intitule = formData.get("intituledeleetape");
  let details = formData.get("detailsdeleetape");

  if (
    typeof intitule !== "string" ||
    typeof details !== "string" ||
    typeof duree !== "string"
  ) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {},
        momentErrors: {},
        stepsMessages: {
          message: "Erreur sur le renseignement étapes du formulaire.",
          subMessage:
            "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
        },
        stepsErrors: {},
      },
    };
  }

  const [trimmedIntitule, trimmedDetails] = [intitule, details].map((e) =>
    e.trim(),
  );

  const numberedDuree = duree !== "" ? +duree : "";

  const validatedFields = CreateOrUpdateStepSchema.safeParse({
    stepName: trimmedIntitule,
    stepDescription: trimmedDetails,
    realStepDuration: numberedDuree,
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      error: {
        ...createOrUpdateMomentState?.error,
        stepsMessages: {
          message: defaultStepsErrorMessages.MESSAGE,
          subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
        },
        stepsErrors: validatedFields.error.flatten().fieldErrors,
      },
    };
  }

  const { stepName, stepDescription, realStepDuration } = validatedFields.data;

  const stepsIntitules = steps.map((e) => e.intitule);
  const stepsDetails = steps.map((e) => e.details);

  if (stepsIntitules.includes(stepName) && variant === "creating") {
    return {
      isSuccess: false,
      error: {
        ...createOrUpdateMomentState?.error,
        stepsMessages: {
          message: defaultStepsErrorMessages.MESSAGE,
          subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
        },
        stepsErrors: {
          stepName: [
            "Vous ne pouvez pas créer deux étapes du même nom sur le même moment.",
          ],
        },
      },
    };
  }

  if (stepsDetails.includes(stepDescription) && variant === "creating") {
    return {
      isSuccess: false,
      error: {
        ...createOrUpdateMomentState?.error,
        stepsMessages: {
          message: defaultStepsErrorMessages.MESSAGE,
          subMessage: defaultStepsErrorMessages.SUB_MESSAGE,
        },
        stepsErrors: {
          stepDescription: [
            "Vous ne pouvez pas vraiment créer deux étapes avec les mêmes détails sur le même moment.",
          ],
        },
      },
    };
  }

  intitule = stepName;
  details = stepDescription;
  duree = realStepDuration.toString();

  let id = "";
  if (variant === "creating") id = uuidv4();
  if (variant === "updating") id = currentStepId;

  const step = {
    id,
    intitule,
    details,
    duree,
  };

  let newSteps: StepFromClient[] = [];
  if (variant === "creating") newSteps = [...steps, step];
  if (variant === "updating")
    newSteps = steps.map((e) => {
      if (e.id === currentStepId) return step;
      else return e;
    });

  setSteps(newSteps);
  setStepVisible("create");

  if (setIsAnimationDelayed) setIsAnimationDelayed(true);

  return {
    isSuccess: false,
    error: {
      ...createOrUpdateMomentState?.error,
      stepsMessages: {},
      stepsErrors: {},
    },
  };
};

export const falseResetStepClientFlow = (
  setStepDuree: SetState<string>,
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState,
): FalseCreateOrUpdateMomentState => {
  // in complement to HTML reset, since duree is controlled
  setStepDuree(STEP_DURATION_ORIGINAL);
  return { ...createOrUpdateMomentState, stepsMessages: {}, stepsErrors: {} };
};

export const resetStepClientFlow = (
  setStepDuree: SetState<string>,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
): CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess => {
  // in complement to HTML reset, since duree is controlled
  setStepDuree(STEP_DURATION_ORIGINAL);
  return {
    isSuccess: false,
    error: {
      ...createOrUpdateMomentState?.error,
      stepsMessages: {},
      stepsErrors: {},
    },
  };
};

export const deleteStepClientFlow = (
  steps: StepFromClient[],
  currentStepId: string,
  setSteps: SetState<StepFromClient[]>,
  setStepVisible: SetState<StepVisible>,
  setStepDureeCreate: SetState<string>,
): void => {
  let newSteps = steps.filter((step) => step.id !== currentStepId);
  setSteps(newSteps);

  if (newSteps.length === 0) {
    setStepVisible("creating");
    setStepDureeCreate(STEP_DURATION_ORIGINAL);
  } else setStepVisible("create");
};
