"use client"; // It is decided that every component should be exported even if it isn't being used elsewhere, so that when it happens to become needed elsewhere it doesn't become necessary to scroll through the whole file, find that component, and manually export it.

import {
  FormEvent,
  MouseEvent,
  Ref,
  TransitionStartFunction,
  use,
  // useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  AnimatePresence,
  motion,
  MotionValue,
  Reorder,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { useMeasure } from "react-use";
import debounce from "debounce";
import clsx from "clsx";
import { add, format } from "date-fns";
import { fr } from "date-fns/locale";
// @ts-ignore // no type declaration file on npm
import useKeypress from "react-use-keypress";
// import { useTimer } from "react-use-precision-timer";

import * as Icons from "@/app/icons/__icons__";
import * as LocalServerComponents from "./server";
import * as GlobalServerComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client";
import {
  MomentFormVariant,
  RevalidateMoments,
  StepFormVariant,
  StepFromClient,
  StepVisible,
  SubView,
  View,
  MomentsPageSearchParamsHandled,
  CreateOrUpdateMomentState,
  MomentsAdapted,
  MomentAdapted,
  CreateOrUpdateMoment,
  DeleteMoment,
  FetchReadMomentsViewData,
  FetchMomentFormsData,
} from "@/app/types/moments";
import { SetState, TypedURLSearchParams } from "@/app/types/globals";
import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  momentFormIds,
  SEARCH_FORM_ID,
  STEP_DURATION_ORIGINAL,
  subViews,
  SUBVIEWS,
  subViewsTitles,
  views,
  VIEWS,
  subViewsMomentsPageSearchParamsKeys,
} from "@/app/constants/moments";
import {
  defineCurrentPage,
  defineDesiredView,
  makeStepsCompoundDurationsArray,
  rotateSearchParams,
  roundTimeUpTenMinutes,
  scrollToTopOfDesiredView,
  toWordsing,
  removeStepsMessagesAndErrorsCallback,
} from "@/app/utilities/moments";
import {
  deleteStepClientFlow,
  revalidateMomentsClientFlow,
  createOrUpdateStepClientFlow,
  resetMomentClientFlow,
  resetStepClientFlow,
  createOrUpdateMomentClientFlow,
  deleteMomentClientFlow,
} from "@/app/flows/client/moments";
import {
  resetMomentAfterFlow,
  createOrUpdateMomentAfterFlow,
  deleteMomentAfterFlow,
} from "@/app/flows/after/moments";

// this is now where the client-side begins, from the original Main page, to ClientCore, the lower Main component and now to container of the carousel

// NOTEWORTHY: This could be turned into a server component if I use CSS transitions instead of Framer Motion.
// But that's not even sure because it depends on useMotionValue with is updated via useMeasure.
export function ViewsCarouselContainer({
  now,
  view,
  moment,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
  fetchReadMomentsViewData,
  fetchMomentFormsData,
}: {
  now: string;
  view: View;
  moment: MomentAdapted | undefined; // moment now only drops in MomentForms, so eventually (today) it could be included in momntFormsData // but no
  fetchReadMomentsViewData: FetchReadMomentsViewData;
  fetchMomentFormsData: FetchMomentFormsData;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  const [isCRUDOpSuccessful, setIsCRUDOpSuccessful] = useState(false);
  let currentViewHeight = useMotionValue(0); // 0 as a default to stay a number

  /* Functioning timer logic, with useTimer
  // The callback function to fire every step of the timer.
  // const callback = useCallback(
    (overdueCallCount: number) => console.log("Boom", overdueCallCount),
    // https://justinmahar.github.io/react-use-precision-timer/iframe.html?viewMode=docs&id=docs-usetimer--docs&args=#low-delays-expensive-callbacks-and-overdue-calls
    [],
  );
  // The callback will be called every 1000 milliseconds.
  const timer = useTimer({ delay: 1000, startImmediately: true }, callback);
  // The callback is where the whole moment logic will operate, with a mix of
  // states, calls to update the database every minute, etc. The orchestration
  // here on its own is going to be worth an entire file.
  */

  return (
    <motion.div
      className="flex"
      // an error will return -1, if ever the screen shows empty
      animate={{
        x: `-${VIEWS.indexOf(view) * 100}%`,
      }}
      initial={false}
      transition={{
        type: "spring",
        // if the transition is from a successful write operation (from the CRUD but excluding R or read) go with config A, else go with config B
        bounce: isCRUDOpSuccessful ? 0.2 : 0,
        duration: isCRUDOpSuccessful ? 0.4 : 0.2,
      }}
      onAnimationStart={() => setIsCRUDOpSuccessful(false)}
      style={{
        height: currentViewHeight,
      }}
    >
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== views.UPDATE_MOMENT}
      >
        <ViewSegment
          id={views.UPDATE_MOMENT}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* SUSPENDED */}
          {/* UpdateMomentView */}
          <GlobalServerComponents.ErrorBoundarySuspense>
            <MomentForms
              key={view} // to remount every time the view changes, because its when it's mounted that the default values are applied based on the currently set moment
              variant="updating"
              moment={moment}
              fetchMomentFormsData={fetchMomentFormsData}
              createOrUpdateMoment={createOrUpdateMoment}
              deleteMoment={deleteMoment}
              now={now}
              setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
              allButtonsDisabled={view !== views.UPDATE_MOMENT}
            />
          </GlobalServerComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </LocalServerComponents.PageSegment>
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== views.READ_MOMENTS}
      >
        <ViewSegment
          id={views.READ_MOMENTS}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* SUSPENDED */}
          <GlobalServerComponents.ErrorBoundarySuspense>
            <ReadMomentsView
              view={view}
              fetchReadMomentsViewData={fetchReadMomentsViewData}
              revalidateMoments={revalidateMoments}
              allButtonsDisabled={view !== views.READ_MOMENTS}
            />
          </GlobalServerComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </LocalServerComponents.PageSegment>
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== views.CREATE_MOMENT}
      >
        <ViewSegment
          id={views.CREATE_MOMENT}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* SUSPENDED */}
          {/* CreateMomentView */}
          <GlobalServerComponents.ErrorBoundarySuspense>
            <MomentForms
              variant="creating"
              fetchMomentFormsData={fetchMomentFormsData}
              createOrUpdateMoment={createOrUpdateMoment}
              now={now}
              setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
              allButtonsDisabled={view !== views.CREATE_MOMENT}
            />
          </GlobalServerComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </LocalServerComponents.PageSegment>
    </motion.div>
  );
}

