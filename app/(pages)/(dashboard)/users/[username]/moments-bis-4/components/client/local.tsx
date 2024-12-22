"use agnostic";

/* IMPORTS */

// External imports

import { use, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useMeasure } from "react-use";
import debounce from "debounce";
import clsx from "clsx";
import { add, format } from "date-fns";
import { fr } from "date-fns/locale";
// @ts-ignore // no type declaration file on npm
import useKeypress from "react-use-keypress";

// Components imports

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllGlobalClientComponents from "@/app/components/client/components";
import * as AllLocalAgnosticComponents from "../agnostic-none-client"; // if prefixed by "All-", it means the import is from a folder
import * as Buttons from "./buttons";

// Internal imports

import {
  momentsPageSearchParamsKeys,
  INITIAL_PAGE,
  momentFormIds,
  SEARCH_FORM_ID,
  STEP_DURATION_ORIGINAL,
  subViews,
  SUBVIEWS,
  views,
  VIEWS,
  subViewsMomentsPageSearchParamsKeys,
} from "@/app/constants/agnostic/moments";
import {
  defineCurrentPage,
  makeStepsCompoundDurationsArray,
  roundTimeUpTenMinutes,
  toWordsing,
  removeStepsMessagesAndErrorsCallback,
} from "@/app/utilities/agnostic/moments";
import { rotateSearchParams } from "@/app/utilities/client/moments";
import {
  deleteStepClientFlow,
  revalidateMomentsClientFlow,
  createOrUpdateStepClientFlow,
  resetMomentClientFlow,
  resetStepClientFlow,
  createOrUpdateMomentClientFlow,
  deleteMomentClientFlow,
} from "@/app/actions/client/clientflows/moments";
import {
  resetMomentAfterFlow,
  createOrUpdateMomentAfterFlow,
  deleteMomentAfterFlow,
} from "@/app/actions/client/afterflows/moments";

// Types imports

import type {
  FormEvent,
  MouseEvent,
  Ref,
  TransitionStartFunction,
} from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
import type { MotionValue } from "motion/react";
import type {
  SetState,
  TypedURLSearchParams,
} from "@/app/types/client/globals";
import type {
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
  ReadMomentsViewData,
  MomentFormsData,
} from "@/app/types/agnostic/moments";

/* LOGIC */

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
  moment: MomentAdapted | undefined;
  fetchReadMomentsViewData: Promise<ReadMomentsViewData>;
  fetchMomentFormsData: Promise<MomentFormsData>;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  const [isCRUDOpSuccessful, setIsCRUDOpSuccessful] = useState(false);
  let currentViewHeight = useMotionValue(0);

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
      <AllLocalAgnosticComponents.PageSegment
        isSegmentContainerInvisible={view !== views.UPDATE_MOMENT}
      >
        <ViewSegment
          id={views.UPDATE_MOMENT}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* UpdateMomentView */}
          {/* SUSPENDED */}
          <AllGlobalAgnosticComponents.ErrorBoundarySuspense>
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
          </AllGlobalAgnosticComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </AllLocalAgnosticComponents.PageSegment>
      <AllLocalAgnosticComponents.PageSegment
        isSegmentContainerInvisible={view !== views.READ_MOMENTS}
      >
        <ViewSegment
          id={views.READ_MOMENTS}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* SUSPENDED */}
          <AllGlobalAgnosticComponents.ErrorBoundarySuspense>
            <ReadMomentsView
              view={view}
              fetchReadMomentsViewData={fetchReadMomentsViewData}
              revalidateMoments={revalidateMoments}
              allButtonsDisabled={view !== views.READ_MOMENTS}
            />
          </AllGlobalAgnosticComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </AllLocalAgnosticComponents.PageSegment>
      <AllLocalAgnosticComponents.PageSegment
        isSegmentContainerInvisible={view !== views.CREATE_MOMENT}
      >
        <ViewSegment
          id={views.CREATE_MOMENT}
          currentView={view}
          currentViewHeight={currentViewHeight}
        >
          {/* CreateMomentView */}
          {/* SUSPENDED */}
          <AllGlobalAgnosticComponents.ErrorBoundarySuspense>
            <MomentForms
              variant="creating"
              fetchMomentFormsData={fetchMomentFormsData}
              createOrUpdateMoment={createOrUpdateMoment}
              now={now}
              setIsCRUDOpSuccessful={setIsCRUDOpSuccessful}
              allButtonsDisabled={view !== views.CREATE_MOMENT}
            />
          </AllGlobalAgnosticComponents.ErrorBoundarySuspense>
        </ViewSegment>
      </AllLocalAgnosticComponents.PageSegment>
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
      <div className="h-24"></div>
    </div>
  );
}

export function ReadMomentsView({
  view,
  fetchReadMomentsViewData,
  revalidateMoments,
  allButtonsDisabled,
}: {
  view: View;
  fetchReadMomentsViewData: Promise<ReadMomentsViewData>;
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
          <Buttons.SetSubViewButton key={e} e={e} subView={subView} />
        ))}
        <Buttons.RevalidateMomentsButton
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
                <AllLocalAgnosticComponents.DateCard
                  title={format(new Date(e.date), "eeee d MMMM", {
                    locale: fr,
                  })}
                  e={e}
                  i={i}
                  realMoments={realMoments}
                />
              </div>
              {i === a.length - 1 && (
                <AllLocalAgnosticComponents.MomentsPageDetails
                  pageDetails={realDisplayedMoments.pageDetails}
                />
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <Buttons.PaginationButton
              handlePagination={handlePagination}
              direction="left"
              subView={subView}
              disabled={allButtonsDisabled || currentPage === 1}
              icon="ArrowLeftSolidIcon"
              allButtonsDisabled={allButtonsDisabled}
            />
            <Buttons.PaginationButton
              handlePagination={handlePagination}
              direction="right"
              subView={subView}
              disabled={
                allButtonsDisabled || currentPage === subViewsMaxPages[subView]
              }
              icon="ArrowRightSolidIcon"
              allButtonsDisabled={allButtonsDisabled}
            />
          </div>
        </>
      ) : (
        <AllLocalAgnosticComponents.NoDateCard />
      )}
    </div>
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
      <AllGlobalClientComponents.InputText
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

