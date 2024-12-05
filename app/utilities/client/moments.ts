import { ReadonlyURLSearchParams } from "next/navigation";
import { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

import {
  MomentsPageSearchParamsHandled,
  View,
} from "@/app/types/agnostic/moments";
import { SetState, TypedURLSearchParams } from "@/app/types/client/globals";
import {
  momentsPageSearchParamsKeys,
  views,
} from "@/app/constants/agnostic/moments";

// rotates states by setting any state array enum to the right or to the left
export const rotateStates = <T>(
  // https://stackoverflow.com/questions/32308370/what-is-the-syntax-for-typescript-arrow-functions-with-generics
  direction: "left" | "right",
  setState: SetState<T>,
  statesArray: readonly T[],
  state: T,
) => {
  if (direction === "right") {
    setState(
      statesArray.at(
        statesArray.indexOf(state) + 1 > statesArray.length - 1
          ? 0
          : statesArray.indexOf(state) + 1,
      )!,
    );
  } else setState(statesArray.at(statesArray.indexOf(state) - 1)!);
};

export const rotateSearchParams = (
  direction: "left" | "right",
  paramsKey: string,
  paramsArray: readonly string[],
  paramsValue: string,
  searchParams: ReadonlyURLSearchParams,
  pathname: string,
  replace: (href: string, options?: NavigateOptions) => void,
) => {
  const newSearchParams = new URLSearchParams(searchParams);
  if (direction === "right")
    newSearchParams.set(
      paramsKey,
      paramsArray.at(
        paramsArray.indexOf(paramsValue) + 1 > paramsArray.length - 1
          ? 0
          : paramsArray.indexOf(paramsValue) + 1,
      )!,
    );
  else
    newSearchParams.set(
      paramsKey,
      // .at() handles rotation on its own for negative values
      paramsArray.at(paramsArray.indexOf(paramsValue) - 1)!,
    );
  replace(`${pathname}?${newSearchParams.toString()}`);
};

// scroll back to top when changing a view
export const setScrollToTop = <DesiredView extends DesiredViews, DesiredViews>(
  // https://www.bajorunas.tech/blog/typescript-generics-inheritance
  desiredView: DesiredView,
  setDesiredView: SetState<DesiredViews>,
) => {
  // setDesiredView will need to be replace by something replacing the URL.
  // But since the arguments are going to different it's also going to be different function altogether.
  setDesiredView(desiredView);
  scrollTo({ top: 0 });

  // Since subView is going to be below motion.div and will have no other choice than to be the child of a Client Component, I don't see a point in having it in the URL just yet. But so far, on the client SetViewButton, I'm reading the view from the URL.
};

// incoming to navigate from the URL
// ...
// if you're going to do it from the URL, all redirects needs to be from the URL in order to be awaited and to have the scrollToTop synchronized.
// ...and that's where I elected not to go deeper on the server because here the client is instantaneous and therefore faster
export const scrollToTopOfDesiredView = (
  desiredView: View,
  searchParams: ReadonlyURLSearchParams,
  push: (href: string, options?: NavigateOptions) => void,
  pathname: string,
  momentId?: string,
) => {
  const newSearchParams = new URLSearchParams(
    searchParams,
  ) as TypedURLSearchParams<MomentsPageSearchParamsHandled>;

  if (desiredView !== views.UPDATE_MOMENT)
    newSearchParams.delete(momentsPageSearchParamsKeys.MOMENT_KEY);
  else if (momentId)
    newSearchParams.set(momentsPageSearchParamsKeys.MOMENT_KEY, momentId);

  newSearchParams.set(momentsPageSearchParamsKeys.VIEW, desiredView);

  push(`${pathname}?${newSearchParams.toString()}`);

  // scrollTo({ top: 0, behavior: "smooth" }); // apparently useRouter scroll to top on its own ...and that was the only issue // this is not fixed, but okay for now
};

// scrolls back to the desired section (usually yourMoment or itsSteps in the Moment forms)
export const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  section?.scrollIntoView({ behavior: "smooth" });
};

/* Notes
I personally hate when a backend modifies the URL I've personally entered in the browser. So my idea is, the user is free to enter and keep whatever URL they want, while I am free to interpret that URL however it is that I want.
*/
