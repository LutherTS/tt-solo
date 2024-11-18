"use client";

import {
  FormEvent,
  MouseEvent,
  Ref,
  TransitionStartFunction,
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

import * as Icons from "@/app/icons";
import * as LocalServerComponents from "./server";
import * as GlobalServerComponents from "@/app/components/server";
import * as GlobalClientComponents from "@/app/components/client";
import {
  FalserCreateOrUpdateMoment,
  FalseCreateOrUpdateMomentState,
  FalserDeleteMoment,
  MomentFormVariant,
  MomentToCRUD,
  RevalidateMoments,
  StepFormVariant,
  StepFromClient,
  StepVisible,
  SubView,
  UserMomentsToCRUD,
  View,
} from "@/app/types/moments";
import { Option, SetState } from "@/app/types/globals";
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
} from "@/app/data/moments";
import {
  defineCurrentPage,
  makeStepsCompoundDurationsArray,
  numStringToTimeString,
  falseRemoveMomentMessagesAndErrorsCallback,
  falseRemoveStepsMessagesAndErrorsCallback,
  rotateStates,
  roundTimeUpTenMinutes,
  setScrollToTop,
  toWordsing,
} from "@/app/utilities/moments";
import {
  falserCreateOrUpdateMomentClientFlow,
  falseCreateOrUpdateStepClientFlow,
  falserDeleteMomentClientFlow,
  deleteStepClientFlow,
  falseResetMomentClientFlow,
  falseResetStepClientFlow,
  revalidateMomentsClientFlow,
} from "@/app/flows/client/moments";
import {
  falseCreateOrUpdateMomentAfterFlow,
  falseDeleteMomentAfterFlow,
  resetMomentAfterFlow,
} from "@/app/flows/after/moments";

export default function ClientCore({
  now,
  allUserMomentsToCRUD,
  maxPages,
  destinationOptions,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
}: {
  now: string;
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  destinationOptions: Option[];
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: FalserCreateOrUpdateMoment;
  deleteMoment: FalserDeleteMoment;
}) {
  console.log({ now });

  let [view, setView] = useState<View>(views.CREATE_MOMENT);

  const [moment, setMoment] = useState<MomentToCRUD>();

  return (
    <>
      <LocalServerComponents.Header
        view={view}
        setView={setView}
        setMoment={setMoment}
      />
      <GlobalServerComponents.Divider />
      <Main
        now={now}
        allUserMomentsToCRUD={allUserMomentsToCRUD}
        maxPages={maxPages}
        destinationOptions={destinationOptions}
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
        view={view}
        setView={setView}
        moment={moment}
        setMoment={setMoment}
      />
    </>
  );
}

export function Main({
  now,
  allUserMomentsToCRUD,
  maxPages,
  destinationOptions,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
  view,
  setView,
  moment,
  setMoment,
}: {
  now: string;
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  destinationOptions: Option[];
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: FalserCreateOrUpdateMoment;
  deleteMoment: FalserDeleteMoment;
  view: View;
  setView: SetState<View>;
  moment: MomentToCRUD | undefined;
  setMoment: SetState<MomentToCRUD | undefined>;
}) {
  const [
    _realUserMoments,
    realPastMoments,
    realCurrentMoments,
    realFutureMoments,
  ] = allUserMomentsToCRUD;

  let initialSubView: SubView =
    realCurrentMoments.dates.length > 0
      ? subViews.CURRENT_MOMENTS
      : realFutureMoments.dates.length > 0
        ? subViews.FUTURE_MOMENTS
        : realPastMoments.dates.length > 0
          ? subViews.PAST_MOMENTS
          : subViews.ALL_MOMENTS;

  const [subView, setSubView] = useState<SubView>(initialSubView);

  const [isCRUDOpSuccessful, setIsCRUDOpSuccessful] = useState(false);

  let currentViewHeight = useMotionValue(0);

  return (
    <main>
      <LocalServerComponents.ViewsCarousel
        view={view}
        isCRUDOpSuccessful={isCRUDOpSuccessful}
        setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
        currentViewHeight={currentViewHeight}
      >
        <LocalServerComponents.PageSegment
          isSegmentContainerInvisible={view !== views.UPDATE_MOMENT}
        >
          <ViewSegment
            id={views.UPDATE_MOMENT}
            currentView={view}
            currentViewHeight={currentViewHeight}
          >
            {/* UpdateMomentView */}
            <MomentForms
              key={view}
              variant="updating"
              moment={moment}
              destinationOptions={destinationOptions}
              setView={setView}
              setSubView={setSubView}
              createOrUpdateMoment={createOrUpdateMoment}
              deleteMoment={deleteMoment}
              now={now}
              setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
              allButtonsDisabled={view !== views.UPDATE_MOMENT}
            />
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
            <ReadMomentsView
              allUserMomentsToCRUD={allUserMomentsToCRUD}
              maxPages={maxPages}
              view={view}
              subView={subView}
              setView={setView}
              setSubView={setSubView}
              setMoment={setMoment}
              revalidateMoments={revalidateMoments}
              allButtonsDisabled={view !== views.READ_MOMENTS}
            />
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
            {/* CreateMomentView */}
            <MomentForms
              variant="creating"
              destinationOptions={destinationOptions}
              setView={setView}
              setSubView={setSubView}
              createOrUpdateMoment={createOrUpdateMoment}
              now={now}
              setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
              allButtonsDisabled={view !== views.CREATE_MOMENT}
            />
          </ViewSegment>
        </LocalServerComponents.PageSegment>
      </LocalServerComponents.ViewsCarousel>
    </main>
  );
}

