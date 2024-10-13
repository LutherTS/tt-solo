import { STEP_DURATION_DEFAULT, STEP_FORM_ID } from "@/app/data/moments";
import {
  CreateOrUpdateMomentState,
  DeleteMoment,
  MomentFormVariant,
  MomentToCRUD,
  StepFormVariant,
  StepFromCRUD,
  StepVisible,
  TrueCreateOrUpdateMoment,
  TrueCreateOrUpdateMomentState,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  roundTimeUpTenMinutes,
} from "@/app/utilities/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  Dispatch,
  FormEvent,
  MouseEvent,
  SetStateAction,
  TransitionStartFunction,
} from "react";

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
    button.form?.reset(); // Indeed.
  });
};

// the reason why I'm having to have all these as arguments is because formData is broken in the current React 19
export const createOrUpdateMomentActionflow = async (
  startCreateOrUpdateMomentTransition: TransitionStartFunction,
  createOrUpdateMomentBound: () => Promise<CreateOrUpdateMomentState>,
  setDestinationTextControlled: Dispatch<SetStateAction<string>>,
  setActiviteTextControlled: Dispatch<SetStateAction<string>>,
  setDestinationSelect: Dispatch<SetStateAction<boolean>>,
  setActivitySelect: Dispatch<SetStateAction<boolean>>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  variant: MomentFormVariant,
  setIndispensable: Dispatch<SetStateAction<boolean>>,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  nowRoundedUpTenMinutes: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setDestinationOptionControlled: Dispatch<SetStateAction<string>>,
  setActiviteOptionControlled: Dispatch<SetStateAction<string>>,
  setObjectifControlled: Dispatch<SetStateAction<string>>,
  setContexteControlled: Dispatch<SetStateAction<string>>,
  setIsCreateOrUpdateMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  startCreateOrUpdateMomentTransition(async () => {
    const state = await createOrUpdateMomentBound();
    if (state) {
      // watch this
      // aligning the text of controlled with the option or whatever value was provided (trimmed)
      if (state.selectBug?.destinationName)
        setDestinationTextControlled(state.selectBug.destinationName);
      if (state.selectBug?.momentActivity)
        setActiviteTextControlled(state.selectBug.momentActivity);
      // returning to the text version, so that shifting back to the select version will automatically set back to the proper value
      setDestinationSelect(false);
      setActivitySelect(false);
      // but what solving this specifically means is... you can never use selects on their own with the current state of React 19

      setIsCreateOrUpdateMomentDone(true);
      return setCreateOrUpdateMomentState(state);
    } else {
      if (variant === "creating") {
        setIndispensable(false);
        setStartMomentDate(nowRoundedUpTenMinutes);
        setSteps([]);
        setStepVisible("creating");

        setDestinationTextControlled("");
        setDestinationOptionControlled("");
        setActiviteTextControlled("");
        setActiviteOptionControlled("");
        setObjectifControlled("");
        setContexteControlled("");
      }

      setIsCreateOrUpdateMomentDone(true);
      return setCreateOrUpdateMomentState(null);
    }
  });
};

