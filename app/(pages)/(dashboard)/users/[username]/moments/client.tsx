"use client"; // It is decided that every component should be exported even if it isn't being used elsewhere, so that when it happens to become needed elsewhere it doesn't become necessary to scroll through the whole file, find that component, and manually export it.

import {
  FormEvent,
  MouseEvent,
  Ref,
  TransitionStartFunction,
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

import * as Icons from "@/app/icons";
import * as LocalServerComponents from "./server";
import * as GlobalServerComponents from "@/app/components/server";
import * as GlobalClientComponents from "@/app/components/client";
import {
  CreateOrUpdateMoment,
  CreateOrUpdateMomentState,
  DeleteMoment,
  MomentFormVariant,
  MomentToCRUD,
  RevalidateMoments,
  MomentsSearchParamsKey,
  StepFormVariant,
  StepFromCRUD,
  StepVisible,
  SubView,
  UserMomentsToCRUD,
  View,
  MomentsSearchParams,
  TrueCreateOrUpdateMomentState,
  TrueCreateOrUpdateMoment,
  TrueDeleteMoment,
  CreateOrUpdateMomentError,
  CreateOrUpdateMomentSuccess,
} from "@/app/types/moments";
import { Option, SetState, TypedURLSearchParams } from "@/app/types/globals";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  INITIAL_PAGE,
  MOMENT_FORM_IDS,
  PASTUSERMOMENTSPAGE,
  SEARCH_FORM_ID,
  STEP_DURATION_ORIGINAL,
  SUBVIEW,
  subViews,
  subViewTitles,
  USERMOMENTSPAGE,
  views,
} from "@/app/data/moments";
import {
  defineCurrentPage,
  defineDesiredView,
  makeStepsCompoundDurationsArray,
  numStringToTimeString,
  removeMomentMessagesAndErrorsCallback,
  removeStepsMessagesAndErrorsCallback,
  rotateSearchParams,
  roundTimeUpTenMinutes,
  scrollToTopOfDesiredView,
  toWordsing,
  trueRemoveStepsMessagesAndErrorsCallback,
} from "@/app/utilities/moments";
import {
  createOrUpdateStepClientFlow,
  deleteMomentClientFlow,
  deleteStepClientFlow,
  resetMomentClientFlow,
  resetStepClientFlow,
  revalidateMomentsClientFlow,
  trueCreateOrUpdateMomentClientFlow,
  trueCreateOrUpdateStepClientFlow,
  trueDeleteMomentClientFlow,
  trueResetMomentClientFlow,
  trueResetStepClientFlow,
} from "@/app/flows/client/moments";
import {
  resetMomentAfterFlow,
  trueCreateOrUpdateMomentAfterFlow,
  trueDeleteMomentAfterFlow,
} from "@/app/flows/after/moments";
import { UseMeasureRect } from "react-use/lib/useMeasure";

// this is now where the client-side begins, from ClientCore to Main and now to container of the carousel
export function ViewsCarouselContainer({
  view,
  now,
  allUserMomentsToCRUD,
  maxPages,
  destinationOptions,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
  moment,
  subView,
}: {
  view: View;
  now: string;
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  destinationOptions: Option[];
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: TrueCreateOrUpdateMoment;
  deleteMoment: TrueDeleteMoment;
  moment: MomentToCRUD | undefined;
  subView: SubView;
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
        x: `-${views.indexOf(view) * 100}%`,
      }}
      initial={false}
      transition={{
        type: "spring",
        // createOrUpdateMomentState.isSuccess
        bounce: isCRUDOpSuccessful ? 0.2 : 0,
        duration: isCRUDOpSuccessful ? 0.4 : 0.2,
      }}
      onAnimationStart={() => setIsCRUDOpSuccessful(false)}
      style={{
        height: currentViewHeight,
      }}
    >
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== "update-moment"}
      >
        <ViewSegment
          id="update-moment"
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* UpdateMomentView */}
          <MomentForms
            key={view} // to remount every time the view changes, because its when it's mounted that the default values are applied based on the currently set moment
            variant="updating"
            moment={moment}
            destinationOptions={destinationOptions}
            createOrUpdateMoment={createOrUpdateMoment}
            deleteMoment={deleteMoment}
            now={now}
            setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
            allButtonsDisabled={view !== "update-moment"}
          />
        </ViewSegment>
      </LocalServerComponents.PageSegment>
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== "read-moments"}
      >
        <ViewSegment
          id="read-moments"
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          <ReadMomentsView
            allUserMomentsToCRUD={allUserMomentsToCRUD}
            maxPages={maxPages}
            view={view}
            subView={subView}
            revalidateMoments={revalidateMoments}
            allButtonsDisabled={view !== "read-moments"}
          />
        </ViewSegment>
      </LocalServerComponents.PageSegment>
      <LocalServerComponents.PageSegment
        isSegmentContainerInvisible={view !== "create-moment"}
      >
        <ViewSegment
          id="create-moment"
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* CreateMomentView */}
          <MomentForms
            variant="creating"
            destinationOptions={destinationOptions}
            createOrUpdateMoment={createOrUpdateMoment}
            now={now}
            setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
            allButtonsDisabled={view !== "create-moment"}
          />
        </ViewSegment>
      </LocalServerComponents.PageSegment>
    </motion.div>
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
          // no case "update-moment", since moment-specific
          case "read-moments":
            return <>Vos moments</>;
          case "create-moment":
            return <>Créez un moment</>;
          default:
            return null;
        }
      })()}
    </GlobalClientComponents.Button>
  );
}

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

