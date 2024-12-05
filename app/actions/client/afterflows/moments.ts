"use client";
// Proposes "use client" to enforce a Client Module.

import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

import {
  momentFormIds,
  momentsPageSearchParamsKeys,
  subViewsPages,
  views,
} from "@/app/constants/agnostic/moments";
import {
  FalseCreateOrUpdateMomentState,
  View,
  MomentFormVariant,
  CreateOrUpdateMomentState,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
  MomentsPageSearchParamsHandled,
} from "@/app/types/agnostic/moments";
import {
  scrollToSection,
  setScrollToTop,
} from "@/app/utilities/client/moments";
import { SetState, TypedURLSearchParams } from "@/app/types/client/globals";

// scrolls back to the section of the form that possesses new errors
// or to the correct subView when successfully submitted
// (every time createOrUpdateMomentAction is done)
export const falseCreateOrUpdateMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState,
  setCreateOrUpdateMomentState: SetState<FalseCreateOrUpdateMomentState>,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
) => {
  if (createOrUpdateMomentState) {
    switch (createOrUpdateMomentState.errorScrollPriority) {
      case "moment":
        scrollToSection(momentFormIds[variant].yourMoment);
        break;
      case "steps":
        scrollToSection(momentFormIds[variant].itsSteps);
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

    setScrollToTop(views.READ_MOMENTS, setView);
    // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
  }
};

export const createOrUpdateMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState:
    | CreateOrUpdateMomentError
    | CreateOrUpdateMomentSuccess,
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>,
  setIsCRUDOpSuccessful: SetState<boolean>,
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
) => {
  if (createOrUpdateMomentState?.isSuccess === false) {
    switch (createOrUpdateMomentState.error.errorScrollPriority) {
      case "moment":
        scrollToSection(momentFormIds[variant].yourMoment);
        break;
      case "steps":
        scrollToSection(momentFormIds[variant].itsSteps);
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

    isSuccessTrueSubFlow(
      searchParams,
      push,
      pathname,
      createOrUpdateMomentState,
    );
  }
};

const isSuccessTrueSubFlow = (
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
  createOrUpdateMomentState: CreateOrUpdateMomentSuccess,
) => {
  const newSearchParams = new URLSearchParams(
    searchParams,
  ) as TypedURLSearchParams<MomentsPageSearchParamsHandled>;

  newSearchParams.set(momentsPageSearchParamsKeys.VIEW, views.READ_MOMENTS);
  newSearchParams.delete(momentsPageSearchParamsKeys.MOMENT_KEY);

  if (createOrUpdateMomentState.success.subView)
    newSearchParams.set(
      momentsPageSearchParamsKeys.SUB_VIEW,
      createOrUpdateMomentState.success.subView,
    );
  if (
    createOrUpdateMomentState.success.subView &&
    createOrUpdateMomentState.success.countPage
  )
    if (createOrUpdateMomentState.success.countPage === 1)
      newSearchParams.delete(
        subViewsPages[createOrUpdateMomentState.success.subView],
      );
    else
      newSearchParams.set(
        subViewsPages[createOrUpdateMomentState.success.subView],
        createOrUpdateMomentState.success.countPage.toString(),
      );

  push(`${pathname}?${newSearchParams.toString()}`);
};

// scrolls back to yourMoment's section at the top after resetting the form
// (every time resetMomentFormAction is done)
export const resetMomentAfterFlow = (variant: MomentFormVariant) => {
  scrollToSection(momentFormIds[variant].yourMoment);
};

// scrolls back to yourMoment's section if there's a mistake, or leads to the top of views.READ_MOMENTS after the moment is successfully deleted
// (every time deleteMomentAction is done)
export const falseDeleteMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(momentFormIds[variant].yourMoment);
  } else {
    setIsCRUDOpSuccessful(true);

    setScrollToTop(views.READ_MOMENTS, setView);
  }
};

export const deleteMomentAfterFlow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState:
    | CreateOrUpdateMomentError
    | CreateOrUpdateMomentSuccess,
  setIsCRUDOpSuccessful: SetState<boolean>,
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
) => {
  if (createOrUpdateMomentState?.isSuccess === false) {
    scrollToSection(momentFormIds[variant].yourMoment);
  } else {
    setIsCRUDOpSuccessful(true);

    isSuccessTrueSubFlow(
      searchParams,
      push,
      pathname,
      createOrUpdateMomentState,
    );
  }
};
