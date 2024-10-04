import {
  CreateOrUpdateMomentState,
  MomentFormVariant,
  StepFormVariant,
  StepFromCRUD,
  StepVisible,
  SubView,
  View,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  roundTimeUpTenMinutes,
  setScrollToTop,
} from "@/app/utilities/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";
import { compareAsc, compareDesc } from "date-fns";
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

export const revalidateMomentsActionFlow = async (
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

// the reason why I'm having to have all these are arguments is because formData is broken in the current React 19
export const createOrUpdateMomentActionFlow = async (
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
  endMomentDate: string,
  now: string,
  setSubView: Dispatch<SetStateAction<SubView>>,
  startMomentDate: string,
  setView: Dispatch<SetStateAction<View>>,
) => {
  startCreateOrUpdateMomentTransition(async () => {
    const state = await createOrUpdateMomentBound();
    if (state) {
      // watch this
      // aligning the text of controlled with the option or whatever value was provided (trimmed)
      if (state.bs?.destinationName)
        setDestinationTextControlled(state.bs.destinationName);
      if (state.bs?.momentActivity)
        setActiviteTextControlled(state.bs.momentActivity);
      // returning to the text version, so that shifting back to the select version will automatically set back to the proper value
      setDestinationSelect(false);
      setActivitySelect(false);
      // but what solving this specifically means is... you can never use selects on their own with the current state of React 19

      return setCreateOrUpdateMomentState(state);
    }

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

    // this now works thanks to export const dynamic = "force-dynamic";
    // ...I think
    if (compareDesc(endMomentDate, now) === 1) setSubView("past-moments");
    else if (compareAsc(startMomentDate, now) === 1)
      setSubView("future-moments");
    // therefore present by default
    else setSubView("current-moments");

    setScrollToTop("read-moments", setView);
    // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
  });
};

export const deleteMomentActionFlow = async (
  startDeleteMomentTransition: TransitionStartFunction,
  deleteMomentBound: () => Promise<CreateOrUpdateMomentState>,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  setView: Dispatch<SetStateAction<View>>,
) => {
  startDeleteMomentTransition(async () => {
    if (confirm("Êtes-vous sûr que vous voulez effacer ce moment ?")) {
      if (deleteMomentBound) {
        const state = await deleteMomentBound();
        if (state) return setCreateOrUpdateMomentState(state);

        setScrollToTop("read-moments", setView);
      }
    }
  });
};

// reset is only on the create variant of MomentForms
export const resetMomentFormActionFlow = (
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
) => {
  startResetMomentFormTransition(() => {
    if (
      confirm("Êtes-vous sûr que vous voulez réinitialiser le formulaire ?")
    ) {
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
    } else event.preventDefault();
  });
};

// shift everything steps to the steps file... when I'll need to

export const createOrUpdateStepActionFlow = (
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
    if (typeof intitule !== "string" || typeof details !== "string")
      return setCreateOrUpdateMomentState({
        stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
        stepsSubMessage:
          "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
      });

    const [trimmedIntitule, trimmedDetails] = [intitule, details].map((e) =>
      e.trim(),
    );

    const numberedDuree = +duree;

    const validatedFields = CreateOrUpdateStepSchema.safeParse({
      stepName: trimmedIntitule,
      stepDescription: trimmedDetails,
      trueStepDuration: numberedDuree,
    });

    if (!validatedFields.success) {
      return setCreateOrUpdateMomentState({
        stepsMessage: DEFAULT_STEP_MESSAGE,
        stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
        errors: validatedFields.error.flatten().fieldErrors,
      });
    }

    const { stepName, stepDescription, trueStepDuration } =
      validatedFields.data;

    const stepsIntitules = steps.map((e) => e.intitule);
    const stepsDetails = steps.map((e) => e.details);

    if (stepsIntitules.includes(stepName)) {
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
    if (stepsDetails.includes(stepDescription)) {
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
    duree = trueStepDuration.toString();

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
  });
};

export const deleteStepActionFlow = (
  startDeleteStepTransition: TransitionStartFunction,
  steps: StepFromCRUD[],
  currentStepId: string,
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>,
  setStepVisible: Dispatch<SetStateAction<StepVisible>>,
) => {
  // later find a way to only show this on create (by this Friday when I'll show to Mohamed)
  if (confirm("Êtes-vous sûr que vous voulez effacer cette étape ?")) {
    startDeleteStepTransition(() => {
      let newSteps = steps.filter((step) => step.id !== currentStepId);
      setSteps(newSteps);
      if (newSteps.length === 0) setStepVisible("creating");
      else setStepVisible("create");
    });
  }
};
