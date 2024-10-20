import { FormEvent, MouseEvent } from "react";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";

import {
  MOMENT_FORM_IDS,
  // STEP_DURATION_DEFAULT,
  STEP_DURATION_ORIGINAL,
} from "@/app/data/moments";
import {
  DeleteMoment,
  MomentFormVariant,
  MomentToCRUD,
  StepFormVariant,
  StepFromCRUD,
  StepVisible,
  CreateOrUpdateMoment,
  CreateOrUpdateMomentState,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  // removeStepFormErrors,
  roundTimeUpTenMinutes,
} from "@/app/utilities/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";
import { SetState } from "@/app/types/globals";

const DEFAULT_STEP_MESSAGE =
  "Erreurs sur le renseignement étapes du formulaire.";
const DEFAULT_STEP_SUBMESSAGE = "Veuillez vérifier les champs concernés.";

export const revalidateMomentsActionflow = async (
  event: MouseEvent<HTMLButtonElement>,
  revalidateMoments: () => Promise<void>,
  replace: (href: string, options?: NavigateOptions) => void,
  pathname: string,
): Promise<void> => {
  const button = event.currentTarget;
  await revalidateMoments();
  replace(`${pathname}`);
  button.form?.reset(); // Indeed. Better for type safety.
};

// best be to prepare the state right here
export const createOrUpdateMomentActionflow = async (
  event: FormEvent<HTMLFormElement>,
  createOrUpdateMoment: CreateOrUpdateMoment,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  setStartMomentDate: SetState<string>,
  nowRoundedUpTenMinutes: string,
  setSteps: SetState<StepFromCRUD[]>,
  setStepVisible: SetState<StepVisible>,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
): Promise<CreateOrUpdateMomentState> => {
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
    // now I've got something to do
    // let's first state with the following:
    state = { ...createOrUpdateMomentState, ...state };
  } else {
    if (variant === "creating") {
      setStartMomentDate(nowRoundedUpTenMinutes);
      setSteps([]);
      setStepVisible("creating");
    }
  }

  return state;
};

// reset is only on the creating variant of MomentForms
export const resetMomentActionflow = (
  setStartMomentDate: SetState<string>,
  setSteps: SetState<StepFromCRUD[]>,
  setStepVisible: SetState<StepVisible>,
  variant: MomentFormVariant,
  setInputSwitchKey: SetState<string>,
): CreateOrUpdateMomentState => {
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

  // resetting the create step form along
  const stepFormCreating = document.getElementById(
    MOMENT_FORM_IDS[variant].stepFormCreating,
  ) as HTMLFormElement | null;
  stepFormCreating?.reset();

  // "resetting" the InputSwitchKey fixing a bug from Radix
  setInputSwitchKey(uuidv4());

  return null;
};

// delete is only on the updating variant of MomentForms
export const deleteMomentActionflow = async (
  deleteMoment: DeleteMoment | undefined,
  moment: MomentToCRUD | undefined,
): Promise<CreateOrUpdateMomentState> => {
  if (deleteMoment) {
    const deleteMomentBound = deleteMoment.bind(null, moment);
    const state = await deleteMomentBound();
    return state;
  } else {
    return {
      momentMessage: "Erreur.",
      momentSubMessage:
        "La fonction d'effacement du moment n'est pas disponible en interne.",
    };
  }
};

export const createOrUpdateStepActionflow = (
  event: FormEvent<HTMLFormElement>,
  duree: string,
  steps: StepFromCRUD[],
  variant: StepFormVariant,
  currentStepId: string,
  setSteps: SetState<StepFromCRUD[]>,
  setStepVisible: SetState<StepVisible>,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
): CreateOrUpdateMomentState => {
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
      // for now we's just gonna chill
      // ...createOrUpdateMomentState,
      stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
      stepsSubMessage:
        "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
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
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    // getting it chilling for now
    // const stepFormErrorsRemoved = removeStepFormErrors(
    //   createOrUpdateMomentState,
    // );
    // const errors = stepFormErrorsRemoved?.errors
    //   ? Object.assign(stepFormErrorsRemoved.errors, fieldErrors)
    //   : fieldErrors;

    return {
      // ...createOrUpdateMomentState,
      stepsMessage: DEFAULT_STEP_MESSAGE,
      stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
      // I'm keeping fieldErrors for now though and might implement everywhere
      // errors: fieldErrors,
      stepsErrors: fieldErrors,
    };
  }

  const { stepName, stepDescription, realStepDuration } = validatedFields.data;

  const stepsIntitules = steps.map((e) => e.intitule);
  const stepsDetails = steps.map((e) => e.details);

  // Ça va devenir lourd donc franchement il faut un bouton qui puisse effacer les erreurs.
  // Mais pour l'heure oui, il faut s'assurer que le système actuel marche correctement.
  // ...Et sincèrement j'aimerais vraiment avoir un petit afterflow sur le formulaire.
  if (stepsIntitules.includes(stepName) && variant === "creating") {
    let errors = {
      stepName: [
        "Vous ne pouvez pas créer deux étapes du même nom sur le même moment.",
      ],
    };

    // chilling again for now...
    // errors = createOrUpdateMomentState?.errors
    //   ? Object.assign(createOrUpdateMomentState.errors, errors)
    //   : errors;

    return {
      // ...createOrUpdateMomentState,
      stepsMessage: DEFAULT_STEP_MESSAGE,
      stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
      stepsErrors: errors,
    };
  }

  if (stepsDetails.includes(stepDescription) && variant === "creating") {
    return {
      // chilling...
      // ...createOrUpdateMomentState,
      stepsMessage: DEFAULT_STEP_MESSAGE,
      stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
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

  let newSteps: StepFromCRUD[] = [];
  if (variant === "creating") newSteps = [...steps, step];
  if (variant === "updating")
    newSteps = steps.map((e) => {
      if (e.id === currentStepId) return step;
      else return e;
    });

  setSteps(newSteps);
  setStepVisible("create");

  // chillng...
  // return removeStepFormErrors(createOrUpdateMomentState);
  return null;
};

export const resetStepActionflow = (setStepDuree: SetState<string>): void => {
  // in complement to HTML reset, since duree is controlled
  // if (showOriginal) setStepDuree(STEP_DURATION_ORIGINAL);
  // else setStepDuree(STEP_DURATION_DEFAULT);
  setStepDuree(STEP_DURATION_ORIGINAL);
};

export const deleteStepActionflow = (
  steps: StepFromCRUD[],
  currentStepId: string,
  setSteps: SetState<StepFromCRUD[]>,
  setStepVisible: SetState<StepVisible>,
): void => {
  let newSteps = steps.filter((step) => step.id !== currentStepId);
  setSteps(newSteps);

  if (newSteps.length === 0) setStepVisible("creating");
  else setStepVisible("create");
};
