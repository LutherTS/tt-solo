import { revalidatePath } from "next/cache";
import {
  add,
  compareAsc,
  compareDesc,
  isValid,
  roundToNearestHours,
  sub,
} from "date-fns";

import {
  dateToInputDatetime,
  makeConditionalSuccessStateProperties,
  makeStepsCompoundDurationsArray,
} from "@/app/utilities/moments";
import { CreateOrUpdateMomentSchema } from "@/app/validations/moments";
import {
  countUserCurrentMomentsShownBeforeMoment,
  countUserFutureMomentsShownBeforeMoment,
  countUserPastMomentsShownBeforeMoment,
  findMomentByIdAndUserId,
  findMomentByNameAndUserId,
} from "@/app/reads/moments";
import { findDestinationIdByNameAndUserId } from "@/app/reads/destinations";
import {
  createMomentAndDestination,
  createMomentFromFormData,
  deleteMomentByMomentId,
  updateMomentAndDestination,
  updateMomentFromFormData,
} from "@/app/writes/moments";
import {
  createStepFromSteps,
  deleteMomentStepsByMomentId,
} from "@/app/writes/steps";
import {
  CreateOrUpdateMomentError,
  FalseCreateOrUpdateMomentState,
  CreateOrUpdateMomentSuccess,
  MomentFormVariant,
  MomentToCRUD,
  SelectMomentIdNameAndDates,
  StepFromClient,
  MomentAdapted,
  SubView,
} from "@/app/types/moments";
import { SelectUserIdAndUsername } from "@/app/types/users";
import { defaultMomentErrorMessages, subViews } from "@/app/data/moments";
import { decodeHashidToUUID } from "@/app/utilities/globals";

// Differences in naming. For server actions, it's createOrUpdateMomentFlow. For their client actions counterpart, it's createOrUpdateMomentActionflow.
// Now shifting to ServerFlow, ClientFlow, AfterFlow.

// Some errors to me are like showstoppers, they erase all other errors to single-handedly focus on themselves.

