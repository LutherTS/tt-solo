import { revalidatePath } from "next/cache";
import { add, compareDesc, roundToNearestHours, sub } from "date-fns";

import {
  dateToInputDatetime,
  makeStepsCompoundDurationsArray,
} from "../../utilities/moments";
import { CreateOrUpdateMomentSchema } from "../../validations/moments";
import { findMomentByNameAndUserId } from "../../reads/moments";
import { findDestinationIdByNameAndUserId } from "../../reads/destinations";
import {
  createMomentAndDestination,
  createMomentFromFormData,
  deleteMomentByMomentId,
  updateMomentAndDestination,
  updateMomentFromFormData,
} from "../../writes/moments";
import {
  createStepFromSteps,
  deleteMomentStepsByMomentId,
} from "../../writes/steps";
import {
  MomentFormVariant,
  MomentToCRUD,
  SelectMomentId,
  StepFromCRUD,
} from "../../types/moments";
import { SelectUserIdAndUsername } from "../../types/users";

const DEFAULT_MOMENT_MESSAGE =
  "Erreurs sur le renseignement moment du formulaire.";
const DEFAULT_MOMENT_SUBMESSAGE = "Veuillez vérifier les champs concernés.";

const NO_STEPS_ERROR_MESSAGE =
  "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.";

// Differences in naming. For server actions, it's createOrUpdateMomentFlow. For their client actions counterpart, it's createOrUpdateMomentActionflow.

// return types not needed as long as its careful connected to the action(s)
export const trueCreateOrUpdateMomentFlow = async (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  user: SelectUserIdAndUsername,
) => {
  if (variant === "creating") {
    const currentNow = dateToInputDatetime(new Date());
    const minFromCurrentNow = dateToInputDatetime(
      roundToNearestHours(sub(currentNow, { hours: 1 }), {
        roundingMethod: "floor",
      }),
    );
    const isStartMomentDateBeforeMinFromCurrentNow = compareDesc(
      startMomentDate,
      minFromCurrentNow,
    );

    if (isStartMomentDateBeforeMinFromCurrentNow === 1)
      return {
        momentMessage: DEFAULT_MOMENT_MESSAGE,
        momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
        errors: {
          momentStartDateAndTime: [
            "Vous ne pouvez pas créer un moment qui commence environ plus d'une heure avant sa création.",
          ],
        },
      };
  }

  let destination = !destinationSelect
    ? formData.getAll("destination")[0]
    : formData.getAll("destination")[1];
  if (destination === null) {
    return {
      momentMessage: DEFAULT_MOMENT_MESSAGE,
      momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
      errors: {
        destinationName: [
          "Veuillez choisir ou alors décrire une destination valide.",
        ],
      },
    };
  }

  let activite = !activitySelect
    ? formData.getAll("activite")[0]
    : formData.getAll("activite")[1];
  if (activite === null) {
    return {
      momentMessage: DEFAULT_MOMENT_MESSAGE,
      momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
      errors: {
        destinationName: [
          "Veuillez choisir ou alors décrire une activité valide.",
        ],
      },
    };
  }

  let objectif = formData.get("objectif");
  let indispensable = !!formData.get("indispensable");
  let contexte = formData.get("contexte");

  if (
    typeof destination !== "string" ||
    typeof activite !== "string" ||
    typeof objectif !== "string" ||
    typeof contexte !== "string" ||
    typeof indispensable !== "boolean"
  )
    return {
      momentMessage: "Erreur sur le renseignement du formulaire.",
      momentSubMessage:
        "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
    };

  const [
    trimmedDestination,
    trimmedActivite,
    trimmedObjectif,
    trimmedContexte,
  ] = [destination, activite, objectif, contexte].map((e) => e.trim());

  const validatedFields = CreateOrUpdateMomentSchema.safeParse({
    destinationName: trimmedDestination,
    momentActivity: trimmedActivite,
    momentName: trimmedObjectif,
    momentIsIndispensable: indispensable,
    momentDescription: trimmedContexte,
    momentStartDateAndTime: startMomentDate,
  });

  if (!validatedFields.success) {
    return {
      momentMessage: DEFAULT_MOMENT_MESSAGE,
      momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (steps.length === 0) {
    return {
      stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
      stepsSubMessage: NO_STEPS_ERROR_MESSAGE,
    };
  }

  const {
    destinationName,
    momentActivity,
    momentName,
    momentIsIndispensable,
    momentDescription,
    momentStartDateAndTime,
  } = validatedFields.data;

  destination = destinationName;
  activite = momentActivity;
  objectif = momentName;
  indispensable = momentIsIndispensable;
  contexte = momentDescription;
  startMomentDate = momentStartDateAndTime;

  // For this reason below alone I thing actions should be inline and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
  // So what should be in separated files are not the actions, but rather the methods that make the action, (! or even the flows of these methods !) which therefore can be used in any action. The methods should be the commonalities, not the actions themselves. Actions can and I believe should be directly link to the actual pages where they're meant to be triggered, like temporary APIs only available within their own contexts.

  // I insist on the flows because what is currently below could be just be an entire flow that could be plugged in anywhere an action needs it. (Actually I effectively turned the entire flow into a function.)

  if (!user)
    return {
      momentMessage: "Erreur.",
      momentSubMessage:
        "L'utilisateur vous correspondant n'a pas été retrouvé en interne.",
    };

  // That being said though, once authentication is in place I will still need to check if the user is valid at time of the action, if the action mutates the data. (Which honestly is always a prerequisite.)

  const userId = user.id;

  let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

  if (variant === "creating") {
    const preexistingMoment = await findMomentByNameAndUserId(objectif, userId);

    if (preexistingMoment)
      return {
        momentMessage: DEFAULT_MOMENT_MESSAGE,
        momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
        errors: {
          momentName: ["Vous avez déjà un moment de ce même nom."],
        },
      };

    // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their own if statements.

    // error handling needed eventually
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    let moment: SelectMomentId;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

      // error handling needed eventually
      moment = await createMomentFromFormData(
        activite,
        objectif,
        indispensable,
        contexte,
        startMomentDate,
        duration,
        destinationId,
        userId,
      );
    } else {
      // error handling needed eventually
      moment = await createMomentAndDestination(
        activite,
        objectif,
        indispensable,
        contexte,
        startMomentDate,
        duration,
        destination,
        userId,
      );
    }

    const momentId = moment.id;

    await createStepsInCreateOrUpdateMomentFlow(
      steps,
      startMomentDate,
      momentId,
    );
  }

  if (variant === "updating") {
    if (!momentFromCRUD)
      return {
        momentMessage: "Erreur.",
        momentSubMessage: "Le moment n'a pas été réceptionné en interne.",
      };

    let momentId = momentFromCRUD.id;

    // error handling needed eventually
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    let moment: SelectMomentId;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

      // error handling needed eventually
      moment = await updateMomentFromFormData(
        activite,
        objectif,
        indispensable,
        contexte,
        startMomentDate,
        duration,
        destinationId,
        momentId,
        userId,
      );
    } else {
      // error handling needed eventually
      moment = await updateMomentAndDestination(
        activite,
        objectif,
        indispensable,
        contexte,
        startMomentDate,
        duration,
        destination,
        userId,
        momentId,
      );
    }

    momentId = moment.id;

    // error handling needed eventually
    await deleteMomentStepsByMomentId(momentId);

    await createStepsInCreateOrUpdateMomentFlow(
      steps,
      startMomentDate,
      momentId,
    );
  }

  const username = user.username;

  revalidatePath(`/users/${username}/moments`);

  return null;
};

