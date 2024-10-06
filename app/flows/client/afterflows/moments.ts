import { Dispatch, SetStateAction } from "react";

import { ITS_STEPS_ID, YOUR_MOMENT_ID } from "@/app/data/moments";
import { CreateOrUpdateMomentState, View } from "@/app/types/moments";

// scrolls back to the section of the form that possesses new errors
// (every time createOrUpdateMomentState is updated)
export const createOrUpdateMomentAfterflow = (
  view: View,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
) => {
  if (view === "create-moment" && createOrUpdateMomentState) {
    if (createOrUpdateMomentState.momentMessage) {
      const yourMoment = document.getElementById(YOUR_MOMENT_ID);
      return yourMoment?.scrollIntoView({ behavior: "smooth" });
    }
    if (createOrUpdateMomentState.stepsMessage) {
      const itsSteps = document.getElementById(ITS_STEPS_ID);
      return itsSteps?.scrollIntoView({ behavior: "smooth" });
    }
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentFormAfterflow = (
  setIsResetMomentFormDone: Dispatch<SetStateAction<boolean>>,
) => {
  const yourMoment = document.getElementById(YOUR_MOMENT_ID);
  yourMoment?.scrollIntoView({ behavior: "smooth" });
  setIsResetMomentFormDone(false);
};

// erases every step message error after a step is successfully created or updated
// (every time createOrUpdateStepAction is done)
export const createOrUpdateStepAfterflow = (
  isCreateOrUpdateStepDone: boolean,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >,
  setIsCreateOrUpdateStepDone: Dispatch<SetStateAction<boolean>>,
) => {
  if (isCreateOrUpdateStepDone) {
    const newState = {
      ...createOrUpdateMomentState,
      stepsMessage: undefined,
      stepsSubMessage: undefined,
      errors: {
        stepName: undefined,
        stepDescription: undefined,
        trueStepDuration: undefined,
      },
    };
    setCreateOrUpdateMomentState(newState);
  }
  setIsCreateOrUpdateStepDone(false);

  const itsSteps = document.getElementById(ITS_STEPS_ID);
  return itsSteps?.scrollIntoView({ behavior: "smooth" });
};