export const falserCreateOrUpdateMomentServerFlow = async (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  user: SelectUserIdAndUsername,
): Promise<FalseCreateOrUpdateMomentState> => {
  let currentNow = dateToInputDatetime(new Date());

  // in case somehow startMomentDate is not sent correctly
  if (!isValid(new Date(startMomentDate)))
    return {
      momentMessages: {
        message: defaultMomentErrorMessages.MESSAGE,
        subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
      },
      momentErrors: {
        momentStartDateAndTime: ["Veuillez saisir une date valide."],
      },
      errorScrollPriority: "moment",
    };

  if (variant === "creating") {
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
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          momentStartDateAndTime: [
            "Vous ne pouvez pas créer un moment qui commence environ plus d'une heure avant sa création.",
          ],
        },
        errorScrollPriority: "moment",
      };
  }

  let destination = !destinationSelect
    ? formData.getAll("destination")[0]
    : formData.getAll("destination")[1];
  if (destination === null) {
    return {
      momentMessages: {
        message: defaultMomentErrorMessages.MESSAGE,
        subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
      },
      momentErrors: {
        destinationName: [
          "Veuillez choisir ou alors décrire une destination valide.",
        ],
      },
      errorScrollPriority: "moment",
    };
  }

  let activite = !activitySelect
    ? formData.getAll("activite")[0]
    : formData.getAll("activite")[1];
  if (activite === null) {
    return {
      momentMessages: {
        message: defaultMomentErrorMessages.MESSAGE,
        subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
      },
      momentErrors: {
        destinationName: [
          "Veuillez choisir ou alors décrire une activité valide.",
        ],
      },
      errorScrollPriority: "moment",
    };
  }

  let objectif = formData.get("objectif");
  let indispensable = !!formData.get("indispensable");
  let contexte = formData.get("contexte");

  if (
    typeof destination !== "string" ||
    typeof activite !== "string" ||
    typeof objectif !== "string" ||
    typeof indispensable !== "boolean" ||
    typeof contexte !== "string" ||
    typeof startMomentDate !== "string"
  )
    return {
      momentMessages: {
        message: "Erreur sur le renseignement du formulaire.",
        subMessage:
          "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
      },
      momentErrors: {},
      stepsMessages: {},
      stepsErrors: {},
      errorScrollPriority: "moment",
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
      momentMessages: {
        message: defaultMomentErrorMessages.MESSAGE,
        subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
      },
      momentErrors: validatedFields.error.flatten().fieldErrors,
      errorScrollPriority: "moment",
    };
  }

  if (steps.length === 0) {
    return {
      momentMessages: {},
      momentErrors: {},
      stepsMessages: {
        message: "Erreur sur le renseignement étapes du formulaire.",
        subMessage:
          "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.",
      },
      stepsErrors: {},
      errorScrollPriority: "steps",
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

  // I insist on the flows because what is currently below could just be an entire flow that could be plugged in any action needs it. (Actually I effectively turned the entire flow into a function.)

  if (!user)
    return {
      momentMessages: {
        message: "Erreur.",
        subMessage:
          "L'utilisateur vous correspondant n'a pas été retrouvé en interne.",
      },
      momentErrors: {},
      stepsMessages: {},
      stepsErrors: {},
      errorScrollPriority: "moment",
    };

  // That being said though, once authentication is in place I will still need to check if the user is valid a.k.a. authorized at time of the action, if the action mutates the data. (Which honestly is always a prerequisite.)

  const userId = user.id;

  let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

  let moment: SelectMomentIdNameAndDates;

  if (variant === "creating") {
    const preexistingMoment = await findMomentByNameAndUserId(objectif, userId);

    if (preexistingMoment)
      return {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          momentName: ["Vous avez déjà un moment de ce même nom."],
        },
        errorScrollPriority: "moment",
      };

    // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their own if statements.

    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await createStepsSubFlow(steps, startMomentDate, momentId);
  } else {
    // if (variant === "updating") {
    if (!momentFromCRUD)
      return {
        momentMessages: {
          message: "Erreur.",
          subMessage: "Le moment n'a pas été réceptionné en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
        errorScrollPriority: "moment",
      };

    let momentId = momentFromCRUD.id;

    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await deleteMomentStepsByMomentId(momentId);

    await createStepsSubFlow(steps, startMomentDate, momentId);
  }

  const username = user.username;

  // revalidatePath should be above since the code below will return the state with its success properties
  revalidatePath(`/users/${username}/moments`);

  // closer to functions reduce inevitable time issues
  currentNow = dateToInputDatetime(new Date());

  if (
    // if the end of the moment is before now, it's subViews.PAST_MOMENTS
    compareDesc(moment.endDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserPastMomentsShownBeforeMoment,
    );
    console.log({
      isSuccess: true,
      success: { moment, countPage, subView: subViews.PAST_MOMENTS },
    });
  } else if (
    // if the start of the moment is after now, it's subViews.FUTURE_MOMENTS
    compareAsc(moment.startDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserFutureMomentsShownBeforeMoment,
    );
    console.log({
      isSuccess: true,
      success: { moment, countPage, subView: subViews.FUTURE_MOMENTS },
    });
  }
  // present by default // else, it can only be subViews.CURRENT_MOMENTS
  else {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserCurrentMomentsShownBeforeMoment,
    );
    console.log({
      isSuccess: true,
      success: { moment, countPage, subView: subViews.CURRENT_MOMENTS },
    });
  } // works
  // I have all the data that I need. I just need to put it in the success portion of the upcoming TrueCreateOrUpdateMomentState.
  // This will include the moment, the subView and the relevant countPage.
  // The URLSearchParams will have subView, and the relevant PAGE number.
  // And I've already created subViewPages for the URL.

  return null;
};