export const trueCreateOrUpdateMomentActionflow = async (
  event: FormEvent<HTMLFormElement>,
  startCreateOrUpdateMomentTransition: TransitionStartFunction,
  trueCreateOrUpdateMoment: TrueCreateOrUpdateMoment,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  nowRoundedUpTenMinutes: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setIsCreateOrUpdateMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  startCreateOrUpdateMomentTransition(async () => {
    event.preventDefault();
    // if the formData is now obtained from the event, I'll need to bind the action inside the startTransition, which in and out of itself is more relevant than binding it in the open for nothing
    const trueCreateOrUpdateMomentBound = trueCreateOrUpdateMoment.bind(
      null,
      new FormData(event.currentTarget),
      variant,
      startMomentDate,
      steps,
      momentFromCRUD,
    );
    const trueState = await trueCreateOrUpdateMomentBound();
    if (trueState) {
      setIsCreateOrUpdateMomentDone(true);
      return setCreateOrUpdateMomentState(trueState);
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

export const deleteMomentActionflow = async (
  startDeleteMomentTransition: TransitionStartFunction,
  deleteMomentBound: () => Promise<CreateOrUpdateMomentState>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  setIsDeleteMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  startDeleteMomentTransition(async () => {
    if (confirm("Êtes-vous sûr de vouloir effacer ce moment ?")) {
      if (deleteMomentBound) {
        const state = await deleteMomentBound();
        if (state) {
          setIsDeleteMomentDone(true);
          return setCreateOrUpdateMomentState(state);
        } else {
          setIsDeleteMomentDone(true);
          return setCreateOrUpdateMomentState(null);
        }
      }
    }
  });
};

export const trueDeleteMomentActionflow = async (
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

// reset is only on the create variant of MomentForms
export const resetMomentFormActionflow = (
  event: FormEvent<HTMLFormElement>,
  startResetMomentFormTransition: TransitionStartFunction,
  setIndispensable: Dispatch<SetStateAction<boolean>>,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setDestinationTextControlled: Dispatch<SetStateAction<string>>,
  setDestinationOptionControlled: Dispatch<SetStateAction<string>>,
  setActiviteTextControlled: Dispatch<SetStateAction<string>>,
  setActiviteOptionControlled: Dispatch<SetStateAction<string>>,
  setObjectifControlled: Dispatch<SetStateAction<string>>,
  setContexteControlled: Dispatch<SetStateAction<string>>,
  setIntituleCreateControlled: Dispatch<SetStateAction<string>>,
  setDetailsCreateControlled: Dispatch<SetStateAction<string>>,
  setDureeCreateControlled: Dispatch<SetStateAction<string>>,
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

      setIndispensable(false);

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

      setDestinationTextControlled("");
      setDestinationOptionControlled("");
      setActiviteTextControlled("");
      setActiviteOptionControlled("");
      setObjectifControlled("");
      setContexteControlled("");

      setIntituleCreateControlled("");
      setDetailsCreateControlled("");
      setDureeCreateControlled("10");

      setCreateOrUpdateMomentState(null); // the jumping culprit, but in the end a different solution below ignores the issue (irregular defaults)

      // for the useEffect
      setIsResetMomentFormDone(true);

      // to "reset" the InputSwitchKey
      setInputSwitchKey(window.crypto.randomUUID());
    } else event.preventDefault();
  });
};

// inFlow

export const trueResetMomentFormActionflow = (
  event: FormEvent<HTMLFormElement>,
  startResetMomentFormTransition: TransitionStartFunction,
  // setIndispensable: Dispatch<SetStateAction<boolean>>,
  setStartMomentDate: Dispatch<SetStateAction<string>>,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  // setDestinationTextControlled: Dispatch<SetStateAction<string>>,
  // setDestinationOptionControlled: Dispatch<SetStateAction<string>>,
  // setActiviteTextControlled: Dispatch<SetStateAction<string>>,
  // setActiviteOptionControlled: Dispatch<SetStateAction<string>>,
  // setObjectifControlled: Dispatch<SetStateAction<string>>,
  // setContexteControlled: Dispatch<SetStateAction<string>>,
  // setIntituleCreateControlled: Dispatch<SetStateAction<string>>,
  // setDetailsCreateControlled: Dispatch<SetStateAction<string>>,
  // setDureeCreateControlled: Dispatch<SetStateAction<string>>,
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

      const stepFormCreating = document.getElementById(
        STEP_FORM_ID.creating,
      ) as HTMLFormElement | null;
      stepFormCreating?.reset();

      setCreateOrUpdateMomentState(null); // the jumping culprit, but in the end a different solution below ignores the issue (irregular defaults)

      // to "reset" the InputSwitchKey
      setInputSwitchKey(window.crypto.randomUUID());

      // for the useEffect
      setIsResetMomentFormDone(true);
    } else event.preventDefault();
  });
};

export const createOrUpdateStepActionflow = (
  startCreateOrUpdateStepTransition: TransitionStartFunction,
  intitule: string,
  details: string,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  duree: string,
  steps: StepFromCRUD[],
  variant: StepFormVariant,
  currentStepId: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
  setIntitule: Dispatch<SetStateAction<string>>,
  setDetails: Dispatch<SetStateAction<string>>,
  setDuree: Dispatch<SetStateAction<string>>,
  setIsCreateOrUpdateStepDone: Dispatch<SetStateAction<boolean>>,
) => {
  startCreateOrUpdateStepTransition(() => {
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
    if (variant === "creating") id = window.crypto.randomUUID();
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

    setIntitule("");
    setDetails("");
    setDuree("10");

    setIsCreateOrUpdateStepDone(true);
    return setCreateOrUpdateMomentState(null);
  });
};

export const trueCreateOrUpdateStepActionflow = (
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
    if (variant === "creating") id = window.crypto.randomUUID();
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
    SetStateAction<TrueCreateOrUpdateMomentState>
  >,
) => {
  startResetStepTransition(() => {
    if (
      // @ts-ignore Typescript unaware of explicitOriginalTarget
      event.nativeEvent.explicitOriginalTarget.form?.id ===
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
  // later find a way to only show this on create?
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
