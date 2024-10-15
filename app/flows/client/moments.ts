import {
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  TransitionStartFunction,
} from "react";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { v4 as uuidv4 } from "uuid";

import { STEP_DURATION_DEFAULT, STEP_FORM_ID } from "@/app/data/moments";
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
  roundTimeUpTenMinutes,
} from "@/app/utilities/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";

const DEFAULT_STEP_MESSAGE =
  "Erreurs sur le renseignement étapes du formulaire.";
const DEFAULT_STEP_SUBMESSAGE = "Veuillez vérifier les champs concernés.";

export const revalidateMomentsActionflow = async (
  event: MouseEvent<HTMLButtonElement>,
  startRevalidateMomentsTransition: TransitionStartFunction,
  revalidateMoments: () => Promise<void>,
  replace: (href: string, options?: NavigateOptions) => void,
  pathname: string,
) => {
  startRevalidateMomentsTransition(async () => {
    const button = event.currentTarget;
    await revalidateMoments();
    replace(`${pathname}`);
    button.form?.reset(); // Indeed. Better for type safety.
  });
};

export const createOrUpdateMomentActionflow = async (
  event: FormEvent<HTMLFormElement>,
  startCreateOrUpdateMomentTransition: TransitionStartFunction,
  trueCreateOrUpdateMoment: CreateOrUpdateMoment,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  nowRoundedUpTenMinutes: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setIsCreateOrUpdateMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  startCreateOrUpdateMomentTransition(async () => {
    event.preventDefault();
    const createOrUpdateMomentBound = trueCreateOrUpdateMoment.bind(
      null,
      new FormData(event.currentTarget),
      variant,
      startMomentDate,
      steps,
      momentFromCRUD,
      destinationSelect,
      activitySelect,
    );
    const state = await createOrUpdateMomentBound();
    if (state) {
      setIsCreateOrUpdateMomentDone(true);
      return setCreateOrUpdateMomentState(state);
    } else {
      if (variant === "creating") {
        setStartMomentDate(nowRoundedUpTenMinutes);
        setSteps([]);
        setStepVisible("creating");
      }
      setIsCreateOrUpdateMomentDone(true);
      return setCreateOrUpdateMomentState(null);
    }
  });
};

// reset is only on the create variant of MomentForms
export const resetMomentFormActionflow = (
  event: FormEvent<HTMLFormElement>,
  startResetMomentFormTransition: TransitionStartFunction,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  setIsResetMomentFormDone: Dispatch<SetStateAction<boolean>>,
  setInputSwitchKey: Dispatch<SetStateAction<string>>,
) => {
  startResetMomentFormTransition(() => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser le formulaire ?")) {
      // if (revalidateMoments) await revalidateMoments();
      // The (side?) effects of the revalidation are felt after the action ends. That's why they can't be used within the action.

      // setIndispensable(false);

      // setStartMomentDate(nowRoundedUpTenMinutes);
      // the easy solution
      setStartMomentDate(
        roundTimeUpTenMinutes(dateToInputDatetime(new Date())),
      ); // the harder solution would be returning that information a server action, but since it can be obtained on the client and it's just for cosmetics, that will wait for a more relevant use case (it's an escape hatch I've then used to solve a bug from React 19 above)
      // Or actually the flow that I preconize now is to do what's next to be done inside a subsequent useEffect (but I don't think that would have worked). Here it had only to do with time so I could guess it manually, but for anything more complex, that's where useEffect currently comes in until the React team defeat it as the "final boss."
      // https://x.com/acdlite/status/1758231913314091267
      // https://x.com/acdlite/status/1758233493408973104

      setSteps([]);
      setStepVisible("creating");

      // resetting the create step form
      const stepFormCreating = document.getElementById(
        STEP_FORM_ID.creating,
      ) as HTMLFormElement | null;
      stepFormCreating?.reset();

      setCreateOrUpdateMomentState(null); // the jumping culprit, but in the end a different solution below ignores the issue (irregular defaults)

      // to "reset" the InputSwitchKey
      setInputSwitchKey(uuidv4());

      // for the useEffect
      setIsResetMomentFormDone(true);
    } else event.preventDefault();
  });
};

