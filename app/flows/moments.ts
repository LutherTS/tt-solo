import { compareDesc, roundToNearestHours, sub } from "date-fns";
import { dateToInputDatetime } from "../utilities/moments";
import { CreateOrUpdateMomentSchema } from "../validations/moments";
import { findMomentByNameAndUserId } from "../reads/moments";
import { findDestinationIdByNameAndUserId } from "../reads/destinations";
import { Prisma } from "@prisma/client";
import {
  createMomentAndDestination,
  createMomentFromFormData,
  updateMomentAndDestination,
  updateMomentFromFormData,
} from "../writes/moments";
import { createStepsFromStepsFlow } from "../utilities/steps";
import { deleteMomentStepsByMomentId } from "../writes/steps";
import { revalidatePath } from "next/cache";
import {
  CreateOrUpdateMomentState,
  MomentToCRUD,
  StepFromCRUD,
} from "../types/moments";
import { selectMomentId } from "../reads/subreads/moments";
import { selectUserIdAndUsername } from "../reads/subreads/users";

const DEFAULT_MOMENT_MESSAGE =
  "Erreurs sur le renseignement moment du formulaire.";
const DEFAULT_MOMENT_SUBMESSAGE = "Veuillez vérifier les champs concernés.";

const NO_STEPS_ERROR_MESSAGE =
  "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.";

// I'll fix the flow afterwards, for now I want a 1:1 from the original
export const createOrUpdateMomentFlow = async (
  variant: "creating" | "updating",
  indispensable: boolean,
  momentDate: string,
  steps: StepFromCRUD[],
  destination: string,
  activite: string,
  objectif: string,
  contexte: string,
  momentFromCRUD: MomentToCRUD | undefined,
  user: Prisma.UserGetPayload<{
    select: typeof selectUserIdAndUsername;
  }> | null,
): Promise<CreateOrUpdateMomentState> => {
  const currentNow = dateToInputDatetime(new Date());
  const minFromCurrentNow = dateToInputDatetime(
    roundToNearestHours(sub(currentNow, { hours: 1 }), {
      roundingMethod: "floor",
    }),
  );
  const isMomentDateBeforeMinFromCurrentNow = compareDesc(
    momentDate,
    minFromCurrentNow,
  );

  if (isMomentDateBeforeMinFromCurrentNow === 1)
    return {
      momentMessage: DEFAULT_MOMENT_MESSAGE,
      momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
      errors: {
        momentStartDateAndTime: [
          "Vous ne pouvez pas créer un moment qui commence environ plus d'une heure avant sa création.",
        ],
      },
      bs: {
        destinationName: destination,
        momentActivity: activite,
      },
    };

  // testing...
  // return { message: "I'm testing things here." };
  // It works and with that, I now know my way around useTransition.

  // destination, activite, objectif and contexte are now controlled
  if (
    typeof destination !== "string" ||
    typeof activite !== "string" ||
    typeof objectif !== "string" ||
    typeof contexte !== "string"
  )
    return {
      momentMessage: "Erreur sur le renseignement du formulaire.",
      momentSubMessage:
        "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
      bs: {
        destinationName: destination,
        momentActivity: activite,
      },
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
    momentStartDateAndTime: momentDate,
  });

  if (!validatedFields.success) {
    return {
      momentMessage: DEFAULT_MOMENT_MESSAGE,
      momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
      errors: validatedFields.error.flatten().fieldErrors,
      bs: {
        destinationName: trimmedDestination,
        momentActivity: trimmedActivite,
      },
    };
  }

  if (steps.length === 0) {
    return {
      stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
      stepsSubMessage: NO_STEPS_ERROR_MESSAGE,
      bs: {
        destinationName: trimmedDestination,
        momentActivity: trimmedActivite,
      },
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
  momentDate = momentStartDateAndTime;

  // For this reason below alone I thing actions should be inline and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
  // So what should be in separated files are not the actions, but rather the methods that make the action, (! or even the flows of these methods !)which therefore can be used in any action. The methods should be the commonalities, not the actions themselves. Actions can and I believe should be directly link to the actual pages where they're meant to be triggered, like temporary APIs only available within their own contexts.

  // I insist on the flows because what is currently below could be just be an entire flow that could be plugged in anywhere an action needs it.

  if (!user)
    return {
      momentMessage: "Erreur.",
      momentSubMessage:
        "L'utilisateur vous correspondant n'a pas été retrouvé en interne.",
      bs: {
        // sticking to the trimmed version for now because hopefully, very hopefully, this workaround will no longer be needed by October 24
        destinationName: trimmedDestination,
        momentActivity: trimmedActivite,
      },
    };

  const userId = user.id;

  let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

  const map: Map<number, number> = new Map();
  let durationTotal = 0;
  for (let j = 0; j < steps.length; j++) {
    durationTotal += +steps[j].duree;
    map.set(j, durationTotal);
  }

  if (variant === "creating") {
    const preexistingMoment = await findMomentByNameAndUserId(objectif, userId);

    if (preexistingMoment)
      return {
        momentMessage: DEFAULT_MOMENT_MESSAGE,
        momentSubMessage: DEFAULT_MOMENT_SUBMESSAGE,
        errors: {
          momentName: ["Vous avez déjà un moment de ce même nom."],
        },
        bs: {
          destinationName: trimmedDestination,
          momentActivity: trimmedActivite,
        },
      };
    // It worked... But then the form reset.
    // https://github.com/facebook/react/issues/29034
    // That's where we're considering going back to Remix.
    // Or I'm basically going to have to control every single field (they're only four so it's okayish), and send their data from the controlled output. This is so dumb but hey, that's what you get from living dangerously.
    // Done. I've just controlled every single field.

    // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their single if statements.

    // error handling needed eventually
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    let moment: Prisma.MomentGetPayload<{
      select: typeof selectMomentId;
    }>;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

      // error handling needed eventually
      moment = await createMomentFromFormData(
        activite,
        objectif,
        indispensable,
        contexte,
        momentDate,
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
        momentDate,
        duration,
        destination,
        userId,
      );
    }

    const momentId = moment.id;

    await createStepsFromStepsFlow(steps, momentDate, map, momentId);
  }

  if (variant === "updating") {
    if (!momentFromCRUD)
      return {
        momentMessage: "Erreur.",
        momentSubMessage: "Le moment n'a pas été réceptionné en interne.",
        bs: {
          destinationName: trimmedDestination,
          momentActivity: trimmedActivite,
        },
      };

    let momentId = momentFromCRUD.id;

    // error handling needed eventually
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    let moment: Prisma.MomentGetPayload<{
      select: typeof selectMomentId;
    }>;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

      // error handling needed eventually
      moment = await updateMomentFromFormData(
        activite,
        objectif,
        indispensable,
        contexte,
        momentDate,
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
        momentDate,
        duration,
        destination,
        userId,
        momentId,
      );
    }

    momentId = moment.id;

    // error handling needed eventually
    await deleteMomentStepsByMomentId(momentId);

    await createStepsFromStepsFlow(steps, momentDate, map, momentId);
  }

  const username = user.username;

  revalidatePath(`/users/${username}/moments`);

  return null;
};
