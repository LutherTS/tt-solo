import { Dispatch, SetStateAction } from "react";
import { compareAsc, compareDesc } from "date-fns";

import { ITS_STEPS_ID, YOUR_MOMENT_ID } from "@/app/data/moments";
import { CreateOrUpdateMomentState, SubView, View } from "@/app/types/moments";
import { setScrollToTop } from "@/app/utilities/moments";

// scrolls back to the section of the form that possesses new errors
// or to the correct subView when successfully submitted
// (every time createOrUpdateMomentAction is done)
export const createOrUpdateMomentAfterflow = (
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  endMomentDate: string,
  now: string,
  startMomentDate: string,
  setSubView: Dispatch<SetStateAction<SubView>>,
  setView: Dispatch<SetStateAction<View>>,
  setIsCreateOrUpdateMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  if (createOrUpdateMomentState) {
    // A truthy createOrUpdateMomentState returns with either a momentMessage or a stepsMessage, not both. If by accident both are returned, momentMessage is handled first. If by accident none are returned (in a truthy createOrUpdateMomentState), nothing is expected to happen at this time.
    if (createOrUpdateMomentState.momentMessage) {
      const yourMoment = document.getElementById(YOUR_MOMENT_ID);
      yourMoment?.scrollIntoView({ behavior: "smooth" });

      return setIsCreateOrUpdateMomentDone(false);
    }

    if (createOrUpdateMomentState.stepsMessage) {
      const itsSteps = document.getElementById(ITS_STEPS_ID);
      itsSteps?.scrollIntoView({ behavior: "smooth" });

      return setIsCreateOrUpdateMomentDone(false);
    }
  } else {
    // this now works thanks to export const dynamic = "force-dynamic";
    // ...I think
    if (compareDesc(endMomentDate, now) === 1) setSubView("past-moments");
    else if (compareAsc(startMomentDate, now) === 1)
      setSubView("future-moments");
    // therefore present by default
    else setSubView("current-moments");

    setScrollToTop("read-moments", setView);
    // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13

    return setIsCreateOrUpdateMomentDone(false);
  }
};

export const deleteMomentAfterflow = (
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setView: Dispatch<SetStateAction<View>>,
  setIsDeleteMomentDone: Dispatch<SetStateAction<boolean>>,
) => {
  if (createOrUpdateMomentState) {
    const yourMoment = document.getElementById(YOUR_MOMENT_ID);
    yourMoment?.scrollIntoView({ behavior: "smooth" });

    return setIsDeleteMomentDone(false);
  } else {
    setScrollToTop("read-moments", setView);

    return setIsDeleteMomentDone(false);
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentFormAfterflow = (
  setIsResetMomentFormDone: Dispatch<SetStateAction<boolean>>,
) => {
  const yourMoment = document.getElementById(YOUR_MOMENT_ID);
  yourMoment?.scrollIntoView({ behavior: "smooth" });

  return setIsResetMomentFormDone(false);
};

// scrolls back to itsSteps's section when the step form is successfully and unsuccessfully submitted
// (every time createOrUpdateStepAction is done)
export const createOrUpdateStepAfterflow = (
  setIsCreateOrUpdateStepDone: Dispatch<SetStateAction<boolean>>,
) => {
  const itsSteps = document.getElementById(ITS_STEPS_ID);
  itsSteps?.scrollIntoView({ behavior: "smooth" });

  return setIsCreateOrUpdateStepDone(false);
};