const createStepsInCreateOrUpdateMomentFlow = async (
  steps: StepFromCRUD[],
  momentDate: string,
  momentId: string,
) => {
  let i = 1;

  const stepsCompoundDurations = makeStepsCompoundDurationsArray(steps);

  for (let j = 0; j < steps.length; j++) {
    const step = steps[j];

    const startDateAndTime =
      j === 0
        ? momentDate
        : dateToInputDatetime(
            add(momentDate, { minutes: stepsCompoundDurations[j - 1] }),
          );

    const endDateAndTime = dateToInputDatetime(
      add(momentDate, { minutes: stepsCompoundDurations[j] }),
    );

    // error handling needed eventually
    await createStepFromSteps(
      i,
      step.intitule,
      step.details,
      startDateAndTime,
      step.duree,
      endDateAndTime,
      momentId,
    );

    i++;
  }
};

export const deleteMomentFlow = async (
  momentFromCRUD: MomentToCRUD | undefined,
  user: SelectUserIdAndUsername,
) => {
  if (!momentFromCRUD)
    return {
      momentMessage: "Erreur.",
      momentSubMessage: "Le moment n'a pas été réceptionné en interne.",
    };

  const momentId = momentFromCRUD.id;

  // error handling needed eventually
  await deleteMomentByMomentId(momentId);

  const username = user.username;

  revalidatePath(`/users/${username}/moments`);

  return null;
};

export const revalidateMomentsFlow = async (user: SelectUserIdAndUsername) => {
  const username = user.username;

  revalidatePath(`/users/${username}/moments`);
  // guess I'm keeping void for actions that really return nothingness
};
