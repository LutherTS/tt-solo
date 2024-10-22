import { MOMENT_FORM_IDS } from "@/app/data/moments";
import {
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
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
) => {
  // now = dateToInputDatetime(new Date());

  if (createOrUpdateMomentState) {
    switch (createOrUpdateMomentState.errorScrollPriority) {
      case "moment":
        scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
        break;
      case "steps":
        scrollToSection(MOMENT_FORM_IDS[variant].itsSteps);
        break;

      default:
        break;
    }

    setCreateOrUpdateMomentState((s) => {
      delete s?.errorScrollPriority;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
      return s;
    });
  } else {
    setIsCRUDOpSuccessful(true);

    setScrollToTop("read-moments", setView);
    // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentAfterflow = (variant: MomentFormVariant) => {
  scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
};

// scrolls back to yourMoment's section if there's a mistake, or leads to the top of "read-moments" after the moment is successfully deleted
// (every time deleteMomentAction is done)
export const deleteMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  } else {
    setIsCRUDOpSuccessful(true);

    setScrollToTop("read-moments", setView);
  }
};
