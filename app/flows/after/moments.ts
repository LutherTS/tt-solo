import { MOMENT_FORM_IDS } from "@/app/data/moments";
import {
  CreateOrUpdateMomentState,
  View,
  MomentFormVariant,
  TrueCreateOrUpdateMomentState,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
} from "@/app/types/moments";
import {
  scrollToSection,
  scrollToTopOfDesiredView,
  setScrollToTop,
} from "@/app/utilities/moments";
import { SetState } from "@/app/types/globals";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

// scrolls back to the section of the form that possesses new errors
// or to the correct subView when successfully submitted
// (every time createOrUpdateMomentAction is done)
export const createOrUpdateMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
  // version 3 attempt bonuses
  searchParams?: ReadonlyURLSearchParams,
  push?: (href: string, options?: NavigateOptions) => void,
  pathname?: string,
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

export const trueCreateOrUpdateMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState:
    | CreateOrUpdateMomentError
    | CreateOrUpdateMomentSuccess,
  setCreateOrUpdateMomentState: SetState<TrueCreateOrUpdateMomentState>,
  setIsCRUDOpSuccessful: SetState<boolean>,
  // version 3 attempt bonuses
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
) => {
  // now = dateToInputDatetime(new Date());

  if (createOrUpdateMomentState?.isSuccess === false) {
    switch (createOrUpdateMomentState.error.errorScrollPriority) {
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
      if (s?.isSuccess === false) delete s.error.errorScrollPriority;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
      return s;
    });
  } else {
    setIsCRUDOpSuccessful(true);

    console.log(createOrUpdateMomentState);
    scrollToTopOfDesiredView("read-moments", searchParams, push, pathname);
  }
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentAfterFlow = (variant: MomentFormVariant) => {
  scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
};

// scrolls back to yourMoment's section if there's a mistake, or leads to the top of "read-moments" after the moment is successfully deleted
// (every time deleteMomentAction is done)
export const deleteMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
  // version 3 attempt bonuses
  searchParams?: ReadonlyURLSearchParams,
  push?: (href: string, options?: NavigateOptions) => void,
  pathname?: string,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  } else {
    setIsCRUDOpSuccessful(true);

    if (searchParams && push && pathname)
      scrollToTopOfDesiredView("read-moments", searchParams, push, pathname);
    // original below
    else setScrollToTop("read-moments", setView);
  }
};

export const trueDeleteMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState:
    | CreateOrUpdateMomentError
    | CreateOrUpdateMomentSuccess,
  setIsCRUDOpSuccessful: SetState<boolean>,
  // version 3 attempt bonuses
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
) => {
  if (createOrUpdateMomentState?.isSuccess === false) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  } else {
    // I might even be able to do away with setIsCRUDOpSuccessful now that createOrUpdateMomentState has its own boolean
    setIsCRUDOpSuccessful(true);

    scrollToTopOfDesiredView("read-moments", searchParams, push, pathname);
  }
};