export const deleteMomentActionflow = async (
  startDeleteMomentTransition: TransitionStartFunction,
  deleteMoment: DeleteMoment | undefined,
  moment: MomentToCRUD | undefined,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  setIsDeleteMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  startDeleteMomentTransition(async () => {
    if (confirm("Êtes-vous sûr de vouloir effacer ce moment ?")) {
      if (deleteMoment) {
        const deleteMomentBound = deleteMoment.bind(null, moment);
        const state = await deleteMomentBound();
        if (state) {
          setIsDeleteMomentDone(true);
          return setCreateOrUpdateMomentState(state);
        } else {
          setIsDeleteMomentDone(true);
          return setCreateOrUpdateMomentState(null);
        }
      } else {
        setIsDeleteMomentDone(true);
        return setCreateOrUpdateMomentState({
          momentMessage: "Erreur.",
          momentSubMessage:
            "La fonction d'effacement du moment n'est pas disponible en interne.",
        });
      }
    }
  });
};

export const createOrUpdateStepActionflow = (
  event: FormEvent<HTMLFormElement>,
  startCreateOrUpdateStepTransition: TransitionStartFunction,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  duree: string,
  steps: StepFromCRUD[],
  variant: StepFormVariant,
  currentStepId: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setIsCreateOrUpdateStepDone: Dispatch<SetStateAction<boolean>>,
) => {
  startCreateOrUpdateStepTransition(() => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    let intitule = formData.get("intituledeleetape");
    let details = formData.get("detailsdeleetape");

    if (typeof intitule !== "string" || typeof details !== "string") {
      setIsCreateOrUpdateStepDone(true);
      return setCreateOrUpdateMomentState({
        stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
        stepsSubMessage:
          "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
      });
    }

    const [trimmedIntitule, trimmedDetails] = [intitule, details].map((e) =>
      e.trim(),
    );

    const numberedDuree = +duree;

    const validatedFields = CreateOrUpdateStepSchema.safeParse({
      stepName: trimmedIntitule,
      stepDescription: trimmedDetails,
      realStepDuration: numberedDuree,
    });

    if (!validatedFields.success) {
      setIsCreateOrUpdateStepDone(true);
      return setCreateOrUpdateMomentState({
        stepsMessage: DEFAULT_STEP_MESSAGE,
        stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
        errors: validatedFields.error.flatten().fieldErrors,
      });
    }

    const { stepName, stepDescription, realStepDuration } =
      validatedFields.data;

    const stepsIntitules = steps.map((e) => e.intitule);
    const stepsDetails = steps.map((e) => e.details);

    if (stepsIntitules.includes(stepName) && variant === "creating") {
      setIsCreateOrUpdateStepDone(true);
      return setCreateOrUpdateMomentState({
        stepsMessage: DEFAULT_STEP_MESSAGE,
        stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
        errors: {
          stepName: [
            "Vous ne pouvez pas créer deux étapes du même nom sur le même moment.",
          ],
        },
      });
    }

    if (stepsDetails.includes(stepDescription) && variant === "creating") {
      setIsCreateOrUpdateStepDone(true);
      return setCreateOrUpdateMomentState({
        stepsMessage: DEFAULT_STEP_MESSAGE,
        stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
        errors: {
          stepDescription: [
            "Vous ne pouvez pas vraiment créer deux étapes avec les mêmes détails sur le même moment.",
          ],
        },
      });
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

    setIsCreateOrUpdateStepDone(true);
    return setCreateOrUpdateMomentState(null);
  });
};

export const resetStepActionflow = (
  event: FormEvent<HTMLFormElement>,
  startResetStepTransition: TransitionStartFunction,
  setDuree: Dispatch<SetStateAction<string>>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
) => {
  startResetStepTransition(() => {
    if (
      // @ts-ignore Typescript unaware of explicitOriginalTarget (but is correct in some capacity because mobile did not understand)
      event.nativeEvent.explicitOriginalTarget?.form?.id ===
      STEP_FORM_ID.creating
    ) {
      if (confirm("Êtes-vous sûr de vouloir réinitialiser cette étape ?")) {
        setDuree(STEP_DURATION_DEFAULT);
        setCreateOrUpdateMomentState(null);
      } else event.preventDefault();
    } else {
      setDuree(STEP_DURATION_DEFAULT);
      setCreateOrUpdateMomentState(null);
    }
  });
};

export const deleteStepActionflow = (
  startDeleteStepTransition: TransitionStartFunction,
  steps: StepFromCRUD[],
  currentStepId: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
) => {
  if (confirm("Êtes-vous sûr de vouloir effacer cette étape ?")) {
    startDeleteStepTransition(() => {
      let newSteps = steps.filter((step) => step.id !== currentStepId);
      setSteps(newSteps);

      setCreateOrUpdateMomentState(null);

      if (newSteps.length === 0) setStepVisible("creating");
      else setStepVisible("create");
    });
  }
};