export const falseCreateOrUpdateMomentServerFlow = async (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentToCRUD | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  user: SelectUserIdAndUsername,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  let currentNow = dateToInputDatetime(new Date());

  // in case somehow startMomentDate is not sent correctly
  if (!isValid(new Date(startMomentDate)))
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          momentStartDateAndTime: ["Veuillez saisir une date valide."],
        },
        errorScrollPriority: "moment",
      },
    };

  if (variant === "creating") {
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
        isSuccess: false,
        error: {
          momentMessages: {
            message: defaultMomentErrorMessages.MESSAGE,
            subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
          },
          momentErrors: {
            momentStartDateAndTime: [
              "Vous ne pouvez pas créer un moment qui commence environ plus d'une heure avant sa création.",
            ],
          },
          errorScrollPriority: "moment",
        },
      };
  }

  let destination = !destinationSelect
    ? formData.getAll("destination")[0]
    : formData.getAll("destination")[1];
  if (destination === null) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          destinationName: [
            "Veuillez choisir ou alors décrire une destination valide.",
          ],
        },
        errorScrollPriority: "moment",
      },
    };
  }

  let activite = !activitySelect
    ? formData.getAll("activite")[0]
    : formData.getAll("activite")[1];
  if (activite === null) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          destinationName: [
            "Veuillez choisir ou alors décrire une activité valide.",
          ],
        },
        errorScrollPriority: "moment",
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
    typeof indispensable !== "boolean" ||
    typeof contexte !== "string" ||
    typeof startMomentDate !== "string"
  )
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur sur le renseignement du formulaire.",
          subMessage:
            "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
        errorScrollPriority: "moment",
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
    momentStartDateAndTime: startMomentDate,
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: validatedFields.error.flatten().fieldErrors,
        errorScrollPriority: "moment",
      },
    };
  }

  if (steps.length === 0) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {},
        momentErrors: {},
        stepsMessages: {
          message: "Erreur sur le renseignement étapes du formulaire.",
          subMessage:
            "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.",
        },
        stepsErrors: {},
        errorScrollPriority: "steps",
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
  startMomentDate = momentStartDateAndTime;

  // For this reason below alone I thing actions should be inline and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
  // So what should be in separated files are not the actions, but rather the methods that make the action, (! or even the flows of these methods !) which therefore can be used in any action. The methods should be the commonalities, not the actions themselves. Actions can and I believe should be directly link to the actual pages where they're meant to be triggered, like temporary APIs only available within their own contexts.

  // I insist on the flows because what is currently below could just be an entire flow that could be plugged in any action needs it. (Actually I effectively turned the entire flow into a function.)

  if (!user)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "L'utilisateur vous correspondant n'a pas été retrouvé en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
        errorScrollPriority: "moment",
      },
    };

  // That being said though, once authentication is in place I will still need to check if the user is valid a.k.a. authorized at time of the action, if the action mutates the data. (Which honestly is always a prerequisite.)

  const userId = user.id;

  let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

  let moment: SelectMomentIdNameAndDates;

  if (variant === "creating") {
    const preexistingMoment = await findMomentByNameAndUserId(objectif, userId);

    if (preexistingMoment)
      return {
        isSuccess: false,
        error: {
          momentMessages: {
            message: defaultMomentErrorMessages.MESSAGE,
            subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
          },
          momentErrors: {
            momentName: ["Vous avez déjà un moment de ce même nom."],
          },
          errorScrollPriority: "moment",
        },
      };

    // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their own if statements.

    // IMPORTANT. FOR NOW I HAVEN'T YET ENCODED MY DESTINATION IDS
    // Actually I don't need to decode them here because I use their names as strings deal with destinations in this form, since they're unique per user.
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await createStepsSubFlow(steps, startMomentDate, momentId);
  } else {
    // if (variant === "updating") {
    if (!momentFromCRUD)
      return {
        isSuccess: false,
        error: {
          momentMessages: {
            message: "Erreur.",
            subMessage: "Le moment n'a pas été réceptionné en interne.",
          },
          momentErrors: {},
          stepsMessages: {},
          stepsErrors: {},
          errorScrollPriority: "moment",
        },
      };

    let momentId = decodeHashidToUUID(momentFromCRUD.id);

    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await deleteMomentStepsByMomentId(momentId);

    await createStepsSubFlow(steps, startMomentDate, momentId);
  }

  const username = user.username;

  // revalidatePath should be above since the code below will return the state with its success properties
  revalidatePath(`/users/${username}/moments`);

  // closer to functions reduce inevitable time issues
  currentNow = dateToInputDatetime(new Date());

  if (
    // if the end of the moment is before now, it's subViews.PAST_MOMENTS
    compareDesc(moment.endDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserPastMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true,
      success: { moment, countPage, subView: subViews.PAST_MOMENTS },
    };
  } else if (
    // if the start of the moment is after now, it's subViews.FUTURE_MOMENTS
    compareAsc(moment.startDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserFutureMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true,
      success: { moment, countPage, subView: subViews.FUTURE_MOMENTS },
    };
  }
  // present by default // else, it can only be subViews.CURRENT_MOMENTS
  else {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserCurrentMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true,
      success: { moment, countPage, subView: subViews.CURRENT_MOMENTS },
    };
  }
};

