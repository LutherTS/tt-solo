"use client";

import {
  useEffect,
  useState,
  useTransition,
  MouseEvent,
  FormEvent,
  TransitionStartFunction,
  Ref,
} from "react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import { add, format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  motion,
  MotionValue,
  Reorder,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import debounce from "debounce";
import { useMeasure } from "react-use";
// @ts-ignore // no type declaration file on npm
import useKeypress from "react-use-keypress";

import { Option, SetState } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  MomentToCRUD,
  StepFromCRUD,
  DeleteMoment,
  RevalidateMoments,
  MomentFormVariant,
  StepFormVariant,
  StepVisible,
  View,
  SubView,
  CreateOrUpdateMoment,
  CreateOrUpdateMomentState,
  MomentsDestinationToCRUD,
  StepToCRUD,
  MomentsDateToCRUD,
  MomentsSearchParamsKey,
} from "@/app/types/moments";
import {
  defineCurrentPage,
  makeStepsCompoundDurationsArray,
  numStringToTimeString,
  removeMomentMessagesAndErrorsCallback,
  removeStepsMessagesAndErrorsCallback,
  rotateStates,
  roundTimeUpTenMinutes,
  setScrollToTop,
  toWordsing,
} from "@/app/utilities/moments";
import {
  Button,
  Divider,
  FieldTitle,
  InputDatetimeLocalControlled,
  InputNumberControlled,
  InputText,
  PageTitle,
  Section,
  InputSwitch,
  SelectWithOptions,
  Textarea,
} from "@/app/components/__components__";
import * as Icons from "@/app/icons";
import {
  createOrUpdateStepClientFlow,
  resetStepClientFlow,
  deleteStepClientFlow,
  revalidateMomentsClientFlow,
  createOrUpdateMomentClientFlow,
  resetMomentClientFlow,
  deleteMomentClientFlow,
} from "@/app/flows/client/moments";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
  SEARCH_FORM_ID,
  activityOptions,
  subViewTitles,
  viewTitles,
  subViews,
  MOMENT_FORM_IDS,
  STEP_DURATION_ORIGINAL,
  INITIAL_PAGE,
  views,
} from "@/app/data/moments";
import {
  createOrUpdateMomentAfterFlow,
  deleteMomentAfterFlow,
  resetMomentAfterFlow,
} from "@/app/flows/after/moments";
import { EventStepDurationSchema } from "@/app/validations/steps";

/* Dummy Form Presenting Data 
Devenir tech lead sur TekTIME. 
Développement de feature
Faire un formulaire indéniable pour TekTIME.

De mon point de vue, TekTIME a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice. 

Réaliser la div d'une étape
S'assurer que chaque étape ait un format qui lui correspond, en l'occurrence en rapport avec le style de la création d'étape.
10 minutes

Implémenter le système de coulissement des étapes
Alors, ça c'est plus pour la fin mais, il s'agit d'utiliser Framer Motion et son composant Reorder pour pouvoir réorganiser les étapes, et même visiblement en changer l'ordre.
20 minutes

Finir de vérifier le formulaire
S'assurer que toutes les fonctionnalités marchent sans problèmes, avant une future phase de nettoyage de code et de mises en composants.
30 minutes
*/

// Main Component