// steps animations data, children of MomentForms

const SHARED_HEIGHT_DURATION = 0.25;
const SHARED_OPACITY_DURATION = SHARED_HEIGHT_DURATION * (2 / 3);

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
  fetchMomentFormsData: Promise<MomentFormsData>;
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
        event.nativeEvent.explicitOriginalTarget?.type !== "reset";

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
      <form
        onSubmit={createOrUpdateMomentAction}
        onReset={resetMomentAction}
        id={momentFormIds[variant].momentForm}
        noValidate
      >
        <AllGlobalAgnosticComponents.FormSection
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
          <AllLocalAgnosticComponents.MomentInputs
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
        </AllGlobalAgnosticComponents.FormSection>
        <AllGlobalAgnosticComponents.Divider />
        <AllGlobalAgnosticComponents.FormSection
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

          <AllLocalAgnosticComponents.StepsSummaries
            stepVisible={stepVisible}
            endMomentDate={endMomentDate}
            momentAddingTime={momentAddingTime}
          />
        </AllGlobalAgnosticComponents.FormSection>
        <AllGlobalAgnosticComponents.Divider />
        <AllGlobalAgnosticComponents.Section>
          {/* Doubling up instead of reverse for accessibility */}
          <div className="flex">
            {/* Mobile */}
            <div className="flex w-full flex-col gap-4 md:hidden">
              <Buttons.ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
              <Buttons.ResetOrEraseMomentButton
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
              <Buttons.ResetOrEraseMomentButton
                variant={variant}
                deleteMomentAction={deleteMomentAction}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
              <Buttons.ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                allButtonsDisabled={allButtonsDisabled}
              />
            </div>
          </div>
        </AllGlobalAgnosticComponents.Section>
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

  const restoreStepAction = () => {
    startRestoreStepTransition(() => {
      setStepVisible("create");
      setCurrentStepId("");
      setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
    });
  };

  // modifyStepAction

  const [isModifyStepPending, startModifyStepTransition] = useTransition();

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
        transition={{ layout: { duration: 0 } }}
        dragTransition={{
          bounceStiffness: 900,
          bounceDamping: 50,
        }}
      >
        <div className={clsx("flex flex-col gap-y-8", "pb-9")}>
          <div className="flex select-none items-baseline justify-between">
            <p
              className={clsx(
                "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
                "transition-colors",
                stepVisible !== "updating" &&
                  "hover:cursor-pointer hover:text-neutral-400",
              )}
              onPointerDown={(event) => {
                if (stepVisible !== "updating") controls.start(event);
              }}
              style={{ touchAction: "none" }}
            >
              Étape <span>{toWordsing(index + 1)}</span>
            </p>{" "}
            {isCurrentStepUpdating ? (
              <AllGlobalClientComponents.Button
                type="button"
                variant="destroy-step"
                onClick={restoreStepAction}
                disabled={allButtonsDisabled || isRestoreStepPending}
              >
                Restaurer l&apos;étape
              </AllGlobalClientComponents.Button>
            ) : (
              <AllGlobalClientComponents.Button
                variant="destroy-step"
                type="button"
                onClick={modifyStepAction}
                disabled={allButtonsDisabled || isModifyStepPending}
              >
                Modifier cette étape
              </AllGlobalClientComponents.Button>
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
                <AllLocalAgnosticComponents.StepInputs
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
                  <AllLocalAgnosticComponents.StepFormControlsMobileWrapper>
                    <Buttons.UpdateStepButton
                      form={form}
                      isUpdateStepPending={isUpdateStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                    <Buttons.EraseStepButton
                      form={form}
                      deleteStepAction={deleteStepAction}
                      isDeleteStepPending={isDeleteStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </AllLocalAgnosticComponents.StepFormControlsMobileWrapper>
                  {/* Desktop */}
                  <AllLocalAgnosticComponents.StepFormControlsDesktopWrapper>
                    <Buttons.EraseStepButton
                      form={form}
                      deleteStepAction={deleteStepAction}
                      isDeleteStepPending={isDeleteStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                    <Buttons.UpdateStepButton
                      form={form}
                      isUpdateStepPending={isUpdateStepPending}
                      allButtonsDisabled={allButtonsDisabled}
                    />
                  </AllLocalAgnosticComponents.StepFormControlsDesktopWrapper>
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
              <AllLocalAgnosticComponents.StepContents
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
                    className="pb-9"
                  >
                    <AllLocalAgnosticComponents.StepVisibleCreating
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
                    <AllLocalAgnosticComponents.StepVisibleCreate
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
      const noConfirm =
        // @ts-ignore Typescript unaware of explicitOriginalTarget (but is correct in some capacity because mobile did not understand)
        event.nativeEvent.explicitOriginalTarget?.form?.id !==
        momentFormIds[momentFormVariant].stepFormCreating;

      if (
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

const localClientComponents = {
  ViewsCarouselContainer,
  ViewSegment,
  ReadMomentsView,
  SearchForm,
  MomentForms,
  StepForm,
  ReorderItem,
} as const;

export type LocalClientComponentsName = keyof typeof localClientComponents;
