"use client";
// Proposes "use client" to enforce a Client Module.

/* IMPORTS */

// External imports

import { v4 as uuidv4 } from "uuid";

// Internal imports

import {
  defaultStepsErrorMessages,
  momentFormIds,
  momentsPageSearchParamsKeys,
  STEP_DURATION_ORIGINAL,
  views,
} from "@/app/constants/agnostic/moments";
import {
  dateToInputDatetime,
  roundTimeUpTenMinutes,
} from "@/app/utilities/agnostic/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/agnostic/steps";

// Types imports

import type { FormEvent, MouseEvent } from "react";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { SetState } from "@/app/types/client/globals";
import type {
  MomentFormVariant,
  StepFormVariant,
  StepFromClient,
  StepVisible,
  CreateOrUpdateMomentState,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentAdapted,
  CreateOrUpdateMoment,
  DeleteMoment,
} from "@/app/types/agnostic/moments";

/* LOGIC */

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

  replace(
    `${pathname}?${momentsPageSearchParamsKeys.VIEW}=${views.READ_MOMENTS}`,
  ); // It could have made more sense to have the redirection in an after flow. But since it doesn't depend on data received from the server (for now?), I can let this slide.
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