export default function Main({
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
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  console.log({ now });

  // let [view, setView] = useState<View>("read-moments");
  // starting directly with the create form for now
  let [view, setView] = useState<View>("create-moment");

  const [
    _realUserMoments,
    realPastMoments,
    realCurrentMoments,
    realFutureMoments,
  ] = allUserMomentsToCRUD;

  let initialSubView: SubView =
    realCurrentMoments.dates.length > 0
      ? "current-moments"
      : realFutureMoments.dates.length > 0
        ? "future-moments"
        : realPastMoments.dates.length > 0
          ? "past-moments"
          : "all-moments";

  const [subView, setSubView] = useState<SubView>(initialSubView);

  const [moment, setMoment] = useState<MomentToCRUD | undefined>();

  const [isCRUDOpSuccessful, setIsCRUDOpSuccessful] = useState(false);

  let currentViewHeight = useMotionValue(0);

  return (
    <main>
      <div
        className={clsx(
          "flex w-screen shrink-0 flex-col items-center md:w-[calc(100vw_-_9rem)]",
        )}
      >
        <div
          className={clsx(
            "container px-8 lg:max-w-4xl",
            "flex justify-between py-8 align-baseline",
          )}
        >
          <PageTitle title={viewTitles[view]} />
          <SetViewButton view={view} setView={setView} setMoment={setMoment} />
        </div>
      </div>
      <Divider />
      <div className="relative w-screen overflow-hidden md:w-[calc(100vw_-_9rem)]">
        <motion.div
          className="flex"
          animate={{
            x: `-${views.indexOf(view) * 100}%`,
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
          <ViewWrapper>
            <ViewContainer
              id="update-moment"
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
              />
            </ViewContainer>
          </ViewWrapper>
          <ViewWrapper>
            <ViewContainer
              id="read-moments"
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
              />
            </ViewContainer>
          </ViewWrapper>
          <ViewWrapper>
            <ViewContainer
              id="create-moment"
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
              />
            </ViewContainer>
          </ViewWrapper>
        </motion.div>
      </div>
    </main>
  );
}

function ViewWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen shrink-0 flex-col items-center md:w-[calc(100vw_-_9rem)]">
      {children}
    </div>
  );
}

function ViewContainer({
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

  if (id === currentView) currentViewHeight.set(height + 24 * 4); // 24 * 4 because height from useMeasure does not count self padding ("pb-24" below)

  return (
    <div
      id={id}
      ref={reference}
      className={clsx(
        "container px-8 lg:max-w-4xl",
        "pb-24", // ignored by useMeasure
      )}
    >
      {children}
    </div>
  );
}

// Main Leading Components

function ReadMomentsView({
  allUserMomentsToCRUD,
  maxPages,
  view,
  subView,
  setView,
  setSubView,
  setMoment,
  revalidateMoments,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  view: View;
  subView: SubView;
  setView: SetState<View>;
  setSubView: SetState<SubView>;
  setMoment: SetState<MomentToCRUD | undefined>;
  revalidateMoments: RevalidateMoments;
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

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);

    if (term) params.set(CONTAINS, term);
    else params.delete(CONTAINS);

    params.delete(USERMOMENTSPAGE);
    params.delete(PASTUSERMOMENTSPAGE);
    params.delete(CURRENTUSERMOMENTSPAGE);
    params.delete(FUTUREUSERMOMENTSPAGE);

    replace(`${pathname}?${params.toString()}`);
  }

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

  function handlePagination(direction: "left" | "right", subView: SubView) {
    const params = new URLSearchParams(searchParams);
    if (direction === "left")
      params.set(
        subViewSearchParams[subView],
        Math.max(INITIAL_PAGE, currentPage - 1).toString(),
      );
    else
      params.set(
        subViewSearchParams[subView],
        Math.min(subViewMaxPages[subView], currentPage + 1).toString(),
      );

    if (params.get(subViewSearchParams[subView]) === INITIAL_PAGE.toString())
      params.delete(subViewSearchParams[subView]);

    replace(`${pathname}?${params.toString()}`);
  }

  const rotateSubView = (direction: "left" | "right") =>
    rotateStates(direction, setSubView, subViews, subView);

  useKeypress("ArrowLeft", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("left");
      } else {
        if (currentPage !== 1) handlePagination("left", subView);
      }
    }
  });

  useKeypress("ArrowRight", (event: KeyboardEvent) => {
    if (view === "read-moments") {
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
          <SetSubViewButton
            key={e}
            setSubView={setSubView}
            e={e}
            subView={subView}
          />
        ))}
        <RevalidateMomentsButton
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
                <DateCard
                  title={format(new Date(e.date), "eeee d MMMM", {
                    locale: fr,
                  })}
                >
                  {e.destinations.map((e2) => {
                    return (
                      <DestinationInDateCard
                        key={e2.destinationIdeal}
                        e2={e2}
                        setMoment={setMoment}
                        realMoments={realMoments}
                        setView={setView}
                      />
                    );
                  })}
                </DateCard>
              </div>
              {i === a.length - 1 && <MomentsPageDetails e={e} />}
            </div>
          ))}
          <div className="flex justify-between">
            <PaginationButton
              handlePagination={handlePagination}
              direction="left"
              subView={subView}
              disabled={currentPage === 1}
              icon="ArrowLeftSolid"
            />
            <PaginationButton
              handlePagination={handlePagination}
              direction="right"
              subView={subView}
              disabled={currentPage === subViewMaxPages[subView]}
              icon="ArrowRightSolid"
            />
          </div>
        </>
      ) : (
        <NoDateCard>
          <FieldTitle title={"Pas de moment... pour le moment. 😅"} />
        </NoDateCard>
      )}
    </div>
  );
}

