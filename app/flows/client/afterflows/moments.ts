import { MOMENT_FORM_IDS } from "@/app/data/moments";
import {
  CreateOrUpdateMomentState,
  View,
  MomentFormVariant,
} from "@/app/types/moments";
import { scrollToSection, setScrollToTop } from "@/app/utilities/moments";
import { SetState } from "@/app/types/globals";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ReadonlyURLSearchParams } from "next/navigation";

// scrolls back to the section of the form that possesses new errors
// or to the correct subView when successfully submitted
// (every time createOrUpdateMomentAction is done)
export const createOrUpdateMomentAfterflow = (
  variant: MomentFormVariant,
  createOrUpdateMomentState: CreateOrUpdateMomentState,
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>,
  setView: SetState<View>,
  setIsCRUDOpSuccessful: SetState<boolean>,
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

    // Error: Invalid hook call. Hooks can only be called inside of the body of a function component.
    // This means I need to get these three produced within their relevant MomentForms, and pass them as (currently optional) arguments to this afterflow.
    // Same for deleteMomentAfterflow.
    // Then I can devise the new setScrollToTop (with a different name) that will only be used on moments-3+ which is currently moments itself.
    // const searchParams = useSearchParams();
    // const { push } = useRouter();
    // const pathname = usePathname();

    // the bug is that it redirects first to the same 'update-moment' view before it does the thing
    if (searchParams && push && pathname)
      setScrollToTop("read-moments", setView, searchParams, push, pathname);
    else setScrollToTop("read-moments", setView);
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
  searchParams?: ReadonlyURLSearchParams,
  push?: (href: string, options?: NavigateOptions) => void,
  pathname?: string,
) => {
  if (createOrUpdateMomentState) {
    scrollToSection(MOMENT_FORM_IDS[variant].yourMoment);
  } else {
    setIsCRUDOpSuccessful(true);

    if (searchParams && push && pathname)
      setScrollToTop("read-moments", setView, searchParams, push, pathname);
    else setScrollToTop("read-moments", setView);
  }
};