export const createOrUpdateMomentServerFlow = async (
  formData: FormData,
  variant: MomentFormVariant,
  startMomentDate: string,
  steps: StepFromClient[],
  momentFromCRUD: MomentAdapted | undefined,
  destinationSelect: boolean,
  activitySelect: boolean,
  user: SelectUserIdAndUsername,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  let currentNow = dateToInputDatetime(new Date());

  // in case somehow startMomentDate is not sent correctly
  if (!isValid(new Date(startMomentDate)))
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          momentStartDateAndTime: ["Veuillez saisir une date valide."],
        },
        errorScrollPriority: "moment",
      },
    };

  if (variant === "creating") {
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
        isSuccess: false,
        error: {
          momentMessages: {
            message: defaultMomentErrorMessages.MESSAGE,
            subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
          },
          momentErrors: {
            momentStartDateAndTime: [
              "Vous ne pouvez pas créer un moment qui commence environ plus d'une heure avant sa création.",
            ],
          },
          errorScrollPriority: "moment",
        },
      };
  }

  let destination = !destinationSelect
    ? formData.getAll("destination")[0]
    : formData.getAll("destination")[1];
  if (destination === null) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          destinationName: [
            "Veuillez choisir ou alors décrire une destination valide.",
          ],
        },
        errorScrollPriority: "moment",
      },
    };
  }

  let activite = !activitySelect
    ? formData.getAll("activite")[0]
    : formData.getAll("activite")[1];
  if (activite === null) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: {
          destinationName: [
            "Veuillez choisir ou alors décrire une activité valide.",
          ],
        },
        errorScrollPriority: "moment",
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
    typeof indispensable !== "boolean" ||
    typeof contexte !== "string" ||
    typeof startMomentDate !== "string"
  )
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur sur le renseignement du formulaire.",
          subMessage:
            "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
        errorScrollPriority: "moment",
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
    momentStartDateAndTime: startMomentDate,
  });

  if (!validatedFields.success) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: defaultMomentErrorMessages.MESSAGE,
          subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
        },
        momentErrors: validatedFields.error.flatten().fieldErrors,
        errorScrollPriority: "moment",
      },
    };
  }

  if (steps.length === 0) {
    return {
      isSuccess: false,
      error: {
        momentMessages: {},
        momentErrors: {},
        stepsMessages: {
          message: "Erreur sur le renseignement étapes du formulaire.",
          subMessage:
            "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.",
        },
        stepsErrors: {},
        errorScrollPriority: "steps",
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
  startMomentDate = momentStartDateAndTime;

  // For this reason below alone I thing actions should be inline and passed as props instead of housed inside dedicated files. Here, this means data from the user literally never makes it to the client. Sensitive data from a user database entry (and even insensitive data) never even reaches any outside computer. Not even the user's id.
  // So what should be in separated files are not the actions, but rather the methods that make the action, (! or even the flows of these methods !) which therefore can be used in any action. The methods should be the commonalities, not the actions themselves. Actions can and I believe should be directly link to the actual pages where they're meant to be triggered, like temporary APIs only available within their own contexts.

  // I insist on the flows because what is currently below could just be an entire flow that could be plugged in any action needs it. (Actually I effectively turned the entire flow into a function.)

  if (!user)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "L'utilisateur vous correspondant n'a pas été retrouvé en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
        errorScrollPriority: "moment",
      },
    };

  // That being said though, once authentication is in place I will still need to check if the user is valid a.k.a. authorized at time of the action, if the action mutates the data. (Which honestly is always a prerequisite.)

  const userId = user.id;

  let duration = steps.reduce((acc, curr) => acc + +curr.duree, 0).toString();

  let moment: SelectMomentIdNameAndDates;

  if (variant === "creating") {
    const preexistingMoment = await findMomentByNameAndUserId(objectif, userId);

    if (preexistingMoment)
      return {
        isSuccess: false,
        error: {
          momentMessages: {
            message: defaultMomentErrorMessages.MESSAGE,
            subMessage: defaultMomentErrorMessages.SUB_MESSAGE,
          },
          momentErrors: {
            momentName: ["Vous avez déjà un moment de ce même nom."],
          },
          errorScrollPriority: "moment",
        },
      };

    // That's a duplicate with "updating", but "updating" begins different. I insist on having both flows in their own if statements.

    // IMPORTANT. FOR NOW I HAVEN'T YET ENCODED MY DESTINATION IDS
    // Actually I don't need to decode them here because I use their names as strings deal with destinations in this form, since they're unique per user.
    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await createStepsSubFlow(steps, startMomentDate, momentId);
  } else {
    // if (variant === "updating") {
    if (!momentFromCRUD)
      return {
        isSuccess: false,
        error: {
          momentMessages: {
            message: "Erreur.",
            subMessage: "Le moment n'a pas été réceptionné en interne.",
          },
          momentErrors: {},
          stepsMessages: {},
          stepsErrors: {},
          errorScrollPriority: "moment",
        },
      };

    let momentId = decodeHashidToUUID(momentFromCRUD.key);

    const destinationEntry = await findDestinationIdByNameAndUserId(
      destination,
      userId,
    );

    // let moment: SelectMomentIdAndDates;

    if (destinationEntry) {
      const destinationId = destinationEntry.id;

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

    await deleteMomentStepsByMomentId(momentId);

    await createStepsSubFlow(steps, startMomentDate, momentId);
  }

  const success = await createSuccessSubFlow({
    userId,
    moment,
  });

  const username = user.username;

  // revalidatePath should be above since the code below will return the state with its success properties
  revalidatePath(`/users/${username}/moments`);

  return success;
};

const createSuccessSubFlow = async ({
  userId,
  moment,
}: {
  userId: string;
  moment: SelectMomentIdNameAndDates;
}) => {
  // closer to functions reduce inevitable time issues
  const currentNow = dateToInputDatetime(new Date());

  if (
    // if the end of the moment is before now, it's subViews.PAST_MOMENTS
    compareDesc(moment.endDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserPastMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true as true,
      success: { moment, countPage, subView: subViews.PAST_MOMENTS },
    };
  } else if (
    // if the start of the moment is after now, it's subViews.FUTURE_MOMENTS
    compareAsc(moment.startDateAndTime, currentNow) === 1
  ) {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserFutureMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true as true,
      success: { moment, countPage, subView: subViews.FUTURE_MOMENTS },
    };
  }
  // present by default // else, it can only be subViews.CURRENT_MOMENTS
  else {
    const { countPage } = await makeConditionalSuccessStateProperties(
      userId,
      currentNow,
      moment,
      countUserCurrentMomentsShownBeforeMoment,
    );
    return {
      isSuccess: true as true,
      success: { moment, countPage, subView: subViews.CURRENT_MOMENTS },
    };
  }
};