function MomentForms({
  variant,
  moment,
  destinationOptions,
  setView,
  setSubView,
  createOrUpdateMoment,
  deleteMoment,
  now,
  setIsCRUDOpSuccessful,
}: {
  variant: MomentFormVariant;
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  setView: SetState<View>;
  setSubView: SetState<SubView>;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment?: DeleteMoment;
  now: string;
  setIsCRUDOpSuccessful: SetState<boolean>;
}) {
  const nowRoundedUpTenMinutes = roundTimeUpTenMinutes(now);

  const isVariantUpdatingMoment = variant === "updating" && moment;

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
    useState<CreateOrUpdateMomentState>(null);

  const [isCreateOrUpdateMomentPending, startCreateOrUpdateMomentTransition] =
    useTransition();

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
        endMomentDate,
        setSubView,
      );

      setCreateOrUpdateMomentState(state);
      setIsCreateOrUpdateMomentDone(true);
    });
  };

  useEffect(() => {
    if (isCreateOrUpdateMomentDone) {
      // an "after flow" is the set of subsequent client impacts that follow the end of the preceding "action flow" based on its side effects
      createOrUpdateMomentAfterFlow(
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
        const state = resetMomentClientFlow(
          setStartMomentDate,
          setSteps,
          setStepVisible,
          variant,
          setInputSwitchKey,
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
    if (isDeleteMomentDone) {
      deleteMomentAfterFlow(
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
        id={MOMENT_FORM_IDS[variant].momentForm}
        noValidate
      >
        <Section
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
          id={MOMENT_FORM_IDS[variant].yourMoment}
          error={createOrUpdateMomentState?.momentMessages?.message}
          subError={createOrUpdateMomentState?.momentMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={
            removeMomentMessagesAndErrorsCallback
          }
        >
          <MomentInputs
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
        </Section>
        <Divider />
        <Section
          title="Ses étapes"
          description="Établissez une par une les étapes du déroulé de votre moment, de la manière la plus segmentée que vous désirez."
          id={MOMENT_FORM_IDS[variant].itsSteps}
          error={createOrUpdateMomentState?.stepsMessages?.message}
          subError={createOrUpdateMomentState?.stepsMessages?.subMessage}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={removeStepsMessagesAndErrorsCallback}
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
                    />
                  );
                })}
              </Reorder.Group>
              <StepsSummaries
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
                  <StepVisibleCreating
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
                  />
                );
              case "create":
                return (
                  <StepVisibleCreate
                    key={stepVisible}
                    addStepAction={addStepAction}
                    isAddStepPending={isAddStepPending}
                  />
                );
              default:
                return null;
            }
          })()}
        </Section>
        <Divider />
        <Section>
          {/* Doubling up instead of reverse for accessibility */}
          <div className="flex">
            {/* Mobile */}
            <div className="flex w-full flex-col gap-4 md:hidden">
              <ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
              />
              <ResetOrEraseMomentButton
                variant={variant}
                deleteMomentAction={deleteMomentAction}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
              />
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              <ResetOrEraseMomentButton
                variant={variant}
                deleteMomentAction={deleteMomentAction}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
              />
              <ConfirmMomentButton
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
              />
            </div>
          </div>
        </Section>
      </form>
    </>
  );
}

// Main Supporting Components

