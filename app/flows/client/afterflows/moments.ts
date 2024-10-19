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
export const trueCreateOrUpdateMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  endMomentDate: string,
  now: string,
  startMomentDate: string,
  setSubView: SetState<SubView>,
  setView: SetState<View>,
) => {
  if (createOrUpdateMomentState) {
    // A truthy createOrUpdateMomentState returns with either a momentMessage or a stepsMessage, not both. If by accident both are returned, momentMessage is handled first. If by accident none are returned (in a truthy createOrUpdateMomentState), nothing is expected to happen at this time.
    if (createOrUpdateMomentState.momentMessage) {
      scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
      // all of these could simply be at the end of the afterflow's useEffect instead of being inside the afterflow
    }

    if (createOrUpdateMomentState.stepsMessage) {
      scrollToSection(MOMENT_FORM_IDS[variant].itsSteps);
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
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const trueResetMomentAfterflow = (variant: MomentFormVariant) => {
  scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
};

// scrolls back to yourMoment's section if there's a mistake, or leads to the top of "read-moments" after the moment is successfully deleted
// (every time deleteMomentAction is done)
export const trueDeleteMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setView: SetState<View>,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  } else {
    setScrollToTop("read-moments", setView);
  }
};
