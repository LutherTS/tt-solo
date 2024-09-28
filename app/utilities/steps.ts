import { add } from "date-fns";

import { dateToInputDatetime } from "./moments";
import { createStepFromSteps } from "../writes/steps";
import { StepFromCRUD } from "../types/moments";

// common create steps flow for creating and updating a moment
export const createStepsFromStepsFlow = async (
  steps: StepFromCRUD[],
  momentDate: string,
  map: Map<number, number>,
  momentId: string,
) => {
  let i = 1;

  for (let j = 0; j < steps.length; j++) {
    const step = steps[j];

    const startDateAndTime =
      j === 0
        ? momentDate
        : dateToInputDatetime(add(momentDate, { minutes: map.get(j - 1) }));

    const endDateAndTime = dateToInputDatetime(
      add(momentDate, { minutes: map.get(j) }),
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