function SetViewButton({
  view,
  setView,
  setMoment,
}: {
  view: View;
  setView: SetState<View>;
  setMoment: SetState<MomentToCRUD | undefined>;
}) {
  function defineDesiredView(view: View) {
    switch (view) {
      case "update-moment":
        return "read-moments";
      case "read-moments":
        return "create-moment";
      case "create-moment":
        return "read-moments";
      default:
        return "read-moments";
    }
  }

  const desiredView = defineDesiredView(view);

  return (
    <Button
      type="button"
      variant="destroy-step"
      onClick={() => {
        if (view === "update-moment") setMoment(undefined);
        setScrollToTop(desiredView, setView);
      }}
    >
      {(() => {
        switch (desiredView) {
          case "read-moments":
            return <>Vos moments</>;
          case "create-moment":
            return <>Créez un moment</>;
          default:
            return null;
        }
      })()}
    </Button>
  );
}

// ReadMomentsView Supporting Components

function SetSubViewButton({
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

function RevalidateMomentsButton({
  revalidateMomentsAction,
  isRevalidateMomentsPending,
}: {
  revalidateMomentsAction: (
    event: MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  isRevalidateMomentsPending: boolean;
}) {
  return (
    <button
      form={SEARCH_FORM_ID}
      onClick={revalidateMomentsAction}
      disabled={isRevalidateMomentsPending}
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

function SearchForm({
  searchParams,
  debouncedHandleSearch,
}: {
  searchParams: ReadonlyURLSearchParams;
  debouncedHandleSearch: debounce.DebouncedFunction<(term: string) => void>;
}) {
  return (
    <form id={SEARCH_FORM_ID} noValidate>
      <InputText
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

export function DateCard({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <section
        className="grid items-baseline gap-8 md:grid-cols-[1fr_2fr]"
        id={id}
      >
        <div>
          <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
        </div>
        <div className="flex flex-col gap-y-8">{children}</div>
      </section>
    </div>
  );
}

export function NoDateCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-white p-5 shadow-sm">{children}</div>;
}

function DestinationInDateCard({
  e2,
  setMoment,
  realMoments,
  setView,
}: {
  e2: MomentsDestinationToCRUD;
  setMoment: SetState<MomentToCRUD | undefined>;
  realMoments: MomentToCRUD[];
  setView: SetState<View>;
}) {
  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex select-none items-baseline justify-between">
        <p
          className={clsx(
            "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
          )}
        >
          {e2.destinationIdeal}
        </p>
      </div>
      {e2.moments.map((e3, i3) => (
        <MomentInDateCard
          key={e3.id}
          e3={e3}
          i3={i3}
          setMoment={setMoment}
          realMoments={realMoments}
          setView={setView}
        />
      ))}
    </div>
  );
}

function MomentInDateCard({
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
    setScrollToTop("update-moment", setView);
  }

  return (
    <div className={clsx("group space-y-2", i3 === 0 && "-mt-5")}>
      <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
        <p className="font-medium text-blue-950">{e3.objective}</p>
        <div className="invisible flex justify-end group-hover:visible">
          <Button
            type="button"
            variant="destroy-step"
            onClick={setUpdateMomentView}
          >
            <Icons.PencilSquareSolid className="size-5" />
          </Button>
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
          <StepInDateCard key={e4.id} e4={e4} />
        ))}
      </ol>
    </div>
  );
}

function StepInDateCard({ e4 }: { e4: StepToCRUD }) {
  return (
    <li className="text-sm font-light leading-loose text-neutral-500">
      <p className="">
        {e4.startDateAndTime.split("T")[1]} - {e4.endDateAndTime.split("T")[1]}{" "}
        : {e4.title}
      </p>
    </li>
  );
}

function MomentsPageDetails({ e }: { e: MomentsDateToCRUD }) {
  return (
    <p className="font-extralight text-neutral-800">
      <span className="font-normal">{e.momentsTotal}</span> moment(s) affiché(s){" "}
      <span className="font-normal">
        (
        {e.momentFirstIndex !== e.momentLastIndex
          ? `${e.momentFirstIndex}-${e.momentLastIndex}`
          : `${e.momentFirstIndex}`}
        )
      </span>{" "}
      sur <span className="font-normal">{e.allMomentsTotal}</span> à la page{" "}
      <span className="font-normal">{e.currentPage}</span> sur{" "}
      <span className="font-normal">{e.totalPage}</span>
    </p>
  );
}

function PaginationButton({
  handlePagination,
  direction,
  subView,
  disabled,
  icon,
  iconClassName,
}: {
  handlePagination: (direction: "left" | "right", subView: SubView) => void;
  direction: "left" | "right";
  subView: SubView;
  disabled: boolean;
  icon: Icons.IconName;
  iconClassName?: string;
}) {
  const Icon = Icons[icon];

  return (
    <button
      onClick={() => handlePagination(direction, subView)}
      disabled={disabled}
      className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 disabled:text-neutral-200"
    >
      <div className="rounded-lg bg-white p-2 shadow">
        <Icon className={iconClassName} />
      </div>
    </button>
  );
}

// MomentForms Supporting Components

function StepForm({
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
  steps: StepFromCRUD[];
  setSteps: SetState<StepFromCRUD[]>;
  setStepVisible: SetState<StepVisible>;
  stepDuree: string;
  setStepDuree: SetState<string>;
  startCreateOrUpdateStepTransition: TransitionStartFunction;
  startResetStepTransition: TransitionStartFunction;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>;
}) {
  const stepFormId =
    variant === "updating"
      ? MOMENT_FORM_IDS[momentFormVariant].stepFormUpdating
      : MOMENT_FORM_IDS[momentFormVariant].stepFormCreating;

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
        MOMENT_FORM_IDS[momentFormVariant].stepFormCreating;

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

function MomentInputs({
  variant,
  moment,
  destinationOptions,
  createOrUpdateMomentState,
  destinationSelect,
  setDestinationSelect,
  activitySelect,
  setActivitySelect,
  inputSwitchKey,
  startMomentDate,
  setStartMomentDate,
}: {
  variant: MomentFormVariant;
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  destinationSelect: boolean;
  setDestinationSelect: SetState<boolean>;
  activitySelect: boolean;
  setActivitySelect: SetState<boolean>;
  inputSwitchKey: string;
  startMomentDate: string;
  setStartMomentDate: SetState<string>;
}) {
  const isVariantUpdatingMoment = variant === "updating" && moment;

  const destinationValues = destinationOptions.map((e) => e.value);
  const activityValues = activityOptions.map((e) => e.value);

  return (
    <>
      <InputText
        label="Destination"
        name="destination"
        defaultValue={isVariantUpdatingMoment ? moment.destinationIdeal : ""}
        description="Votre projet vise à atteindre quel idéal ?"
        addendum={
          destinationOptions.length > 0
            ? "Ou choissisez parmi vos destinations précédemment instanciées."
            : undefined
        }
        fieldFlexIsNotLabel
        tekTime
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.destinationName}
        hidden={destinationSelect}
      >
        {destinationOptions.length > 0 && (
          <Button
            type="button"
            variant="destroy"
            onClick={() => setDestinationSelect(true)}
          >
            Choisir la destination
          </Button>
        )}
      </InputText>
      <SelectWithOptions
        label="Destination"
        description="Choisissez la destination que cherche à atteindre ce moment."
        addendum="Ou définissez-la vous-même via le bouton ci-dessus."
        name="destination"
        defaultValue={
          isVariantUpdatingMoment &&
          destinationValues.includes(moment.destinationIdeal)
            ? moment.destinationIdeal
            : ""
        }
        placeholder="Choisissez..."
        options={destinationOptions}
        fieldFlexIsNotLabel
        tekTime
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.destinationName}
        hidden={!destinationSelect}
      >
        <Button
          type="button"
          variant="destroy"
          onClick={() => setDestinationSelect(false)}
        >
          Définir la destination
        </Button>
      </SelectWithOptions>
      <InputText
        label="Activité"
        description="Définissez le type d'activité qui va correspondre à votre problématique."
        addendum="Ou choissisez parmi une sélection prédéfinie via le bouton ci-dessus."
        name="activite"
        defaultValue={isVariantUpdatingMoment ? moment.activity : ""}
        fieldFlexIsNotLabel
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentActivity}
        hidden={activitySelect}
      >
        <Button
          type="button"
          variant="destroy"
          onClick={() => setActivitySelect(true)}
        >
          Choisir l&apos;activité
        </Button>
      </InputText>
      <SelectWithOptions
        label="Activité"
        description="Choisissez le type d'activité qui va correspondre à votre problématique."
        addendum="Ou définissez-le vous-même via le bouton ci-dessus."
        name="activite"
        defaultValue={
          isVariantUpdatingMoment && activityValues.includes(moment.activity)
            ? moment.activity
            : ""
        }
        placeholder="Choisissez..."
        options={activityOptions}
        fieldFlexIsNotLabel
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentActivity}
        hidden={!activitySelect}
      >
        <Button
          type="button"
          variant="destroy"
          onClick={() => setActivitySelect(false)}
        >
          Définir l&apos;activité
        </Button>
      </SelectWithOptions>
      <InputText
        label="Objectif"
        name="objectif"
        defaultValue={isVariantUpdatingMoment ? moment.objective : ""}
        description="Indiquez en une phrase le résultat que vous souhaiterez obtenir par ce moment."
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentName}
      />
      <InputSwitch
        key={inputSwitchKey}
        label="Indispensable ?"
        name="indispensable"
        defaultChecked={
          isVariantUpdatingMoment ? moment.isIndispensable : false
        }
        description="Activez l'interrupteur si ce moment est d'une importance incontournable."
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentIsIndispensable}
      />
      <Textarea
        label="Contexte"
        name="contexte"
        defaultValue={isVariantUpdatingMoment ? moment.context : ""}
        description="Expliquez ce qui a motivé ce moment et pourquoi il est nécessaire."
        rows={6}
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentDescription}
      />
      <InputDatetimeLocalControlled
        label="Date et heure"
        name="dateetheure"
        description="Déterminez la date et l'heure auxquelles ce moment doit débuter."
        definedValue={startMomentDate}
        definedOnValueChange={setStartMomentDate}
        required={false}
        errors={createOrUpdateMomentState?.momentErrors?.momentStartDateAndTime}
      />
    </>
  );
}