export function ViewsCarouselContainer({
  view,
  isCRUDOpSuccessful,
  setIsCRUDOpSuccessful,
  currentViewHeight,
  children,
}: {
  view: View;
  isCRUDOpSuccessful: boolean;
  setIsCRUDOpSuccessful: SetState<boolean>;
  currentViewHeight: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="flex"
      animate={{
        x: `-${VIEWS.indexOf(view) * 100}%`,
      }}
      initial={false}
      transition={{
        type: "spring",
        bounce: isCRUDOpSuccessful ? 0.2 : 0,
        duration: isCRUDOpSuccessful ? 0.4 : 0.2,
      }}
      onAnimationStart={() => setIsCRUDOpSuccessful(false)}
      style={{
        height: currentViewHeight,
      }}
    >
      {children}
    </motion.div>
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
  setView,
  setSubView,
  setMoment,
  revalidateMoments,
  allButtonsDisabled,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  view: View;
  subView: SubView;
  setView: SetState<View>;
  setSubView: SetState<SubView>;
  setMoment: SetState<MomentToCRUD | undefined>;
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
    [subViews.ALL_MOMENTS]: realAllMoments,
    [subViews.PAST_MOMENTS]: realPastMoments,
    [subViews.CURRENT_MOMENTS]: realCurrentMoments,
    [subViews.FUTURE_MOMENTS]: realFutureMoments,
  };

  let realDisplayedMoments = realAllMoments.dates;
  if (subView !== undefined && SUBVIEWS.includes(subView))
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

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);

    if (term) params.set(momentsPageSearchParamsKeys.CONTAINS, term);
    else params.delete(momentsPageSearchParamsKeys.CONTAINS);

    params.delete(momentsPageSearchParamsKeys.USER_ALL_MOMENTS_PAGE);
    params.delete(momentsPageSearchParamsKeys.USER_PAST_MOMENTS_PAGE);
    params.delete(momentsPageSearchParamsKeys.USER_CURRENT_MOMENTS_PAGE);
    params.delete(momentsPageSearchParamsKeys.USER_FUTURE_MOMENTS_PAGE);

    replace(`${pathname}?${params.toString()}`);
  }

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const [
    maxPageAllMoments,
    maxPagePastMoments,
    maxPageCurrentMoments,
    maxPageFutureMoments,
  ] = maxPages;

  let subViewMaxPages: { [K in SubView]: number } = {
    [subViews.ALL_MOMENTS]: maxPageAllMoments,
    [subViews.PAST_MOMENTS]: maxPagePastMoments,
    [subViews.CURRENT_MOMENTS]: maxPageCurrentMoments,
    [subViews.FUTURE_MOMENTS]: maxPageFutureMoments,
  };

  const currentPage = defineCurrentPage(
    INITIAL_PAGE,
    Number(searchParams.get(subViewsMomentsPageSearchParamsKeys[subView])),
    subViewMaxPages[subView],
  );

  function handlePagination(direction: "left" | "right", subView: SubView) {
    const params = new URLSearchParams(searchParams);
    if (direction === "left")
      params.set(
        subViewsMomentsPageSearchParamsKeys[subView],
        Math.max(INITIAL_PAGE, currentPage - 1).toString(),
      );
    else
      params.set(
        subViewsMomentsPageSearchParamsKeys[subView],
        Math.min(subViewMaxPages[subView], currentPage + 1).toString(),
      );

    if (
      params.get(subViewsMomentsPageSearchParamsKeys[subView]) ===
      INITIAL_PAGE.toString()
    )
      params.delete(subViewsMomentsPageSearchParamsKeys[subView]);

    replace(`${pathname}?${params.toString()}`);
  }

  const rotateSubView = (direction: "left" | "right") =>
    rotateStates(direction, setSubView, SUBVIEWS, subView);

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
        if (currentPage !== subViewMaxPages[subView])
          handlePagination("right", subView);
      }
    }
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const { scrollY } = useScroll();

  const settingScrollPosition = (latest: number) => setScrollPosition(latest);

  const debouncedSettingScrollPosition = debounce(settingScrollPosition, 100);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (view === views.READ_MOMENTS) debouncedSettingScrollPosition(latest);
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
        {SUBVIEWS.map((e) => (
          <SetSubViewButton
            key={e}
            setSubView={setSubView}
            e={e}
            subView={subView}
          />
        ))}
        <RevalidateMomentsButton
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
                        setMoment={setMoment}
                        realMoments={realMoments}
                        setView={setView}
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
  setView,
  setSubView,
  createOrUpdateMoment,
  deleteMoment,
  now,
  setIsCRUDOpSuccessful,
  allButtonsDisabled,
}: {
  variant: MomentFormVariant;
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  setView: SetState<View>;
  setSubView: SetState<SubView>;
  createOrUpdateMoment: FalserCreateOrUpdateMoment;
  deleteMoment?: FalserDeleteMoment;
  now: string;
  setIsCRUDOpSuccessful: SetState<boolean>;
  allButtonsDisabled: boolean;
}) {
  const nowRoundedUpTenMinutes = roundTimeUpTenMinutes(now);

  const isVariantUpdatingMoment = variant === "updating" && moment;

  let [startMomentDate, setStartMomentDate] = useState(
    isVariantUpdatingMoment ? moment.startDateAndTime : nowRoundedUpTenMinutes,
  );

  const momentSteps: StepFromClient[] | undefined = moment?.steps.map((e) => {
    return {
      id: e.id,
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

  let [stepDureeCreate, setStepDureeCreate] = useState(STEP_DURATION_ORIGINAL);
  let [stepDureeUpdate, setStepDureeUpdate] = useState(
    currentStep ? currentStep.duree : STEP_DURATION_ORIGINAL,
  );

  let momentAddingTime = steps.reduce((acc, curr) => {
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

  // createOrUpdateMomentAction

  const [createOrUpdateMomentState, setCreateOrUpdateMomentState] =
    useState<FalseCreateOrUpdateMomentState>(null);

  const [isCreateOrUpdateMomentPending, startCreateOrUpdateMomentTransition] =
    useTransition();

  const [isCreateOrUpdateMomentDone, setIsCreateOrUpdateMomentDone] =
    useState(false);

  const createOrUpdateMomentAction = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    startCreateOrUpdateMomentTransition(async () => {
      // an "action flow" is a bridge between a server action and the immediate impacts it is expected to have on the client
      const state = await falserCreateOrUpdateMomentClientFlow(
        event,
        createOrUpdateMoment,
        variant,
        startMomentDate,
        steps,
        moment,
        destinationSelect,
        activitySelect,
        createOrUpdateMomentState,
        endMomentDate,
        setSubView,
      );

      setCreateOrUpdateMomentState(state);
      setIsCreateOrUpdateMomentDone(true);
    });
  };

  useEffect(() => {
    if (isCreateOrUpdateMomentDone) {
      // an "after flow" is the set of subsequent client impacts that follow the end of the preceding "action-flow" based on its side effects
      falseCreateOrUpdateMomentAfterFlow(
        variant,
        createOrUpdateMomentState,
        setCreateOrUpdateMomentState,
        setView,
        setIsCRUDOpSuccessful,
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
        event.nativeEvent.explicitOriginalTarget?.type !== "reset";

      if (
        noConfirm ||
        confirm("Êtes-vous sûr de vouloir réinitialiser le formulaire ?")
      ) {
        const state = falseResetMomentClientFlow(
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
        const state = await falserDeleteMomentClientFlow(deleteMoment, moment);

        setCreateOrUpdateMomentState(state);
        setIsDeleteMomentDone(true);
      }
    });
  };

  useEffect(() => {
    if (isDeleteMomentDone) {
      falseDeleteMomentAfterFlow(
        variant,
        createOrUpdateMomentState,
        setView,
        setIsCRUDOpSuccessful,
      );

      setIsDeleteMomentDone(false);
    }
  }, [isDeleteMomentDone]);

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
      setCreateOrUpdateMomentState(falseRemoveStepsMessagesAndErrorsCallback);
    });
  };

  // createOrUpdateStepAction

  const [isCreateStepPending, startCreateStepTransition] = useTransition();

  const [isUpdateStepPending, startUpdateStepTransition] = useTransition();

  // resetStepAction

  const [isResetStepPending, startResetStepTransition] = useTransition();

  // deleteStepAction

  const [isDeleteStepPending, startDeleteStepTransition] = useTransition();

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
      <form
        onSubmit={createOrUpdateMomentAction}
        onReset={resetMomentAction}
        id={momentFormIds[variant].momentForm}
        noValidate
      >
        <GlobalServerComponents.Section
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
          id={momentFormIds[variant].yourMoment}
          error={createOrUpdateMomentState?.momentMessages?.message}
          subError={createOrUpdateMomentState?.momentMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={
            falseRemoveMomentMessagesAndErrorsCallback
          }
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
        </GlobalServerComponents.Section>
        <GlobalServerComponents.Divider />
        <GlobalServerComponents.Section
          title="Ses étapes"
          description="Établissez une par une les étapes du déroulé de votre moment, de la manière la plus segmentée que vous désirez."
          id={momentFormIds[variant].itsSteps}
          error={createOrUpdateMomentState?.stepsMessages?.message}
          subError={createOrUpdateMomentState?.stepsMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={
            falseRemoveStepsMessagesAndErrorsCallback
          }
        >
          {steps.length > 0 && (
            <>
              <Reorder.Group // steps
                axis="y"
                values={steps}
                onReorder={setSteps}
                as="ol"
              >
                {steps.map((step, index) => {
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
                      setCreateOrUpdateMomentState={
                        setCreateOrUpdateMomentState
                      }
                      stepsCompoundDurations={stepsCompoundDurations}
                      isDeleteStepPending={isDeleteStepPending}
                      startDeleteStepTransition={startDeleteStepTransition}
                      allButtonsDisabled={allButtonsDisabled}
                      setStepDureeCreate={setStepDureeCreate}
                    />
                  );
                })}
              </Reorder.Group>
              <LocalServerComponents.StepsSummaries
                stepVisible={stepVisible}
                endMomentDate={endMomentDate}
                momentAddingTime={momentAddingTime}
              />
            </>
          )}
          {(() => {
            switch (stepVisible) {
              case "creating":
                return (
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
                );
              case "create":
                return (
                  <LocalServerComponents.StepVisibleCreate
                    key={stepVisible}
                    addStepAction={addStepAction}
                    isAddStepPending={isAddStepPending}
                    allButtonsDisabled={allButtonsDisabled}
                  />
                );
              default:
                return null;
            }
          })()}
        </GlobalServerComponents.Section>
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

export function SetSubViewButton({
  setSubView,
  e,
  subView,
}: {
  setSubView: SetState<SubView>;
  e: SubView;
  subView: SubView;
}) {
  const className = "px-4 py-2 h-9 flex items-center justify-center";

  return (
    <button
      onClick={() => setSubView(e)}
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

export function MomentInDateCard({
  e3,
  i3,
  setMoment,
  realMoments,
  setView,
}: {
  e3: MomentToCRUD;
  i3: number;
  setMoment: SetState<MomentToCRUD | undefined>;
  realMoments: MomentToCRUD[];
  setView: SetState<View>;
}) {
  function setUpdateMomentView() {
    setMoment(realMoments.find((e0) => e0.id === e3.id));
    setScrollToTop(views.UPDATE_MOMENT, setView);
  }

  return (
    <div className={clsx("group space-y-2", i3 === 0 && "-mt-5")}>
      <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
        <p className="font-medium text-blue-950">{e3.objective}</p>
        <div className="invisible flex justify-end group-hover:visible">
          <GlobalClientComponents.Button
            type="button"
            variant="destroy-step"
            onClick={setUpdateMomentView}
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
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<FalseCreateOrUpdateMomentState>;
}) {
  const stepFormId =
    variant === "updating"
      ? momentFormIds[momentFormVariant].stepFormUpdating
      : momentFormIds[momentFormVariant].stepFormCreating;

  // createOrUpdateStepAction

  const createOrUpdateStepAction = (event: FormEvent<HTMLFormElement>) => {
    startCreateOrUpdateStepTransition(() => {
      const state = falseCreateOrUpdateStepClientFlow(
        event,
        stepDuree,
        steps,
        variant,
        currentStepId,
        setSteps,
        setStepVisible,
        createOrUpdateMomentState,
      );

      setCreateOrUpdateMomentState(state);
    });
  };

  // resetStepAction

  const resetStepAction = (event: FormEvent<HTMLFormElement>) => {
    startResetStepTransition(() => {
      const noConfirm =
        // @ts-ignore Typescript unaware of explicitOriginalTarget (but is correct in some capacity because mobile did not understand)
        event.nativeEvent.explicitOriginalTarget?.form?.id !==
        momentFormIds[momentFormVariant].stepFormCreating;

      if (
        noConfirm ||
        confirm("Êtes-vous sûr de vouloir réinitialiser cette étape ?")
      ) {
        const state = falseResetStepClientFlow(
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
  setStepDureeCreate,
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
  createOrUpdateMomentState: FalseCreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<FalseCreateOrUpdateMomentState>;
  stepsCompoundDurations: number[];
  isDeleteStepPending: boolean;
  startDeleteStepTransition: TransitionStartFunction;
  allButtonsDisabled: boolean;
  setStepDureeCreate: SetState<string>;
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
        setCreateOrUpdateMomentState(falseRemoveStepsMessagesAndErrorsCallback);
      }
    });
  };

  // restoreStepAction

  const [isRestoreStepPending, startRestoreStepTransition] = useTransition();

  const restoreStepAction = () => {
    startRestoreStepTransition(() => {
      setStepVisible("create");
      setCurrentStepId("");
      setCreateOrUpdateMomentState(falseRemoveStepsMessagesAndErrorsCallback);
    });
  };

  // modifyStepAction

  const [isModifyStepPending, startModifyStepTransition] = useTransition();

  const modifyStepAction = () => {
    startModifyStepTransition(() => {
      setCurrentStepId(step.id);
      setStepDureeUpdate(step.duree);
      setCreateOrUpdateMomentState(falseRemoveStepsMessagesAndErrorsCallback);
      setStepVisible("updating");
    });
  };

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      transition={{ layout: { duration: 0 } }}
      dragTransition={{
        bounceStiffness: 900,
        bounceDamping: 50,
      }}
    >
      <div
        className={clsx(
          "flex flex-col gap-y-8",
          index !== steps.length - 1 && "pb-8",
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
        {isCurrentStepUpdating ? (
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
        ) : (
          <LocalServerComponents.StepContents
            step={step}
            index={index}
            hasAPreviousStepUpdating={hasAPreviousStepUpdating}
            startMomentDate={startMomentDate}
            stepAddingTime={stepAddingTime}
          />
        )}
      </div>
    </Reorder.Item>
  );
}

const localClientComponents = {
  ClientCore,
  Main,
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