// NOTEWORTHY: To my knowledge, this is the furthest I could push down the client boundary because useMeasure as a hook reads from the DOM itself, unique to each user's browsing environment.
export function ViewSegment({
  id,
  currentView,
  currentViewHeight,
  children,
}: {
  id: View;
  currentView: View;
  currentViewHeight: MotionValue<number>;
  children: React.ReactNode;
}) {
  // usually I should use bounds instead of { height } so that I'm allowed to name bounds whatever I want
  const [ref, { height }] = useMeasure();
  // making TypeScript happy
  const reference = ref as Ref<HTMLDivElement>;

  if (id === currentView) currentViewHeight.set(height);

  return (
    <div id={id} ref={reference}>
      {children}
      {/* spacer instead of padding for correct useMeasure calculations */}
      {/* boosted from h-12 to h-24 */}
      <div className="h-24"></div>
    </div>
  );
}

/* IMPORTANT
WHY I WILL NOT BE MAKING ANIMATIONS ON READMOMENTS VIEW AT THIS TIME
For starters, the core of this project, the part that has the vetted design, is the form. The design is a reappropriation of Refactoring UI's Complex Form video. (I'll brag a little here and say two with its effective three forms-in-one, mine is the most complex.) This is to say that the reason why it's look and feel is so professional is because all of its research has already been done by professionals in this field, which is not my field. I don't make visual prototypes of applications. I can to a degree, and indeed, I am the one who made on my own the current ReadMomentsView look. But even so I was heavily inspired (I copied) by portions of the design that was made by Refactoring UI.
So the first reason why I'm not making animations on ReadMomentsView is because its design is not definitive enough like MomentForms' is. Consequently, this design is a placeholder, so any further work on it would not only be wasted on a final version, but is also not the subject of this exercise.
Second, because though aiming to have subViews as a carousel might be feasible at this time, complete with useMeasure, the same can't be said about individual subView pages which are obtained on the server. Basically, at all times the page already knows about the current page of the four subViews, but it doesn't know about the next or previous pages of these subViews.
These can be allieviated by searching for the neighboring four pages of every current subView page alongside with the data of these subView pages themselves. If a user manually changed the URL beyond the current data we can do with a full page refresh, but within the scope of the intended normal user flow comes another problem. What if a user presses two pages further and immediate click for the next page?
Fortunately, there is a React 19 API for this, useOptimistic. For the case where a user presses two pages further, a call to the database will still be made to center that page in the search and retrieve data from the next two pages. But while that call happens, we can still optimistically show data from what was the two-pages-further page in the meantime. However, if the next two pages have yet to have been resolved will the user click for the next page, then we would either have to deactivate the button during the true background loading (which I think is the best method), or optimistically replace the data with a loading skeleton in the meantime (...which could be the best method after all), so that useMeasure can still ready from something in the DOM every time.
I honestly would love to explore with the first of these two approaches with useOptimistic and disabling the button since I'm not familiar with skeletons yet, but that would still require a revamping of page.tsx that is completely different from what I have right now. I would have to pass the params to the page's components to be resolved there and not on the page itself. I would have establish some sort of shell that doesn't waver nor re-renders every time the URL changes. I would have to change my read functions and change the way they are adapting their data from the server to the client, actually, I would have to have their promises resolved and treated by the client and not the server contrarily to what I'm doing right now. This exercise would require a complete revamping of the project so far, and obviously this is beyond the scope of my presentation for next Wednesday at time of writing. In fact, not only is this an incredible amount of work – which I know I might be tempted to tackle – it would make my talk more confusing. The simple, first step of resolving EVERYTHING from the server on page.tsx before passing it down to the pages' components themselves is the first step before even considering going further, Aurora-deep about React Server Components: https://www.youtube.com/watch?v=CvAySC5ex9c.
...
So... That's it. My work here is done. Even going on and making dummy data is not interesting per se, because ReadMomentsView is heavily subject to change and not the main topic of this talk. The only thing I need to do know is moments-3, where I can progressively show people the progress of the client boundary in the React Developer Tools. I'll just use my current dummy data to make my demo entry.
*/