function ReorderItem({
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
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: SetState<CreateOrUpdateMomentState>;
  stepsCompoundDurations: number[];
  isDeleteStepPending: boolean;
  startDeleteStepTransition: TransitionStartFunction;
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
            <Button
              type="button"
              variant="destroy-step"
              onClick={restoreStepAction}
              disabled={isRestoreStepPending}
            >
              Restaurer l&apos;étape
            </Button>
          ) : (
            <Button
              variant="destroy-step"
              type="button"
              onClick={modifyStepAction}
              disabled={isModifyStepPending}
            >
              Modifier cette étape
            </Button>
          )}
        </div>
        {isCurrentStepUpdating ? (
          <div className="flex flex-col gap-y-8">
            <StepInputs
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
              <StepFormControlsMobileWrapper>
                <UpdateStepButton
                  form={form}
                  isUpdateStepPending={isUpdateStepPending}
                />
                <EraseStepButton
                  form={form}
                  deleteStepAction={deleteStepAction}
                  isDeleteStepPending={isDeleteStepPending}
                />
              </StepFormControlsMobileWrapper>
              {/* Desktop */}
              <StepFormControlsDesktopWrapper>
                <EraseStepButton
                  form={form}
                  deleteStepAction={deleteStepAction}
                  isDeleteStepPending={isDeleteStepPending}
                />
                <UpdateStepButton
                  form={form}
                  isUpdateStepPending={isUpdateStepPending}
                />
              </StepFormControlsDesktopWrapper>
            </div>
          </div>
        ) : (
          <StepContents
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

function StepsSummaries({
  stepVisible,
  endMomentDate,
  momentAddingTime,
}: {
  stepVisible: StepVisible;
  endMomentDate: string;
  momentAddingTime: number;
}) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Récapitulatifs
        </p>
      </div>
      <div className="grid grid-cols-[1fr_1.5fr] gap-4 md:grid md:grid-cols-[1fr_1fr]">
        <div className="space-y-2">
          <p className="font-medium text-blue-950">Fin attendue</p>
          <p className="font-semibold">
            <span className="font-medium text-neutral-800">à</span>{" "}
            <span
              className={clsx(
                (stepVisible === "updating" || stepVisible === "creating") &&
                  "text-neutral-400",
              )}
            >
              {format(endMomentDate, "HH:mm")}
            </span>
          </p>
        </div>
        <div className="space-y-2">
          <p className="font-medium text-blue-950">Durée totale</p>
          <p className="font-semibold">
            <span className="font-medium text-neutral-800">de </span>
            <span>
              <span
                className={clsx(
                  (stepVisible === "updating" || stepVisible === "creating") &&
                    "text-neutral-400",
                )}
              >
                {numStringToTimeString(momentAddingTime.toString())}
              </span>
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

function StepVisibleCreating({
  momentFormVariant,
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
}: {
  momentFormVariant: MomentFormVariant;
  isResetStepPending: boolean;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  stepDureeCreate: string;
  setStepDureeCreate: SetState<string>;
  isCreateStepPending: boolean;
  cancelStepAction: () => void;
  steps: StepFromCRUD[];
  isCancelStepPending: boolean;
  stepsCompoundDurations: number[];
  startMomentDate: string;
}) {
  const form = MOMENT_FORM_IDS[momentFormVariant].stepFormCreating;

  return (
    // was a form, but forms can't be nested
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Ajouter une étape
        </p>{" "}
        <Button
          form={form}
          variant="destroy-step"
          type="button"
          onClick={cancelStepAction}
          disabled={steps.length === 0 || isCancelStepPending}
        >
          Annuler l&apos;étape
        </Button>
      </div>
      <StepInputs
        form={form}
        createOrUpdateMomentState={createOrUpdateMomentState}
        stepDuree={stepDureeCreate}
        setStepDuree={setStepDureeCreate}
        startMomentDate={startMomentDate}
        stepsCompoundDurations={stepsCompoundDurations}
      />
      <div className="flex">
        {/* Mobile */}
        <StepFormControlsMobileWrapper>
          <Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={isCreateStepPending}
          >
            Confirmer l&apos;étape
          </Button>
          <Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </Button>
        </StepFormControlsMobileWrapper>
        {/* Desktop */}
        <StepFormControlsDesktopWrapper>
          <Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </Button>
          <Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={isCreateStepPending}
          >
            Confirmer l&apos;étape
          </Button>
        </StepFormControlsDesktopWrapper>
      </div>
    </div>
  );
}

function StepVisibleCreate({
  addStepAction,
  isAddStepPending,
}: {
  addStepAction: () => void;
  isAddStepPending: boolean;
}) {
  return (
    <div>
      <Button
        type="button"
        variant="neutral"
        onClick={addStepAction}
        disabled={isAddStepPending}
      >
        Ajouter une étape
      </Button>
    </div>
  );
}

function ConfirmMomentButton({
  isCreateOrUpdateMomentPending,
  isResetMomentPending,
  isDeleteMomentPending,
}: {
  isCreateOrUpdateMomentPending: boolean;
  isResetMomentPending: boolean;
  isDeleteMomentPending: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="confirm"
      disabled={
        isCreateOrUpdateMomentPending ||
        isResetMomentPending ||
        isDeleteMomentPending
      }
      isDedicatedDisabled={isCreateOrUpdateMomentPending}
    >
      Confirmer le moment
    </Button>
  );
}

function ResetOrEraseMomentButton({
  variant,
  deleteMomentAction,
  isResetMomentPending,
  isDeleteMomentPending,
  isCreateOrUpdateMomentPending,
}: {
  variant: string;
  deleteMomentAction: () => Promise<void>;
  isResetMomentPending: boolean;
  isDeleteMomentPending: boolean;
  isCreateOrUpdateMomentPending: boolean;
}) {
  return (
    <>
      {(() => {
        switch (variant) {
          case "creating":
            return (
              <Button
                type="reset"
                variant="cancel"
                disabled={isResetMomentPending || isCreateOrUpdateMomentPending}
                isDedicatedDisabled={isResetMomentPending}
              >
                Réinitialiser le moment
              </Button>
            );
          case "updating":
            return (
              <Button
                type="button"
                onClick={deleteMomentAction}
                variant="cancel"
                disabled={
                  isDeleteMomentPending || isCreateOrUpdateMomentPending
                }
                isDedicatedDisabled={isDeleteMomentPending}
              >
                Effacer le moment
              </Button>
            );
          default:
            return null;
        }
      })()}
    </>
  );
}

function StepInputs({
  form,
  createOrUpdateMomentState,
  stepDuree,
  setStepDuree,
  step,
  startMomentDate,
  stepAddingTime,
  stepsCompoundDurations,
}: {
  form: string;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  stepDuree: string;
  setStepDuree: SetState<string>;
  startMomentDate: string;
  stepsCompoundDurations: number[];
  step?: StepFromCRUD;
  stepAddingTime?: number;
}) {
  return (
    <>
      <InputText
        form={form}
        label="Intitulé de l'étape"
        name="intituledeleetape"
        defaultValue={step?.intitule}
        description="Définissez simplement le sujet de l'étape."
        required={false}
        errors={createOrUpdateMomentState?.stepsErrors?.stepName}
      />
      <Textarea
        form={form}
        label="Détails de l'étape"
        name="detailsdeleetape"
        defaultValue={step?.details}
        description="Expliquez en détails le déroulé de l'étape."
        rows={4}
        required={false}
        errors={createOrUpdateMomentState?.stepsErrors?.stepDescription}
      />
      <InputNumberControlled
        form={form}
        label="Durée de l'étape"
        name="dureedeletape"
        definedValue={stepDuree}
        definedOnValueChange={setStepDuree}
        description="Renseignez en minutes la longueur de l'étape."
        min="5"
        required={false}
        errors={createOrUpdateMomentState?.stepsErrors?.realStepDuration}
        schema={EventStepDurationSchema}
      >
        <p className="text-sm font-medium text-blue-900">
          commence à{" "}
          {step
            ? format(
                add(startMomentDate, {
                  minutes: stepAddingTime,
                }),
                "HH:mm",
              )
            : format(
                add(startMomentDate, {
                  minutes: stepsCompoundDurations.at(-1),
                }),
                "HH:mm",
              )}
        </p>
      </InputNumberControlled>
    </>
  );
}

function StepFormControlsMobileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex w-full flex-col gap-4 md:hidden">{children}</div>;
}

function StepFormControlsDesktopWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="hidden pt-2 md:ml-auto md:grid md:w-full md:grow md:grid-cols-2 md:gap-4">
      {children}
    </div>
  );
}

