import { compareAsc, compareDesc } from "date-fns";

import { MOMENT_FORM_IDS } from "@/app/data/moments";
import {
  SubView,
  CreateOrUpdateMomentState,
  View,
  MomentFormVariant,
} from "@/app/types/moments";
import { scrollToSection, setScrollToTop } from "@/app/utilities/moments";
import { SetState } from "@/app/types/globals";

// scrolls back to the section of the form that possesses new errors
// or to the correct subView when successfully submitted
// (every time createOrUpdateMomentAction is done)
export const createOrUpdateMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  endMomentDate: string,
  now: string,
  startMomentDate: string,
  setSubView: SetState<SubView>,
  setView: SetState<View>,
  setIsCreateOrUpdateMomentDone: SetState<boolean>,
) => {
  if (createOrUpdateMomentState) {
    // A truthy createOrUpdateMomentState returns with either a momentMessage or a stepsMessage, not both. If by accident both are returned, momentMessage is handled first. If by accident none are returned (in a truthy createOrUpdateMomentState), nothing is expected to happen at this time.
    if (createOrUpdateMomentState.momentMessage) {
      scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
      return setIsCreateOrUpdateMomentDone(false);
    }

    if (createOrUpdateMomentState.stepsMessage) {
      scrollToSection(MOMENT_FORM_IDS[variant].itsSteps);
      return setIsCreateOrUpdateMomentDone(false);
    }
  } else {
    // this now works thanks to export const dynamic = "force-dynamic";
    // ...I think
    if (compareDesc(endMomentDate, now) === 1) setSubView("past-moments");
    else if (compareAsc(startMomentDate, now) === 1)
      setSubView("future-moments");
    // present by default
    else setSubView("current-moments");

    setScrollToTop("read-moments", setView);
    // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
    return setIsCreateOrUpdateMomentDone(false);
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentFormAfterflow = (
  variant: MomentFormVariant,
  setIsResetMomentFormDone: SetState<boolean>,
) => {
  scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  return setIsResetMomentFormDone(false);
};

// scrolls back to yourMoment's section if there's a mistake, or leads to the top of "read-moments" after the moment is successfully deleted
// (every time deleteMomentAction is done)
export const deleteMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setView: SetState<View>,
  setIsDeleteMomentDone: SetState<boolean>,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
    return setIsDeleteMomentDone(false);
  } else {
    setScrollToTop("read-moments", setView);
    return setIsDeleteMomentDone(false);
  }
};

// scrolls back to itsSteps's section when the step form is successfully and unsuccessfully submitted
// (every time createOrUpdateStepAction is done)
export const createOrUpdateStepAfterflow = (
  momentFormVariant: MomentFormVariant,
  setIsCreateOrUpdateStepDone: SetState<boolean>,
) => {
  // In the end I just don't think steps should have afterflows, so I may keep this afterflow (and its corresponding boolean and useEffect) but it is no longer going to do anything.
  // The idea that I'm going with is that manipulating steps actually needs to feel snappy, because it's at the heart of the project and it will be needed to be done multiple, multiple times. So here, unless the whole thing is designed around animations (which is bound to be a thing for follow-up native projects), it doesn't add anything necessary, much unlike the reorder feature which is absolutely a desirable bonus.

  // scrollToSection(MOMENT_FORM_IDS[momentFormVariant].itsSteps);
  return setIsCreateOrUpdateStepDone(false);
};