export function ReadMomentsView({
  view,
  fetchReadMomentsViewData,
  revalidateMoments,
  allButtonsDisabled,
}: {
  view: View;
  fetchReadMomentsViewData: FetchReadMomentsViewData;
  revalidateMoments: RevalidateMoments;
  allButtonsDisabled: boolean;
}) {
  const readMomentsViewData = use(fetchReadMomentsViewData);

  const {
    userAllMomentsAdapted,
    userPastMomentsAdapted,
    userCurrentMomentsAdapted,
    userFutureMomentsAdapted,
  } = readMomentsViewData.userMomentsAdaptedCombined;

  const { subView } = readMomentsViewData;

  const realShowcaseMoments: { [K in SubView]: MomentsAdapted } = {
    [subViews.ALL_MOMENTS]: userAllMomentsAdapted,
    [subViews.PAST_MOMENTS]: userPastMomentsAdapted,
    [subViews.CURRENT_MOMENTS]: userCurrentMomentsAdapted,
    [subViews.FUTURE_MOMENTS]: userFutureMomentsAdapted,
  };

  let realDisplayedMoments = userAllMomentsAdapted;
  if (subView !== undefined && SUBVIEWS.includes(subView))
    realDisplayedMoments = realShowcaseMoments[subView];

  let realMoments: MomentAdapted[] = [];
  realDisplayedMoments.dates.forEach((e) =>
    e.destinations.forEach((e2) =>
      e2.moments.forEach((e3) => realMoments.push(e3)),
    ),
  );

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // because of debounce I'm exceptionally not turning this handler into an action
  function handleSearch(term: string) {
    const newSearchParams = new URLSearchParams(
      searchParams,
    ) as TypedURLSearchParams<MomentsPageSearchParamsHandled>;

    if (term) newSearchParams.set(momentsPageSearchParamsKeys.CONTAINS, term);
    else newSearchParams.delete(momentsPageSearchParamsKeys.CONTAINS);

    newSearchParams.delete(momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE);
    newSearchParams.delete(momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE);
    newSearchParams.delete(
      momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE,
    );
    newSearchParams.delete(
      momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE,
    );

    replace(`${pathname}?${newSearchParams.toString()}`);
  } // https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const [
    maxPageAllMoments,
    maxPagePastMoments,
    maxPageCurrentMoments,
    maxPageFutureMoments,
  ] = [
    userAllMomentsAdapted.pageDetails.maxPage,
    userPastMomentsAdapted.pageDetails.maxPage,
    userCurrentMomentsAdapted.pageDetails.maxPage,
    userFutureMomentsAdapted.pageDetails.maxPage,
  ];

  let subViewsMaxPages: { [K in SubView]: number } = {
    [subViews.ALL_MOMENTS]: maxPageAllMoments,
    [subViews.PAST_MOMENTS]: maxPagePastMoments,
    [subViews.CURRENT_MOMENTS]: maxPageCurrentMoments,
    [subViews.FUTURE_MOMENTS]: maxPageFutureMoments,
  };

  const currentPage = defineCurrentPage(
    INITIAL_PAGE,
    Number(searchParams.get(subViewsMomentsPageSearchParamsKeys[subView])),
    subViewsMaxPages[subView],
  );

  // for now search and pagination will remain handlers
  function handlePagination(direction: "left" | "right", subView: SubView) {
    const newSearchParams = new URLSearchParams(
      searchParams,
    ) as TypedURLSearchParams<MomentsPageSearchParamsHandled>;

    if (direction === "left")
      newSearchParams.set(
        subViewsMomentsPageSearchParamsKeys[subView],
        Math.max(INITIAL_PAGE, currentPage - 1).toString(),
      );
    else
      newSearchParams.set(
        subViewsMomentsPageSearchParamsKeys[subView],
        Math.min(subViewsMaxPages[subView], currentPage + 1).toString(),
      );

    if (
      newSearchParams.get(subViewsMomentsPageSearchParamsKeys[subView]) ===
      INITIAL_PAGE.toString()
    )
      newSearchParams.delete(subViewsMomentsPageSearchParamsKeys[subView]);

    replace(`${pathname}?${newSearchParams.toString()}`);
  }

  const rotateSubView = (direction: "left" | "right") =>
    rotateSearchParams(
      direction,
      momentsPageSearchParamsKeys.SUB_VIEW,
      SUBVIEWS,
      subView,
      searchParams,
      pathname,
      replace,
    );

  useKeypress("ArrowLeft", (event: KeyboardEvent) => {
    if (view === views.READ_MOMENTS) {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("left");
      } else {
        if (currentPage !== 1) handlePagination("left", subView);
      }
    }
  });

  useKeypress("ArrowRight", (event: KeyboardEvent) => {
    if (view === views.READ_MOMENTS) {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("right");
      } else {
        if (currentPage !== subViewsMaxPages[subView])
          handlePagination("right", subView);
      }
    }
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const { scrollY } = useScroll();

  // again, debounce-bound so not turned into an action
  const settingScrollPosition = (latest: number) => setScrollPosition(latest);

  const debouncedSettingScrollPosition = debounce(settingScrollPosition, 100);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (view === views.READ_MOMENTS) debouncedSettingScrollPosition(latest);
    else debouncedSettingScrollPosition(0);
  });

  useEffect(() => {
    window.scrollTo({ top: scrollPosition });
  }, [readMomentsViewData, currentPage]);

  // revalidateMomentsAction

  const [isRevalidateMomentsPending, startRevalidateMomentsTransition] =
    useTransition();

  const revalidateMomentsAction = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    startRevalidateMomentsTransition(async () => {
      await revalidateMomentsClientFlow(
        event,
        revalidateMoments,
        replace,
        pathname,
      );
    });
  };

  return (
    // That space-y will or could have to go
    <div className="space-y-8">
      {/* spacer for divider (through space-y-8 though) */}
      <div></div>
      <div className={clsx("flex flex-wrap gap-4")}>
        {SUBVIEWS.map((e) => (
          <SetSubViewButton key={e} e={e} subView={subView} />
        ))}
        <RevalidateMomentsButton
          // I insist on specifying and sending all of my actions' booleans because they can be used for stylistic purposes with isDedicatedDisabled
          allButtonsDisabled={allButtonsDisabled}
          revalidateMomentsAction={revalidateMomentsAction}
          isRevalidateMomentsPending={isRevalidateMomentsPending}
        />
      </div>
      <SearchForm
        searchParams={searchParams}
        debouncedHandleSearch={debouncedHandleSearch}
      />
      {realDisplayedMoments.dates.length > 0 ? (
        <>
          {/* notice I only render what's visible for now */}
          {realDisplayedMoments.dates.map((e, i, a) => (
            <div className="space-y-8" key={e.date}>
              <div className="space-y-8">
                <LocalServerComponents.DateCard
                  title={format(new Date(e.date), "eeee d MMMM", {
                    locale: fr,
                  })}
                >
                  {e.destinations.map((e2) => {
                    return (
                      <LocalServerComponents.DestinationInDateCard
                        // you we're not at fault per se, there was a real bug
                        key={e2.key + i.toString()}
                        e2={e2}
                        realMoments={realMoments}
                      />
                    );
                  })}
                </LocalServerComponents.DateCard>
              </div>
              {i === a.length - 1 && (
                <LocalServerComponents.MomentsPageDetails
                  pageDetails={realDisplayedMoments.pageDetails}
                />
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <PaginationButton
              handlePagination={handlePagination}
              direction="left"
              subView={subView}
              disabled={allButtonsDisabled || currentPage === 1}
              icon="ArrowLeftSolid"
              allButtonsDisabled={allButtonsDisabled}
            />
            <PaginationButton
              handlePagination={handlePagination}
              direction="right"
              subView={subView}
              disabled={
                allButtonsDisabled || currentPage === subViewsMaxPages[subView]
              }
              icon="ArrowRightSolid"
              allButtonsDisabled={allButtonsDisabled}
            />
          </div>
        </>
      ) : (
        <LocalServerComponents.NoDateCard>
          <GlobalServerComponents.FieldTitle
            title={"Pas de moment... pour le moment. 😅"}
          />
        </LocalServerComponents.NoDateCard>
      )}
    </div>
  );
}

// sure I can get the spans to be Server Components but this really is a whole
export function SetSubViewButton({
  e,
  subView,
}: {
  e: SubView;
  subView: SubView;
}) {
  // this needs to be inside the component because its entirely specific to the component
  const className = "px-4 py-2 h-9 flex items-center justify-center";

  // I prefer each Client Component that interact with the URL to have their own searchParams, pathname, push/replace trilogy.
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSubView() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(momentsPageSearchParamsKeys.SUB_VIEW, e);
    replace(`${pathname}?${newSearchParams.toString()}`);
  }

  return (
    <button
      onClick={handleSubView}
      className={clsx(
        className,
        "relative rounded-full text-sm font-semibold uppercase tracking-widest text-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        subView === e && "focus-visible:outline-blue-500",
        subView !== e && "focus-visible:outline-cyan-500",
      )}
    >
      {/* real occupied space */}
      <span className="invisible static">{subViewsTitles[e]}</span>
      {/* gradient text */}
      <span
        className={clsx(
          className,
          "absolute inset-0 z-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
        )}
      >
        {subViewsTitles[e]}
      </span>
      {/* white background */}
      <div
        className={clsx(
          "absolute inset-0 z-10 rounded-full border-2 border-transparent bg-white bg-clip-content",
        )}
      ></div>
      {/* gradient border */}
      <div
        className={clsx(
          "absolute inset-0 rounded-full",
          subView === e && "bg-gradient-to-r from-blue-500 to-cyan-500",
          subView !== e && "bg-transparent",
        )}
      ></div>
    </button>
  );
}

export function RevalidateMomentsButton({
  revalidateMomentsAction,
  isRevalidateMomentsPending,
  allButtonsDisabled,
}: {
  revalidateMomentsAction: (
    event: MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  isRevalidateMomentsPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <button
      form={SEARCH_FORM_ID}
      onClick={revalidateMomentsAction}
      disabled={allButtonsDisabled || isRevalidateMomentsPending}
      className={clsx(
        "flex h-9 items-center justify-center px-4 py-2",
        "relative rounded-full text-sm font-semibold uppercase tracking-widest text-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-cyan-500",
      )}
    >
      {/* real occupied space */}
      <span className="invisible static">
        <Icons.ArrowPathSolid />
      </span>
      {/* gradient text */}
      <span
        className={clsx(
          "flex h-9 items-center justify-center px-4 py-2",
          "absolute inset-0 z-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
        )}
      >
        <Icons.ArrowPathSolid className="size-6 text-blue-950" />
      </span>
      {/* white background */}
      <div
        className={clsx(
          "absolute inset-0 z-10 rounded-full border-2 border-transparent bg-white bg-clip-content",
        )}
      ></div>
      {/* gradient border */}
      <div className={clsx("absolute inset-0 rounded-full", "bg-white")}></div>
    </button>
  );
}

export function SearchForm({
  searchParams,
  debouncedHandleSearch,
}: {
  searchParams: ReadonlyURLSearchParams;
  debouncedHandleSearch: debounce.DebouncedFunction<(term: string) => void>;
}) {
  return (
    <form id={SEARCH_FORM_ID} noValidate>
      <GlobalClientComponents.InputText
        id={momentsPageSearchParamsKeys.CONTAINS}
        name={momentsPageSearchParamsKeys.CONTAINS}
        placeholder="Cherchez parmi vos moments..."
        defaultValue={searchParams
          .get(momentsPageSearchParamsKeys.CONTAINS)
          ?.toString()}
        onChange={(e) => {
          debouncedHandleSearch(e.currentTarget.value);
        }}
      />
    </form>
  );
}

export function UpdateMomentViewButton({
  e3,
  realMoments,
}: {
  e3: MomentAdapted;
  realMoments: MomentAdapted[];
}) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  // Just a good old handler. On the fly, I write handlers as traditional functions and actions as arrow functions.
  function handleUpdateMomentView() {
    const moment = realMoments.find((e0) => e0.key === e3.key);

    scrollToTopOfDesiredView(
      views.UPDATE_MOMENT,
      searchParams,
      push,
      pathname,
      moment?.key,
    );
  }

  return (
    <GlobalClientComponents.Button
      type="button"
      variant="destroy-step"
      onClick={handleUpdateMomentView}
    >
      <Icons.PencilSquareSolid className="size-5" />
    </GlobalClientComponents.Button>
  );
}

export function PaginationButton({
  handlePagination,
  direction,
  subView,
  disabled,
  icon,
  iconClassName,
  allButtonsDisabled,
}: {
  handlePagination: (direction: "left" | "right", subView: SubView) => void;
  direction: "left" | "right";
  subView: SubView;
  disabled: boolean;
  icon: Icons.IconName;
  iconClassName?: string;
  allButtonsDisabled: boolean;
}) {
  const Icon = Icons[icon];

  return (
    <button
      // hum... // because I'm providing external arguments, and actually handlePagination is also external
      onClick={() => handlePagination(direction, subView)}
      disabled={allButtonsDisabled || disabled}
      className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 disabled:text-neutral-200"
    >
      <div className="rounded-lg bg-white p-2 shadow">
        <Icon className={iconClassName} />
      </div>
    </button>
  );
}

// steps animations data, children of MomentForms

const SHARED_HEIGHT_DURATION = 0.25; // previously ADD__HEIGHT_DURATION
const SHARED_OPACITY_DURATION = SHARED_HEIGHT_DURATION * (2 / 3); // MotionAddStepVisible opacity duration is purposefully shorter (currently twice shorter than MotionAddStepVisible height duration). In fact, instead of currently writing 0.1 I can just right height duration divided by 2 // previously ADD_SWITCH__OPACITY_DURATION

export function MomentForms({
  variant,
  moment,
  fetchMomentFormsData,
  createOrUpdateMoment,
  deleteMoment,
  now,
  setIsCRUDOpSuccessful,
  allButtonsDisabled,
}: {
  variant: MomentFormVariant;
  moment?: MomentAdapted;
  fetchMomentFormsData: FetchMomentFormsData;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment?: DeleteMoment;
  now: string;
  setIsCRUDOpSuccessful: SetState<boolean>;
  allButtonsDisabled: boolean;
  pageMomentId?: string;
}) {
  const nowRoundedUpTenMinutes = roundTimeUpTenMinutes(now);

  const { destinationOptions } = use(fetchMomentFormsData);

  const isVariantUpdatingMoment = variant === "updating" && moment;

  // datetime-local input is now controlled for dynamic moment and steps times
  let [startMomentDate, setStartMomentDate] = useState(
    isVariantUpdatingMoment ? moment.startDateAndTime : nowRoundedUpTenMinutes,
  );

  const momentSteps: StepFromClient[] | undefined = moment?.steps.map((e) => {
    return {
      id: e.key,
      intitule: e.title,
      details: e.details,
      duree: e.duration,
    };
  });

  let [steps, setSteps] = useState<StepFromClient[]>(
    isVariantUpdatingMoment && momentSteps ? momentSteps : [],
  );

  const stepsCompoundDurations = makeStepsCompoundDurationsArray(steps);

  let [currentStepId, setCurrentStepId] = useState("");
  let currentStep = steps.find((step) => step.id === currentStepId);

  let [stepVisible, setStepVisible] = useState<StepVisible>(
    !isVariantUpdatingMoment ? "creating" : "create",
  );

  // number input also controlled for expected dynamic changes to moment timing even before confirm the step while changing its duration
  let [stepDureeCreate, setStepDureeCreate] = useState(STEP_DURATION_ORIGINAL);
  let [stepDureeUpdate, setStepDureeUpdate] = useState(
    currentStep ? currentStep.duree : STEP_DURATION_ORIGINAL,
  );

  let momentAddingTime = steps.reduce((acc, curr) => {
    // it is understood that curr.id === currentStepId can only happen when stepVisible === "updating"
    if (curr.id === currentStepId && stepVisible === "updating")
      return acc + +stepDureeUpdate;
    else return acc + +curr.duree;
  }, 0);

  if (stepVisible === "creating") momentAddingTime += +stepDureeCreate;

  let endMomentDate = format(
    add(startMomentDate, {
      minutes: momentAddingTime,
    }),
    "yyyy-MM-dd'T'HH:mm",
  );

  let [destinationSelect, setDestinationSelect] = useState(false);
  let [activitySelect, setActivitySelect] = useState(false);

  // InputSwitch key to reset InputSwitch with the form reset (Radix bug)
  const [inputSwitchKey, setInputSwitchKey] = useState("");

  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  // createOrUpdateMomentAction

  const [createOrUpdateMomentState, setCreateOrUpdateMomentState] =
    useState<CreateOrUpdateMomentState>(null);

  const [isCreateOrUpdateMomentPending, startCreateOrUpdateMomentTransition] =
    useTransition();

  // indispensable if I want to localize my after flows
  const [isCreateOrUpdateMomentDone, setIsCreateOrUpdateMomentDone] =
    useState(false);

  const createOrUpdateMomentAction = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    startCreateOrUpdateMomentTransition(async () => {
      // an "action flow" is a bridge between a server action and the immediate impacts it is expected to have on the client
      const state = await createOrUpdateMomentClientFlow(
        event,
        createOrUpdateMoment,
        variant,
        startMomentDate,
        steps,
        moment,
        destinationSelect,
        activitySelect,
        createOrUpdateMomentState,
      );

      setCreateOrUpdateMomentState(state);
      setIsCreateOrUpdateMomentDone(true);
    });
  };

  useEffect(() => {
    if (isCreateOrUpdateMomentDone && createOrUpdateMomentState) {
      // an "after flow" is the set of subsequent client impacts that follow the end of the preceding "action-flow" based on its side effects
      createOrUpdateMomentAfterFlow(
        variant,
        createOrUpdateMomentState,
        setCreateOrUpdateMomentState,
        setIsCRUDOpSuccessful,
        searchParams,
        push,
        pathname,
      );

      setIsCreateOrUpdateMomentDone(false);
    }
  }, [isCreateOrUpdateMomentDone]);

  // resetMomentFormAction

  const [isResetMomentPending, startResetMomentTransition] = useTransition();

  const [isResetMomentDone, setIsResetMomentDone] = useState(false);

  const resetMomentAction = (event: FormEvent<HTMLFormElement>) => {
    startResetMomentTransition(() => {
      const noConfirm =
        // @ts-ignore might not work on mobile but it's a bonus
        event.nativeEvent.explicitOriginalTarget?.type !== "reset"; // could be improved later in case an even upper reset buton triggers this reset action

      // retroactive high level JavaScript, but honestly this should be done on any action that uses a confirm, assuming that action can be triggered externally and automatically
      // This allows that wherever I reset the form but triggering its HTML reset, it gets fully reset including controlled fields and default states, and even resets its cascading "children forms" since this resetMoment actually triggers the reset of stepFromCreating.
      if (
        noConfirm ||
        confirm("Êtes-vous sûr de vouloir réinitialiser le formulaire ?")
      ) {
        const state = resetMomentClientFlow(
          setStartMomentDate,
          setSteps,
          setStepVisible,
          variant,
          setInputSwitchKey,
          setDestinationSelect,
          setActivitySelect,
        );

        setCreateOrUpdateMomentState(state);
        setIsResetMomentDone(true);
      } else event.preventDefault();
    });
  };

  useEffect(() => {
    if (isResetMomentDone) {
      resetMomentAfterFlow(variant);

      setIsResetMomentDone(false);
    }
  }, [isResetMomentDone]);

  // deleteMomentAction

  const [isDeleteMomentPending, startDeleteMomentTransition] = useTransition();

  const [isDeleteMomentDone, setIsDeleteMomentDone] = useState(false);

  const deleteMomentAction = async () => {
    startDeleteMomentTransition(async () => {
      if (confirm("Êtes-vous sûr de vouloir effacer ce moment ?")) {
        const state = await deleteMomentClientFlow(deleteMoment, moment);

        setCreateOrUpdateMomentState(state);
        setIsDeleteMomentDone(true);
      }
    });
  };

  useEffect(() => {
    if (isDeleteMomentDone && createOrUpdateMomentState) {
      deleteMomentAfterFlow(
        variant,
        createOrUpdateMomentState,
        setIsCRUDOpSuccessful,
        searchParams,
        push,
        pathname,
      );

      setIsDeleteMomentDone(false);
    }
  }, [isDeleteMomentDone]);

  // step actions
  // to access step actions' isPending states from their parent component (MomentForms)

  // addStepAction

  const [isAddStepPending, startAddStepTransition] = useTransition();

  const addStepAction = () => {
    startAddStepTransition(() => {
      setStepVisible("creating");
      setStepDureeCreate(STEP_DURATION_ORIGINAL);
    });
  };

  // cancelStepAction

  const [isCancelStepPending, startCancelStepTransition] = useTransition();

  const cancelStepAction = () => {
    startCancelStepTransition(() => {
      setStepVisible("create");
      setStepDureeCreate(STEP_DURATION_ORIGINAL);
      setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
    });
  };

  // createOrUpdateStepAction

  const [isCreateStepPending, startCreateStepTransition] = useTransition();

  const [isUpdateStepPending, startUpdateStepTransition] = useTransition();

  // resetStepAction

  const [isResetStepPending, startResetStepTransition] = useTransition();

  // deleteStepAction

  const [isDeleteStepPending, startDeleteStepTransition] = useTransition();

  // steps animation controls

  const [isAnimationDelayed, setIsAnimationDelayed] = useState(false);

  return (
    <>
      <StepForm
        variant="creating"
        momentFormVariant={variant}
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        stepDuree={stepDureeCreate}
        setStepDuree={setStepDureeCreate}
        startCreateOrUpdateStepTransition={startCreateStepTransition}
        startResetStepTransition={startResetStepTransition}
        createOrUpdateMomentState={createOrUpdateMomentState}
        setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
        setIsAnimationDelayed={setIsAnimationDelayed}
      />
      <StepForm
        variant="updating"
        momentFormVariant={variant}
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        stepDuree={stepDureeUpdate}
        setStepDuree={setStepDureeUpdate}
        startCreateOrUpdateStepTransition={startUpdateStepTransition}
        startResetStepTransition={startResetStepTransition}
        createOrUpdateMomentState={createOrUpdateMomentState}
        setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
      />
      {/* <Form */}
      {/* action={createOrUpdateMomentAction} // It still works despite the TypeScript error, but I don't know where it will break and I don't need it right now. Again, regular HTML/CSS/JS and regular React should always be prioritized if they do the work and don't significantly hinder the developer experience. */}
      <form
        onSubmit={createOrUpdateMomentAction}
        onReset={resetMomentAction}
        id={momentFormIds[variant].momentForm}
        noValidate
      >
        <GlobalServerComponents.FormSection
          topic="moment"
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
          id={momentFormIds[variant].yourMoment}
          error={createOrUpdateMomentState?.error?.momentMessages?.message}
          subError={
            createOrUpdateMomentState?.error?.momentMessages?.subMessage
          }
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
        >
          <LocalServerComponents.MomentInputs
            variant={variant}
            moment={moment}
            destinationOptions={destinationOptions}
            createOrUpdateMomentState={createOrUpdateMomentState}
            destinationSelect={destinationSelect}
            setDestinationSelect={setDestinationSelect}
            activitySelect={activitySelect}
            setActivitySelect={setActivitySelect}
            inputSwitchKey={inputSwitchKey}
            startMomentDate={startMomentDate}
            setStartMomentDate={setStartMomentDate}
          />
        </GlobalServerComponents.FormSection>
        <GlobalServerComponents.Divider />
        <GlobalServerComponents.FormSection
          topic="steps"
          title="Ses étapes"
          description="Établissez une par une les étapes du déroulé de votre moment, de la manière la plus segmentée que vous désirez."
          id={momentFormIds[variant].itsSteps}
          error={createOrUpdateMomentState?.error?.stepsMessages?.message}
          subError={createOrUpdateMomentState?.error?.stepsMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
        >
          <Reorder.Group // steps
            axis="y"
            values={steps}
            onReorder={setSteps}
            as="ol"
          >
            <AnimatePresence initial={false}>
              {steps.map((step, index) => {
                // this needs to stay up there because it depends from an information obtained in MomentForms (even though I am now passing it down as a property)
                let stepAddingTime =
                  index === 0 ? 0 : stepsCompoundDurations[index - 1];

                const currentStepIndex = steps.findIndex(
                  (e) => e.id === currentStepId,
                );
                const isAfterCurrentStep = index > currentStepIndex;

                if (
                  currentStep &&
                  currentStepIndex > -1 &&
                  isAfterCurrentStep
                ) {
                  stepAddingTime =
                    stepAddingTime - +currentStep.duree + +stepDureeUpdate;
                }

                return (
                  <ReorderItem // step
                    key={step.id}
                    step={step}
                    index={index}
                    isAfterCurrentStep={isAfterCurrentStep}
                    momentFormVariant={variant}
                    steps={steps}
                    stepVisible={stepVisible}
                    currentStepId={currentStepId}
                    setCurrentStepId={setCurrentStepId}
                    setStepVisible={setStepVisible}
                    startMomentDate={startMomentDate}
                    stepAddingTime={stepAddingTime}
                    setSteps={setSteps}
                    isUpdateStepPending={isUpdateStepPending}
                    stepDureeUpdate={stepDureeUpdate}
                    setStepDureeUpdate={setStepDureeUpdate}
                    createOrUpdateMomentState={createOrUpdateMomentState}
                    setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
                    stepsCompoundDurations={stepsCompoundDurations}
                    isDeleteStepPending={isDeleteStepPending}
                    startDeleteStepTransition={startDeleteStepTransition}
                    allButtonsDisabled={allButtonsDisabled}
                    setStepDureeCreate={setStepDureeCreate}
                    isAnimationDelayed={isAnimationDelayed}
                    setIsAnimationDelayed={setIsAnimationDelayed}
                  />
                );
              })}
            </AnimatePresence>
          </Reorder.Group>

          <MotionAddStepVisible
            stepVisible={stepVisible}
            variant={variant}
            isResetStepPending={isResetStepPending}
            createOrUpdateMomentState={createOrUpdateMomentState}
            stepDureeCreate={stepDureeCreate}
            setStepDureeCreate={setStepDureeCreate}
            isCreateStepPending={isCreateStepPending}
            cancelStepAction={cancelStepAction}
            steps={steps}
            isCancelStepPending={isCancelStepPending}
            stepsCompoundDurations={stepsCompoundDurations}
            startMomentDate={startMomentDate}
            allButtonsDisabled={allButtonsDisabled}
            addStepAction={addStepAction}
            isAddStepPending={isAddStepPending}
          />

          <LocalServerComponents.StepsSummaries
            stepVisible={stepVisible}
            endMomentDate={endMomentDate}
            momentAddingTime={momentAddingTime}
          />
        </GlobalServerComponents.FormSection>
        <GlobalServerComponents.Divider />
        <GlobalServerComponents.Section>
          {/* Doubling up instead of reverse for accessibility */}
          <div className="flex">
            {/* Mobile */}
            <div className="flex w-full flex-col gap-4 md:hidden">
              <LocalServerComponents.ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
              <LocalServerComponents.ResetOrEraseMomentButton
                variant={variant}
                deleteMomentAction={deleteMomentAction}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              <LocalServerComponents.ResetOrEraseMomentButton
                variant={variant}
                deleteMomentAction={deleteMomentAction}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
              <LocalServerComponents.ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
            </div>
          </div>
        </GlobalServerComponents.Section>
      </form>
    </>
  );
}

export function ReorderItem({
  step,
  index,
  isAfterCurrentStep,
  momentFormVariant,
  steps,
  stepVisible,
  currentStepId,
  setCurrentStepId,
  setStepVisible,
  startMomentDate,
  stepAddingTime,
  setSteps,
  isUpdateStepPending,
  stepDureeUpdate,
  setStepDureeUpdate,
  createOrUpdateMomentState,
  setCreateOrUpdateMomentState,
  stepsCompoundDurations,
  isDeleteStepPending,
  startDeleteStepTransition,
  allButtonsDisabled,
  setStepDureeCreate,
  isAnimationDelayed,
  setIsAnimationDelayed,
}: {
  step: StepFromClient;
  index: number;
  isAfterCurrentStep: boolean;
  momentFormVariant: MomentFormVariant;
  steps: StepFromClient[];
  stepVisible: StepVisible;
  currentStepId: string;
  setCurrentStepId: SetState<string>;
  setStepVisible: SetState<StepVisible>;
  startMomentDate: string;
  stepAddingTime: number;
  setSteps: SetState<StepFromClient[]>;
  isUpdateStepPending: boolean;
  stepDureeUpdate: string;
  setStepDureeUpdate: SetState<string>;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>;
  stepsCompoundDurations: number[];
  isDeleteStepPending: boolean;
  startDeleteStepTransition: TransitionStartFunction;
  allButtonsDisabled: boolean;
  setStepDureeCreate: SetState<string>;
  isAnimationDelayed: boolean;
  setIsAnimationDelayed: SetState<boolean>;
}) {
  const controls = useDragControls();

  const isCurrentStepUpdating =
    currentStepId === step.id && stepVisible === "updating";

  const hasAPreviousStepUpdating =
    isAfterCurrentStep && stepVisible === "updating";

  const form = momentFormIds[momentFormVariant].stepFormUpdating;

  // deleteStepAction

  const deleteStepAction = () => {
    startDeleteStepTransition(() => {
      if (confirm("Êtes-vous sûr de vouloir effacer cette étape ?")) {
        deleteStepClientFlow(
          steps,
          currentStepId,
          setSteps,
          setStepVisible,
          setStepDureeCreate,
        );
        setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
      }
    });
  };

  // restoreStepAction

  const [isRestoreStepPending, startRestoreStepTransition] = useTransition();

  // The jumping is simply due to a current lack of animations
  // ...which I may or may not end up modifying.
  // ...And did indeed end up modifying.
  const restoreStepAction = () => {
    startRestoreStepTransition(() => {
      setStepVisible("create");
      setCurrentStepId("");
      setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
    });
  };

  // modifyStepAction

  const [isModifyStepPending, startModifyStepTransition] = useTransition();

  // just like restoreStepAction, there's no need to import this action from an external file (at least at this time) since it is very specific to ReorderItem
  const modifyStepAction = () => {
    startModifyStepTransition(() => {
      setCurrentStepId(step.id);
      setStepDureeUpdate(step.duree);
      setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
      setStepVisible("updating");
    });
  };

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{
        // delays must be conditional
        opacity: {
          duration: SHARED_OPACITY_DURATION,
          delay: isAnimationDelayed ? SHARED_HEIGHT_DURATION : 0,
        },
        height: {
          duration: SHARED_HEIGHT_DURATION,
          delay: isAnimationDelayed ? SHARED_HEIGHT_DURATION : 0,
        },
      }}
      onAnimationStart={() => {
        if (isAnimationDelayed) setIsAnimationDelayed(false);
      }}
    >
      <Reorder.Item
        value={step}
        dragListener={false}
        dragControls={controls}
        transition={{ layout: { duration: 0 } }} // still buggy when adding duration, so sticking to 0
        // layout="position" // or "preserve-aspect"
        dragTransition={{
          bounceStiffness: 900,
          bounceDamping: 50,
        }}
        // whileDrag={{ opacity: 0.5 }} // buggy though
      >
        <div className={clsx("flex flex-col gap-y-8", "pb-9")}>
          <div className="flex select-none items-baseline justify-between">
            <p
              className={clsx(
                "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
                "transition-colors",
                stepVisible !== "updating" &&
                  "hover:cursor-pointer hover:text-neutral-400", // can't work on active because it's inconsistent. (buggy)
              )}
              onPointerDown={(event) => {
                if (stepVisible !== "updating") controls.start(event);
              }}
              style={{ touchAction: "none" }}
            >
              Étape <span>{toWordsing(index + 1)}</span>
            </p>{" "}
            {isCurrentStepUpdating ? (
              <GlobalClientComponents.Button
                type="button"
                variant="destroy-step"
                onClick={restoreStepAction}
                disabled={allButtonsDisabled || isRestoreStepPending}
              >
                Restaurer l&apos;étape
              </GlobalClientComponents.Button>
            ) : (
              <GlobalClientComponents.Button
                variant="destroy-step"
                type="button"
                onClick={modifyStepAction}
                disabled={allButtonsDisabled || isModifyStepPending}
              >
                Modifier cette étape
              </GlobalClientComponents.Button>
            )}
          </div>
          <MotionIsCurrentStepUpdating
            isCurrentStepUpdating={isCurrentStepUpdating}
            form={form}
            createOrUpdateMomentState={createOrUpdateMomentState}
            stepDureeUpdate={stepDureeUpdate}
            setStepDureeUpdate={setStepDureeUpdate}
            step={step}
            startMomentDate={startMomentDate}
            stepAddingTime={stepAddingTime}
            stepsCompoundDurations={stepsCompoundDurations}
            isUpdateStepPending={isUpdateStepPending}
            allButtonsDisabled={allButtonsDisabled}
            deleteStepAction={deleteStepAction}
            isDeleteStepPending={isDeleteStepPending}
            index={index}
            hasAPreviousStepUpdating={hasAPreviousStepUpdating}
          />
        </div>
      </Reorder.Item>
    </motion.div>
  );
}

// Caution: component may break under prolonged interruptability.
function MotionIsCurrentStepUpdating({
  isCurrentStepUpdating,
  form,
  createOrUpdateMomentState,
  stepDureeUpdate,
  setStepDureeUpdate,
  step,
  startMomentDate,
  stepAddingTime,
  stepsCompoundDurations,
  isUpdateStepPending,
  allButtonsDisabled,
  deleteStepAction,
  isDeleteStepPending,
  index,
  hasAPreviousStepUpdating,
}: {
  isCurrentStepUpdating: boolean;
  form: string;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  stepDureeUpdate: string;
  setStepDureeUpdate: SetState<string>;
  step: StepFromClient;
  startMomentDate: string;
  stepAddingTime: number;
  stepsCompoundDurations: number[];
  isUpdateStepPending: boolean;
  allButtonsDisabled: boolean;
  deleteStepAction: () => void;
  isDeleteStepPending: boolean;
  index: number;
  hasAPreviousStepUpdating: boolean;
}) {
  const [ref, bounds] = useMeasure();
  const reference = ref as Ref<HTMLDivElement>;

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
      transition={{ duration: SHARED_HEIGHT_DURATION }}
    >
      <div ref={reference}>
        <AnimatePresence initial={false} mode="popLayout">
          {isCurrentStepUpdating ? (
            <motion.div
              key={"StepInputs"}
              variants={variants}
              initial={"hidden"}
              animate={"visible"}
              exit={"hidden"}
              transition={{ duration: SHARED_OPACITY_DURATION }}
            >
              <div className="flex flex-col gap-y-8">
                <LocalServerComponents.StepInputs
                  form={form}
                  createOrUpdateMomentState={createOrUpdateMomentState}
                  stepDuree={stepDureeUpdate}
                  setStepDuree={setStepDureeUpdate}
                  step={step}
                  startMomentDate={startMomentDate}
                  stepAddingTime={stepAddingTime}
                  stepsCompoundDurations={stepsCompoundDurations}
                />
                <div>
                  {/* Mobile */}
                  <LocalServerComponents.StepFormControlsMobileWrapper>
                    <LocalServerComponents.UpdateStepButton
                      form={form}
                      isUpdateStepPending={isUpdateStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                    <LocalServerComponents.EraseStepButton
                      form={form}
                      deleteStepAction={deleteStepAction}
                      isDeleteStepPending={isDeleteStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </LocalServerComponents.StepFormControlsMobileWrapper>
                  {/* Desktop */}
                  <LocalServerComponents.StepFormControlsDesktopWrapper>
                    <LocalServerComponents.EraseStepButton
                      form={form}
                      deleteStepAction={deleteStepAction}
                      isDeleteStepPending={isDeleteStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                    <LocalServerComponents.UpdateStepButton
                      form={form}
                      isUpdateStepPending={isUpdateStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </LocalServerComponents.StepFormControlsDesktopWrapper>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={"StepContents"}
              variants={variants}
              initial={"hidden"}
              animate={"visible"}
              exit={"hidden"}
              transition={{ duration: SHARED_OPACITY_DURATION }}
            >
              <LocalServerComponents.StepContents
                step={step}
                index={index}
                hasAPreviousStepUpdating={hasAPreviousStepUpdating}
                startMomentDate={startMomentDate}
                stepAddingTime={stepAddingTime}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MotionAddStepVisible({
  stepVisible,
  variant,
  isResetStepPending,
  createOrUpdateMomentState,
  stepDureeCreate,
  setStepDureeCreate,
  isCreateStepPending,
  cancelStepAction,
  steps,
  isCancelStepPending,
  stepsCompoundDurations,
  startMomentDate,
  allButtonsDisabled,
  addStepAction,
  isAddStepPending,
}: {
  stepVisible: StepVisible;
  variant: MomentFormVariant;
  isResetStepPending: boolean;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  stepDureeCreate: string;
  setStepDureeCreate: SetState<string>;
  isCreateStepPending: boolean;
  cancelStepAction: () => void;
  steps: StepFromClient[];
  isCancelStepPending: boolean;
  stepsCompoundDurations: number[];
  startMomentDate: string;
  allButtonsDisabled: boolean;
  addStepAction: () => void;
  isAddStepPending: boolean;
}) {
  const [ref, bounds] = useMeasure();
  const reference = ref as Ref<HTMLDivElement>;

  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.div
      animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
      transition={{ duration: SHARED_HEIGHT_DURATION }}
    >
      <div ref={reference}>
        <AnimatePresence initial={false} mode="popLayout">
          {(() => {
            switch (stepVisible) {
              case "creating":
                return (
                  <motion.div
                    key={"stepVisibleCreating"}
                    variants={variants}
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"hidden"}
                    transition={{ duration: SHARED_OPACITY_DURATION }}
                    className="pb-9" // formerly shared between StepsSummaries
                  >
                    <LocalServerComponents.StepVisibleCreating
                      key={stepVisible}
                      momentFormVariant={variant}
                      isResetStepPending={isResetStepPending}
                      createOrUpdateMomentState={createOrUpdateMomentState}
                      stepDureeCreate={stepDureeCreate}
                      setStepDureeCreate={setStepDureeCreate}
                      isCreateStepPending={isCreateStepPending}
                      cancelStepAction={cancelStepAction}
                      steps={steps}
                      isCancelStepPending={isCancelStepPending}
                      stepsCompoundDurations={stepsCompoundDurations}
                      startMomentDate={startMomentDate}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </motion.div>
                );
              default:
                return (
                  <motion.div
                    key={"stepVisibleCreate"}
                    variants={variants}
                    initial={"hidden"}
                    animate={"visible"}
                    exit={"hidden"}
                    transition={{ duration: SHARED_OPACITY_DURATION }}
                    className="pb-9"
                  >
                    <LocalServerComponents.StepVisibleCreate
                      key={stepVisible}
                      addStepAction={addStepAction}
                      isAddStepPending={isAddStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </motion.div>
                );
            }
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function StepForm({
  variant,
  momentFormVariant,
  currentStepId,
  steps,
  setSteps,
  setStepVisible,
  stepDuree,
  setStepDuree,
  startCreateOrUpdateStepTransition,
  startResetStepTransition,
  createOrUpdateMomentState,
  setCreateOrUpdateMomentState,
  setIsAnimationDelayed,
}: {
  variant: StepFormVariant;
  momentFormVariant: MomentFormVariant;
  currentStepId: string;
  steps: StepFromClient[];
  setSteps: SetState<StepFromClient[]>;
  setStepVisible: SetState<StepVisible>;
  stepDuree: string;
  setStepDuree: SetState<string>;
  startCreateOrUpdateStepTransition: TransitionStartFunction;
  startResetStepTransition: TransitionStartFunction;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>;
  setIsAnimationDelayed?: SetState<boolean>;
}) {
  const stepFormId =
    variant === "updating"
      ? momentFormIds[momentFormVariant].stepFormUpdating
      : momentFormIds[momentFormVariant].stepFormCreating;

  // createOrUpdateStepAction

  const createOrUpdateStepAction = (event: FormEvent<HTMLFormElement>) => {
    startCreateOrUpdateStepTransition(() => {
      const state = createOrUpdateStepClientFlow(
        event,
        stepDuree,
        steps,
        variant,
        currentStepId,
        setSteps,
        setStepVisible,
        createOrUpdateMomentState,
        setIsAnimationDelayed,
      );

      setCreateOrUpdateMomentState(state);
    });
  };

  // resetStepAction

  const resetStepAction = (event: FormEvent<HTMLFormElement>) => {
    startResetStepTransition(() => {
      // do not confirm if reset is not triggered by stepFormCreating
      const noConfirm =
        // @ts-ignore Typescript unaware of explicitOriginalTarget (but is correct in some capacity because mobile did not understand)
        event.nativeEvent.explicitOriginalTarget?.form?.id !==
        // triggers confirm only if original intent is from stepFormCreating
        momentFormIds[momentFormVariant].stepFormCreating;

      if (
        // Attention please: this right here HARD LEVEL JAVASCRIPT.
        noConfirm ||
        confirm("Êtes-vous sûr de vouloir réinitialiser cette étape ?")
      ) {
        const state = resetStepClientFlow(
          setStepDuree,
          createOrUpdateMomentState,
        );

        setCreateOrUpdateMomentState(state);
      } else event.preventDefault();
    });
  };

  return (
    <form
      id={stepFormId}
      onSubmit={createOrUpdateStepAction}
      onReset={resetStepAction}
      noValidate
    ></form>
  );
}

export function SetViewButton({ view }: { view: View }) {
  const desiredView = defineDesiredView(view);

  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <GlobalClientComponents.Button
      type="button"
      variant="destroy-step"
      onClick={() =>
        scrollToTopOfDesiredView(desiredView, searchParams, push, pathname)
      }
    >
      {(() => {
        switch (desiredView) {
          // no case views.UPDATE_MOMENT, since moment-specific
          case views.READ_MOMENTS:
            return <>Vos moments</>;
          case views.CREATE_MOMENT:
            return <>Créez un moment</>;
          default:
            return null;
        }
      })()}
    </GlobalClientComponents.Button>
  );
}

// keeping ClientCore and Main a comments to highlight the server-side progress made
const localClientComponents = {
  // ClientCore,
  // Main,
  ViewsCarouselContainer, // next maybe
  ViewSegment, // known max
  ReadMomentsView,
  SetSubViewButton,
  RevalidateMomentsButton,
  SearchForm,
  UpdateMomentViewButton,
  MomentForms,
  PaginationButton,
  StepForm,
  ReorderItem,
  SetViewButton,
} as const;

export type LocalClientComponentsName = keyof typeof localClientComponents;