function UpdateStepButton({
  form,
  isUpdateStepPending,
}: {
  form: string;
  isUpdateStepPending: boolean;
}) {
  return (
    <Button
      form={form}
      type="submit"
      variant="confirm-step"
      disabled={isUpdateStepPending}
    >
      Actualiser l&apos;étape
    </Button>
  );
}

function EraseStepButton({
  form,
  deleteStepAction,
  isDeleteStepPending,
}: {
  form: string;
  deleteStepAction: () => void;
  isDeleteStepPending: boolean;
}) {
  return (
    <Button
      form={form}
      type="button"
      onClick={deleteStepAction}
      variant="cancel-step"
      disabled={isDeleteStepPending}
    >
      Effacer l&apos;étape
    </Button>
  );
}

function StepContents({
  step,
  index,
  hasAPreviousStepUpdating,
  startMomentDate,
  stepAddingTime,
}: {
  step: StepFromCRUD;
  index: number;
  hasAPreviousStepUpdating: boolean;
  startMomentDate: string;
  stepAddingTime: number;
}) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-blue-950">{step.intitule}</p>
      <p>
        <span
          className={clsx(
            index === 0 && "font-semibold",
            hasAPreviousStepUpdating && "text-neutral-400",
            !hasAPreviousStepUpdating && "text-neutral-800",
          )}
        >
          {format(
            add(startMomentDate, {
              minutes: stepAddingTime,
            }),
            "HH:mm",
          )}
        </span>
        <> • </>
        {numStringToTimeString(step.duree)}
      </p>
      <p className="text-sm text-neutral-500">{step.details}</p>
    </div>
  );
}