export function ReadMomentsView({
  allUserMomentsToCRUD,
  maxPages,
  view,
  subView,
  revalidateMoments,
  allButtonsDisabled,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  view: View;
  subView: SubView;
  revalidateMoments: RevalidateMoments;
  allButtonsDisabled: boolean;
}) {
  const [
    realAllMoments,
    realPastMoments,
    realCurrentMoments,
    realFutureMoments,
  ] = allUserMomentsToCRUD;

  const realShowcaseMoments: { [K in SubView]: UserMomentsToCRUD } = {
    "all-moments": realAllMoments,
    "past-moments": realPastMoments,
    "current-moments": realCurrentMoments,
    "future-moments": realFutureMoments,
  };

  let realDisplayedMoments = realAllMoments.dates;
  if (subView !== undefined && subViews.includes(subView))
    realDisplayedMoments = realShowcaseMoments[subView].dates;

  let realMoments: MomentToCRUD[] = [];
  realDisplayedMoments.forEach((e) =>
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
    ) as TypedURLSearchParams<MomentsSearchParams>;

    if (term) newSearchParams.set(CONTAINS, term);
    else newSearchParams.delete(CONTAINS);

    newSearchParams.delete(USERMOMENTSPAGE);
    newSearchParams.delete(PASTUSERMOMENTSPAGE);
    newSearchParams.delete(CURRENTUSERMOMENTSPAGE);
    newSearchParams.delete(FUTUREUSERMOMENTSPAGE);

    replace(`${pathname}?${newSearchParams.toString()}`);
  } // https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const subViewSearchParams: { [K in SubView]: MomentsSearchParamsKey } = {
    "all-moments": USERMOMENTSPAGE,
    "past-moments": PASTUSERMOMENTSPAGE,
    "current-moments": CURRENTUSERMOMENTSPAGE,
    "future-moments": FUTUREUSERMOMENTSPAGE,
  };

  const [
    maxPageAllMoments,
    maxPagePastMoments,
    maxPageCurrentMoments,
    maxPageFutureMoments,
  ] = maxPages;

  let subViewMaxPages: { [K in SubView]: number } = {
    "all-moments": maxPageAllMoments,
    "past-moments": maxPagePastMoments,
    "current-moments": maxPageCurrentMoments,
    "future-moments": maxPageFutureMoments,
  };

  const currentPage = defineCurrentPage(
    INITIAL_PAGE,
    Number(searchParams.get(subViewSearchParams[subView])),
    subViewMaxPages[subView],
  );

  // for now search and pagination will remain handlers
  function handlePagination(direction: "left" | "right", subView: SubView) {
    const newSearchParams = new URLSearchParams(
      searchParams,
    ) as TypedURLSearchParams<MomentsSearchParams>;

    if (direction === "left")
      newSearchParams.set(
        subViewSearchParams[subView],
        Math.max(INITIAL_PAGE, currentPage - 1).toString(),
      );
    else
      newSearchParams.set(
        subViewSearchParams[subView],
        Math.min(subViewMaxPages[subView], currentPage + 1).toString(),
      );

    if (
      newSearchParams.get(subViewSearchParams[subView]) ===
      INITIAL_PAGE.toString()
    )
      newSearchParams.delete(subViewSearchParams[subView]);

    replace(`${pathname}?${newSearchParams.toString()}`);
  }

  const rotateSubView = (direction: "left" | "right") =>
    rotateSearchParams(
      direction,
      SUBVIEW,
      subViews,
      subView,
      searchParams,
      pathname,
      replace,
    );

  useKeypress("ArrowLeft", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("left"); // does not update the time because it speaks exclusively to the client // not anymore
      } else {
        if (currentPage !== 1) handlePagination("left", subView); // updates the time because it speaks to the server (and the database)
      }
    }
  });

  useKeypress("ArrowRight", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("right"); // does not update the time because it speaks exclusively to the client // not anymore
      } else {
        if (currentPage !== subViewMaxPages[subView])
          handlePagination("right", subView); // updates the time because it speaks to the server (and the database)
      }
    }
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const { scrollY } = useScroll();

  // again, debounce-bound so not turned into an action
  const settingScrollPosition = (latest: number) => setScrollPosition(latest);

  const debouncedSettingScrollPosition = debounce(settingScrollPosition, 100);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (view === "read-moments") debouncedSettingScrollPosition(latest);
    else debouncedSettingScrollPosition(0);
  });

  useEffect(() => {
    window.scrollTo({ top: scrollPosition });
  }, [allUserMomentsToCRUD, currentPage]);

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
        {subViews.map((e) => (
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
      {realDisplayedMoments.length > 0 ? (
        <>
          {realDisplayedMoments.map((e, i, a) => (
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
                        key={e2.id + i.toString()}
                        e2={e2}
                        realMoments={realMoments}
                      />
                    );
                  })}
                </LocalServerComponents.DateCard>
              </div>
              {i === a.length - 1 && (
                <LocalServerComponents.MomentsPageDetails e={e} />
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
                allButtonsDisabled || currentPage === subViewMaxPages[subView]
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

export function MomentForms({
  variant,
  moment,
  destinationOptions,
  createOrUpdateMoment,
  deleteMoment,
  now,
  setIsCRUDOpSuccessful,
  allButtonsDisabled,
}: {
  variant: MomentFormVariant;
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  createOrUpdateMoment: TrueCreateOrUpdateMoment;
  deleteMoment?: TrueDeleteMoment;
  now: string;
  setIsCRUDOpSuccessful: SetState<boolean>;
  allButtonsDisabled: boolean;
  pageMomentId?: string;
}) {
  const nowRoundedUpTenMinutes = roundTimeUpTenMinutes(now);

  const isVariantUpdatingMoment = variant === "updating" && moment;

  // datetime-local input is now controlled for dynamic moment and steps times
  let [startMomentDate, setStartMomentDate] = useState(
    isVariantUpdatingMoment ? moment.startDateAndTime : nowRoundedUpTenMinutes,
  );

  const momentSteps: StepFromCRUD[] | undefined = moment?.steps.map((e) => {
    return {
      id: e.id,
      intitule: e.title,
      details: e.details,
      duree: e.duration,
    };
  });

  let [steps, setSteps] = useState<StepFromCRUD[]>(
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
    useState<TrueCreateOrUpdateMomentState>(null);

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
      const state = await trueCreateOrUpdateMomentClientFlow(
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
      trueCreateOrUpdateMomentAfterFlow(
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
        const state = trueResetMomentClientFlow(
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
        const state = await trueDeleteMomentClientFlow(deleteMoment, moment);

        setCreateOrUpdateMomentState(state);
        setIsDeleteMomentDone(true);
      }
    });
  };

  useEffect(() => {
    if (isDeleteMomentDone && createOrUpdateMomentState) {
      trueDeleteMomentAfterFlow(
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
      setCreateOrUpdateMomentState(trueRemoveStepsMessagesAndErrorsCallback);
    });
  };

  // createOrUpdateStepAction

  const [isCreateStepPending, startCreateStepTransition] = useTransition();

  const [isUpdateStepPending, startUpdateStepTransition] = useTransition();

  // resetStepAction

  const [isResetStepPending, startResetStepTransition] = useTransition();

  // deleteStepAction

  const [isDeleteStepPending, startDeleteStepTransition] = useTransition();

  const [ref, bounds] = useMeasure();
  const reference = ref as Ref<HTMLDivElement>;

  const [ref2, bounds2] = useMeasure();
  const reference2 = ref2 as Ref<HTMLDivElement>;

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
        id={MOMENT_FORM_IDS[variant].momentForm}
        noValidate
      >
        <GlobalServerComponents.FormSection
          topic="moment"
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
          id={MOMENT_FORM_IDS[variant].yourMoment}
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
          id={MOMENT_FORM_IDS[variant].itsSteps}
          error={createOrUpdateMomentState?.error?.stepsMessages?.message}
          subError={createOrUpdateMomentState?.error?.stepsMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
        >
          {/* <motion.div
            animate={{ height: height > 0 ? height : "auto" }}
            transition={{ duration: 2 }}
          >
            <div ref={reference}>
              <AnimatePresence initial={false} mode="popLayout">
                {(() => {
                  switch (stepVisible) {
                    case "creating":
                      return (
                        <motion.div
                          key={"stepVisibleCreating"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1 }}
                        >
                          <LocalServerComponents.StepVisibleCreating
                            key={stepVisible}
                            momentFormVariant={variant}
                            isResetStepPending={isResetStepPending}
                            createOrUpdateMomentState={
                              createOrUpdateMomentState
                            }
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
                    case "create":
                      return (
                        <motion.div
                          key={"stepVisibleCreate"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 1 }}
                        >
                          <LocalServerComponents.StepVisibleCreate
                            key={stepVisible}
                            addStepAction={addStepAction}
                            isAddStepPending={isAddStepPending}
                            allButtonsDisabled={allButtonsDisabled}
                          />
                        </motion.div>
                      );
                    default:
                      return null;
                  }
                })()}
              </AnimatePresence>
            </div>
          </motion.div> */}
          {/* Here. When it's 0, that entirely disappears. */}
          <AnimatePresence initial={false}>
            {/* it's going to need some well timed delays, at least at first */}
            {steps.length > 0 && (
              // <motion.div
              //   key={"steps"}
              //   initial={{ height: 0 }}
              //   animate={{
              //     height: "auto",
              //   }}
              //   exit={{ height: 0 }}
              //   transition={{ duration: 2 }}
              // >
              <div
                ref={reference2}
                className="flex flex-col gap-y-8" // back from FormSection
              >
                <Reorder.Group // steps
                  axis="y"
                  values={steps}
                  onReorder={setSteps}
                  as="ol"
                >
                  <AnimatePresence>
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
                          stepAddingTime -
                          +currentStep.duree +
                          +stepDureeUpdate;
                      }

                      return (
                        <motion.div
                          key={step.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{
                            // delays must be conditional
                            opacity: {
                              duration: 1,
                              delay: isAnimationDelayed ? 2 : 0,
                            },
                            height: {
                              duration: 2,
                              delay: isAnimationDelayed ? 2 : 0,
                            },
                          }}
                          onAnimationStart={() => {
                            if (isAnimationDelayed)
                              setIsAnimationDelayed(false);
                          }}
                        >
                          <ReorderItem // step
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
                            createOrUpdateMomentState={
                              createOrUpdateMomentState
                            }
                            setCreateOrUpdateMomentState={
                              setCreateOrUpdateMomentState
                            }
                            stepsCompoundDurations={stepsCompoundDurations}
                            isDeleteStepPending={isDeleteStepPending}
                            startDeleteStepTransition={
                              startDeleteStepTransition
                            }
                            allButtonsDisabled={allButtonsDisabled}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </Reorder.Group>
                <LocalServerComponents.StepsSummaries
                  stepVisible={stepVisible}
                  endMomentDate={endMomentDate}
                  momentAddingTime={momentAddingTime}
                />
              </div>
              // </motion.div>
            )}
          </AnimatePresence>
          <MotionStepVisible
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

function MotionStepVisible({
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
  createOrUpdateMomentState: TrueCreateOrUpdateMomentState;
  stepDureeCreate: string;
  setStepDureeCreate: SetState<string>;
  isCreateStepPending: boolean;
  cancelStepAction: () => void;
  steps: StepFromCRUD[];
  isCancelStepPending: boolean;
  stepsCompoundDurations: number[];
  startMomentDate: string;
  allButtonsDisabled: boolean;
  addStepAction: () => void;
  isAddStepPending: boolean;
}) {
  const [ref, bounds] = useMeasure();
  const reference = ref as Ref<HTMLDivElement>;

  return (
    <motion.div
      animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
      transition={{ duration: 2 }}
    >
      <div ref={reference}>
        <AnimatePresence initial={false} mode="popLayout">
          {(() => {
            switch (stepVisible) {
              case "creating":
                return (
                  <motion.div
                    key={"stepVisibleCreating"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
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
              case "create":
                return (
                  <motion.div
                    key={"stepVisibleCreate"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <LocalServerComponents.StepVisibleCreate
                      key={stepVisible}
                      addStepAction={addStepAction}
                      isAddStepPending={isAddStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </motion.div>
                );
              default:
                return null;
            }
          })()}
        </AnimatePresence>
      </div>
    </motion.div>
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
    newSearchParams.set(SUBVIEW, e);
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
      <span className="invisible static">{subViewTitles[e]}</span>
      {/* gradient text */}
      <span
        className={clsx(
          className,
          "absolute inset-0 z-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
        )}
      >
        {subViewTitles[e]}
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
        id={CONTAINS}
        name={CONTAINS}
        placeholder="Cherchez parmi vos moments..."
        defaultValue={searchParams.get(CONTAINS)?.toString()}
        onChange={(e) => {
          debouncedHandleSearch(e.currentTarget.value);
        }}
      />
    </form>
  );
}

export function MomentInDateCard({
  e3,
  i3,
  realMoments,
}: {
  e3: MomentToCRUD;
  i3: number;
  realMoments: MomentToCRUD[];
}) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  // Just a good old handler. On the fly, I write handlers as traditional functions and actions as arrow functions.
  function handleUpdateMomentView() {
    const moment = realMoments.find((e0) => e0.id === e3.id);

    scrollToTopOfDesiredView(
      "update-moment",
      searchParams,
      push,
      pathname,
      moment?.id,
    );
  }

  return (
    <div className={clsx("group space-y-2", i3 === 0 && "-mt-5")}>
      <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
        <p className="font-medium text-blue-950">{e3.objective}</p>
        <div className="invisible flex justify-end group-hover:visible">
          <GlobalClientComponents.Button
            type="button"
            variant="destroy-step"
            onClick={handleUpdateMomentView}
          >
            <Icons.PencilSquareSolid className="size-5" />
          </GlobalClientComponents.Button>
        </div>
      </div>
      <p>
        <span className={"font-semibold text-neutral-800"}>
          {e3.startDateAndTime.split("T")[1]}
        </span>{" "}
        • {numStringToTimeString(e3.duration)}
        {e3.isIndispensable && (
          <>
            {" "}
            •{" "}
            <span className="text-sm font-semibold uppercase">
              indispensable
            </span>
          </>
        )}
      </p>
      <ol className="">
        {e3.steps.map((e4) => (
          <LocalServerComponents.StepInDateCard key={e4.id} e4={e4} />
        ))}
      </ol>
    </div>
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
      // hum...
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
  steps: StepFromCRUD[];
  setSteps: SetState<StepFromCRUD[]>;
  setStepVisible: SetState<StepVisible>;
  stepDuree: string;
  setStepDuree: SetState<string>;
  startCreateOrUpdateStepTransition: TransitionStartFunction;
  startResetStepTransition: TransitionStartFunction;
  createOrUpdateMomentState: TrueCreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<TrueCreateOrUpdateMomentState>;
  setIsAnimationDelayed?: SetState<boolean>;
}) {
  const stepFormId =
    variant === "updating"
      ? MOMENT_FORM_IDS[momentFormVariant].stepFormUpdating
      : MOMENT_FORM_IDS[momentFormVariant].stepFormCreating;

  // createOrUpdateStepAction

  const createOrUpdateStepAction = (event: FormEvent<HTMLFormElement>) => {
    startCreateOrUpdateStepTransition(() => {
      const state = trueCreateOrUpdateStepClientFlow(
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
        MOMENT_FORM_IDS[momentFormVariant].stepFormCreating;

      if (
        // Attention please: this right here HARD LEVEL JAVASCRIPT.
        noConfirm ||
        confirm("Êtes-vous sûr de vouloir réinitialiser cette étape ?")
      ) {
        const state = trueResetStepClientFlow(
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
}: {
  step: StepFromCRUD;
  index: number;
  isAfterCurrentStep: boolean;
  momentFormVariant: MomentFormVariant;
  steps: StepFromCRUD[];
  stepVisible: StepVisible;
  currentStepId: string;
  setCurrentStepId: SetState<string>;
  setStepVisible: SetState<StepVisible>;
  startMomentDate: string;
  stepAddingTime: number;
  setSteps: SetState<StepFromCRUD[]>;
  isUpdateStepPending: boolean;
  stepDureeUpdate: string;
  setStepDureeUpdate: SetState<string>;
  createOrUpdateMomentState: TrueCreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<TrueCreateOrUpdateMomentState>;
  stepsCompoundDurations: number[];
  isDeleteStepPending: boolean;
  startDeleteStepTransition: TransitionStartFunction;
  allButtonsDisabled: boolean;
}) {
  const controls = useDragControls();

  const isCurrentStepUpdating =
    currentStepId === step.id && stepVisible === "updating";

  const hasAPreviousStepUpdating =
    isAfterCurrentStep && stepVisible === "updating";

  const form = MOMENT_FORM_IDS[momentFormVariant].stepFormUpdating;

  // deleteStepAction

  const deleteStepAction = () => {
    startDeleteStepTransition(() => {
      if (confirm("Êtes-vous sûr de vouloir effacer cette étape ?")) {
        deleteStepClientFlow(steps, currentStepId, setSteps, setStepVisible);
        setCreateOrUpdateMomentState(trueRemoveStepsMessagesAndErrorsCallback);
      }
    });
  };

  // restoreStepAction

  const [isRestoreStepPending, startRestoreStepTransition] = useTransition();

  // The jumping is simply due to a current lack of animations
  // ...which I may or may not end up modifying.
  const restoreStepAction = () => {
    startRestoreStepTransition(() => {
      setStepVisible("create");
      setCurrentStepId("");
      setCreateOrUpdateMomentState(trueRemoveStepsMessagesAndErrorsCallback);
    });
  };

  // modifyStepAction

  const [isModifyStepPending, startModifyStepTransition] = useTransition();

  // just like restoreStepAction, there's no need to import this action from an external file (at least at this time) since it is very specific to ReorderItem
  const modifyStepAction = () => {
    startModifyStepTransition(() => {
      setCurrentStepId(step.id);
      setStepDureeUpdate(step.duree);
      setCreateOrUpdateMomentState(trueRemoveStepsMessagesAndErrorsCallback);
      setStepVisible("updating");
    });
  };

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      transition={{ layout: { duration: 0 } }}
      // layout="position" // or "preserve-aspect"
      dragTransition={{
        bounceStiffness: 900,
        bounceDamping: 50,
      }}
      // whileDrag={{ opacity: 0.5 }} // buggy though
    >
      <div
        className={clsx(
          "flex flex-col gap-y-8",
          index !== steps.length - 1 && "pb-8", // I remember I did that specifically for animations
        )}
      >
        <div className="flex select-none items-baseline justify-between">
          <p
            className={clsx(
              "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
              "transition-colors",
              stepVisible !== "updating" && "hover:text-neutral-400",
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
  );
}

// interruptability breaks the component
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
  createOrUpdateMomentState: TrueCreateOrUpdateMomentState;
  stepDureeUpdate: string;
  setStepDureeUpdate: SetState<string>;
  step: StepFromCRUD;
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
  const [ref, { height }] = useMeasure();
  const reference = ref as Ref<HTMLDivElement>;

  return (
    <motion.div
      animate={{ height: height > 0 ? height : "auto" }}
      transition={{ duration: 2 }}
    >
      <div ref={reference}>
        <AnimatePresence initial={false} mode="popLayout">
          {isCurrentStepUpdating ? (
            <motion.div
              key={"StepInputs"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
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

// keeping ClientCore and Main a comments to highlight the server-side progress made
const localClientComponents = {
  // ClientCore,
  // Main,
  SetViewButton,
  ViewsCarouselContainer,
  ViewSegment,
  ReadMomentsView,
  MomentForms,
  SetSubViewButton,
  RevalidateMomentsButton,
  SearchForm,
  MomentInDateCard,
  PaginationButton,
  StepForm,
  ReorderItem,
} as const;

export type LocalClientComponentsName = keyof typeof localClientComponents;