const createStepsSubFlow = async (
  steps: StepFromClient[],
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

export const falserDeleteMomentServerFlow = async (
  momentFromCRUD: MomentToCRUD | undefined,
  user: SelectUserIdAndUsername,
  version?: "v3",
): Promise<FalseCreateOrUpdateMomentState> => {
  if (!momentFromCRUD)
    return {
      momentMessages: {
        message: "Erreur.",
        subMessage: "Le moment n'a pas été réceptionné en interne.",
      },
      momentErrors: {},
      stepsMessages: {},
      stepsErrors: {},
    };

  const momentId = momentFromCRUD.id;

  // verify if the moment still exists at time of deletion
  const moment = await findMomentByIdAndUserId(momentId, user.id);

  if (!moment)
    return {
      momentMessages: {
        message: "Erreur.",
        subMessage: "Le moment que vous souhaitez effacer n'existe déjà plus.",
      },
      momentErrors: {},
      stepsMessages: {},
      stepsErrors: {},
    };

  await deleteMomentByMomentId(moment.id);

  const username = user.username;

  if (version === "v3") {
  } // original below
  else revalidatePath(`/users/${username}/moments`);

  return null;
};

export const falseDeleteMomentServerFlow = async (
  momentFromCRUD: MomentToCRUD | undefined,
  user: SelectUserIdAndUsername,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  if (!momentFromCRUD)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage: "Le moment n'a pas été réceptionné en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };

  const momentId = decodeHashidToUUID(momentFromCRUD.id);

  // verify if the moment still exists at time of deletion
  const moment = await findMomentByIdAndUserId(momentId, user.id);

  if (!moment)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "Le moment que vous souhaitez effacer n'existe déjà plus.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };

  await deleteMomentByMomentId(moment.id);

  const username = user.username;

  revalidatePath(`/users/${username}/moments`);

  return { isSuccess: true, success: {} };
};

export const deleteMomentServerFlow = async (
  momentFromCRUD: MomentAdapted | undefined,
  user: SelectUserIdAndUsername,
): Promise<CreateOrUpdateMomentError | CreateOrUpdateMomentSuccess> => {
  if (!momentFromCRUD)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage: "Le moment n'a pas été réceptionné en interne.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };

  const momentId = decodeHashidToUUID(momentFromCRUD.key);

  const userId = user.id;

  // verify if the moment still exists at time of deletion
  const moment = await findMomentByIdAndUserId(momentId, userId);

  if (!moment)
    return {
      isSuccess: false,
      error: {
        momentMessages: {
          message: "Erreur.",
          subMessage:
            "Le moment que vous souhaitez effacer n'existe déjà plus.",
        },
        momentErrors: {},
        stepsMessages: {},
        stepsErrors: {},
      },
    };

  const success = await createSuccessSubFlow({
    userId,
    moment,
  });

  await deleteMomentByMomentId(moment.id);

  const username = user.username;

  revalidatePath(`/users/${username}/moments`);

  return success;
};

export const revalidateMomentsServerFlow = async (
  user: SelectUserIdAndUsername,
): Promise<void> => {
  const username = user.username;

  revalidatePath(`/users/${username}/moments`);
  // guess I'm keeping void for actions that really return nothingness
};
