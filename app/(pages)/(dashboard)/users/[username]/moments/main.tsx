"use client";

import {
  // useCallback,
  useEffect,
  useState,
  useTransition,
  MouseEvent,
  FormEvent,
  TransitionStartFunction,
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
  Reorder,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import debounce from "debounce";
// @ts-ignore // no type declaration file on npm
import useKeypress from "react-use-keypress";
// import { useTimer } from "react-use-precision-timer";

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
  SearchParamsKey,
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
  DateCard,
  Divider,
  FieldTitle,
  InputDatetimeLocalControlled,
  InputNumberControlled,
  InputText,
  PageTitle,
  Section,
  NoDateCard,
  InputSwitch,
  SelectWithOptions,
  Textarea,
} from "@/app/components";
import * as Icons from "@/app/icons";
import {
  createOrUpdateStepActionflow,
  resetStepActionflow,
  deleteStepActionflow,
  revalidateMomentsActionflow,
  createOrUpdateMomentActionflow,
  resetMomentActionflow,
  deleteMomentActionflow,
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
  createOrUpdateMomentAfterflow,
  deleteMomentAfterflow,
  resetMomentAfterflow,
} from "@/app/flows/client/afterflows/moments";
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
  allUserMomentsToCRUD,
  maxPages,
  destinationOptions,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
  now,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  destinationOptions: Option[];
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
  now: string;
}) {
  console.log({ now });

  /* Functioning timer logic, with useTimer
  // The callback function to fire every step of the timer.
  const callback = useCallback(
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

  // let [view, setView] = useState<View>("read-moments");
  // starting directly with the form for now
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

  // at an upper level for UpdateMomentView
  const [moment, setMoment] = useState<MomentToCRUD | undefined>(); // undefined voluntarily chosen over null (or void) because "CreateMomentView" specifically and logically requires an undefined moment.

  const [isCRUDOpSuccessful, setIsCRUDOpSuccessful] = useState(false);

  let currentViewHeight = useMotionValue(0); // 0 as a default to stay a number

  useEffect(() => {
    currentViewHeight.set(
      // 0 as fallback, so if there's no height on screen the error is here
      document.getElementById(view)?.clientHeight || 0,
    );
  }, [view]);

  return (
    <main>
      {/* same "flex w-screen flex-col items-center md:w-[calc(100vw_-_9rem)]" as ViewWrapper (without the shrink-0) */}
      <div className="flex w-screen flex-col items-center md:w-[calc(100vw_-_9rem)]">
        {/* same "container px-8 lg:max-w-4xl" as ViewContainer (common classes problem yet to be solved) */}
        <div className="container flex justify-between px-8 py-8 align-baseline lg:max-w-4xl">
          <PageTitle title={viewTitles[view]} />
          <SetViewButton view={view} setView={setView} setMoment={setMoment} />
        </div>
        <Divider />
      </div>
      {/* incredible, the overflow-hidden just doesn't work with relative */}
      <div className="relative w-screen overflow-hidden md:w-[calc(100vw_-_9rem)]">
        <motion.div
          className="flex"
          // an error will return -1 if ever the screen shows empty
          // this is the height I need to specify
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
            <ViewContainer id="update-moment">
              {/* UpdateMomentView */}
              <MomentForms
                key={view} // to remount every time the view changes, because its when it's mounted that the default values are applied based on the currently set moment
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
            <ViewContainer id="read-moments">
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
            <ViewContainer id="create-moment">
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
  children,
}: {
  id: View;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={clsx("container px-8 lg:max-w-4xl", "pb-12")}>
      {children}
    </div>
  );
}

// Main Leading Components

// some style work there left to be done at a later occasion
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

  // because of debounce I'm exceptionally not turning this handler into an action
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);

    if (term) params.set(CONTAINS, term);
    else params.delete(CONTAINS);

    params.delete(USERMOMENTSPAGE);
    params.delete(PASTUSERMOMENTSPAGE);
    params.delete(CURRENTUSERMOMENTSPAGE);
    params.delete(FUTUREUSERMOMENTSPAGE);

    replace(`${pathname}?${params.toString()}`);
  } // https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const subViewSearchParams: { [K in SubView]: SearchParamsKey } = {
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
        rotateSubView("left"); // does not update the time because it speaks exclusively to the client
      } else {
        if (currentPage !== 1) handlePagination("left", subView); // updates the time because it speaks to the server (and the database)
      }
    }
  });

  useKeypress("ArrowRight", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        rotateSubView("right"); // does not update the time because it speaks exclusively to the client
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
      await revalidateMomentsActionflow(
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
      // an "action-flow" is a bridge between a server action and the immediate impacts it is expected to have on the client
      const state = await createOrUpdateMomentActionflow(
        event,
        createOrUpdateMoment,
        variant,
        startMomentDate,
        steps,
        moment,
        destinationSelect,
        activitySelect,
        setStartMomentDate,
        nowRoundedUpTenMinutes,
        setSteps,
        setStepVisible,
        createOrUpdateMomentState,
      );

      setCreateOrUpdateMomentState(state);
      setIsCreateOrUpdateMomentDone(true);
    });
  };

  useEffect(() => {
    if (isCreateOrUpdateMomentDone) {
      // an "after-flow" is the set of subsequent client impacts that follow the end of the preceding "action-flow" based on its side effects
      createOrUpdateMomentAfterflow(
        variant,
        createOrUpdateMomentState,
        setCreateOrUpdateMomentState,
        endMomentDate,
        now,
        startMomentDate,
        setSubView,
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
      if (confirm("Êtes-vous sûr de vouloir réinitialiser le formulaire ?")) {
        const state = resetMomentActionflow(
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
      resetMomentAfterflow(variant);

      setIsResetMomentDone(false);
    }
  }, [isResetMomentDone]);

  // deleteMomentAction

  const [isDeleteMomentPending, startDeleteMomentTransition] = useTransition();

  const [isDeleteMomentDone, setIsDeleteMomentDone] = useState(false);

  const deleteMomentAction = async () => {
    startDeleteMomentTransition(async () => {
      if (confirm("Êtes-vous sûr de vouloir effacer ce moment ?")) {
        const state = await deleteMomentActionflow(deleteMoment, moment);

        setCreateOrUpdateMomentState(state);
        setIsDeleteMomentDone(true);
      }
    });
  };

  useEffect(() => {
    if (isDeleteMomentDone) {
      deleteMomentAfterflow(
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
                      setCreateOrUpdateMomentState={
                        setCreateOrUpdateMomentState
                      }
                      stepsCompoundDurations={stepsCompoundDurations}
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
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
              />
              <ResetOrEraseMomentButton
                variant={variant}
                isResetMomentPending={isResetMomentPending}
                deleteMomentAction={deleteMomentAction}
                isDeleteMomentPending={isDeleteMomentPending}
              />
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              <ResetOrEraseMomentButton
                variant={variant}
                isResetMomentPending={isResetMomentPending}
                deleteMomentAction={deleteMomentAction}
                isDeleteMomentPending={isDeleteMomentPending}
              />
              <ConfirmMomentButton
                isResetMomentPending={isResetMomentPending}
                isDeleteMomentPending={isDeleteMomentPending}
                isCreateOrUpdateMomentPending={isCreateOrUpdateMomentPending}
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
  // though the function below could be a utility, it is very specific to this component at this time
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
        // SetViewButton is the only one that does setMoment to undefined
        if (view === "update-moment") setMoment(undefined);
        setScrollToTop(desiredView, setView);
      }}
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
  // this needs to be inside the component because its entirely specific to the component
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
  // Just a good old handler. On the fly, I write handlers as traditional functions and actions as arrow functions.
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
      const state = createOrUpdateStepActionflow(
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
        const state = resetStepActionflow(
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
}) {
  const controls = useDragControls();

  const isCurrentStepUpdating =
    currentStepId === step.id && stepVisible === "updating";

  const hasAPreviousStepUpdating =
    isAfterCurrentStep && stepVisible === "updating";

  const form = MOMENT_FORM_IDS[momentFormVariant].stepFormUpdating;

  // deleteStepAction

  const [isDeleteStepPending, startDeleteStepTransition] = useTransition();

  const deleteStepAction = () => {
    startDeleteStepTransition(() => {
      if (confirm("Êtes-vous sûr de vouloir effacer cette étape ?")) {
        deleteStepActionflow(steps, currentStepId, setSteps, setStepVisible);
        setCreateOrUpdateMomentState(removeStepsMessagesAndErrorsCallback);
      }
    });
  };

  // restoreStepAction

  const [isRestoreStepPending, startRestoreStepTransition] = useTransition();

  // the jumping is simply due to a current lack of animations
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
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      transition={{ layout: { duration: 0 } }}
      // layout="position" // or ""preserve-aspect""
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
  isResetMomentPending,
  isDeleteMomentPending,
  isCreateOrUpdateMomentPending,
}: {
  isResetMomentPending: boolean;
  isDeleteMomentPending: boolean;
  isCreateOrUpdateMomentPending: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="confirm"
      disabled={
        isResetMomentPending ||
        isDeleteMomentPending ||
        isCreateOrUpdateMomentPending
      }
      isDedicatedDisabled={isCreateOrUpdateMomentPending}
    >
      Confirmer le moment
    </Button>
  );
}

function ResetOrEraseMomentButton({
  variant,
  isResetMomentPending,
  deleteMomentAction,
  isDeleteMomentPending,
}: {
  variant: string;
  isResetMomentPending: boolean;
  deleteMomentAction: () => Promise<void>;
  isDeleteMomentPending: boolean;
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
                disabled={isResetMomentPending}
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
                disabled={isDeleteMomentPending}
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
          {step // && stepAddingTime (can equal 0 which is falsy)
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

/* Notes
No longer in use since submitting on Enter is not prevented all around:
// forcing with "!" because AFAIK there will always be a form.
// event.currentTarget.form!.requestSubmit();
Required supercedes display none. After all required is HTML, while display-none is CSS.
*/

/* Obsolete endeavors

// !!! THE PROBLEM HERE IS THAT SINCE THE SERVER ACTION IS NESTED IN THE MOMENTS PAGE, THERE IS NO TYPE SAFETY TO GUIDE ME THROUGH HERE.
let createOrUpdateMomentInitialState: {
  errors?: {
    zod1?: string;
    zod2?: string;
    zod3?: string;
  };
  message: string;
} | null = null;

let [
  createOrUpdateMomentState,
  createOrUpdateMomentAction,
  createOrUpdateMomentIsPending,
] = useActionState(
  createOrUpdateMomentBound,
  createOrUpdateMomentInitialState,
); // USEACTIONSTATE IS NO LONGER ON MY LEVEL.

// !!! THE PROBLEM HERE IS THAT SINCE THE SERVER ACTION IS NESTED IN THE MOMENTS PAGE, THERE IS NO TYPE SAFETY TO GUIDE ME THROUGH HERE.
let deleteMomentInitialState: {
  message: string;
} | null = null;

let [deleteMomentState, deleteMomentAction, deleteMomentIsPending] =
  useActionState(deleteMomentBound, deleteMomentInitialState); // USEACTIONSTATE IS NO LONGER ON MY LEVEL.

// action={async (formData) => {
//   await createOrUpdateMomentBound(formData);

//   if (variant === "creating") {
//     setIndispensable(false);
//     setMomentDate(format(nowRoundedUpTenMinutes, "yyyy-MM-dd'T'HH:mm"));
//     setSteps([]);
//     setStepVisible("creating");
//   }

//   setView("read-moments");
//   // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
// }}

// onClick={async () => {
//   if (!moment)
//     return console.error("Somehow a moment was not found.");

//   if (
//     confirm(
//       "Êtes-vous sûr que vous voulez effacer ce moment ?",
//     )
//   ) {
//     if (deleteMomentBound) await deleteMomentBound();
//     else
//       return console.error(
//         "Somehow deleteMomentBound was not a thing.",
//       );

//     setView("read-moments");
//   }
// }}

// onClick={async () => {
//   if (!moment)
//     return console.error("Somehow a moment was not found.");

//   if (
//     confirm(
//       "Êtes-vous sûr que vous voulez effacer ce moment ?",
//     )
//   ) {
//     if (deleteMomentBound) await deleteMomentBound();
//     else
//       return console.error(
//         "Somehow deleteMomentBound was not a thing.",
//       );

//     setView("read-moments");
//   }
// }}
 
onClick before useTransition
// // this, is looking like an action to make on Friday
// onClick={async (event) => {
//   const button = event.currentTarget;
//   button.disabled = true;
//   await revalidateMoments();
//   replace(`${pathname}`);
//   button.form!.reset(); // EXACTLY.
//   button.disabled = false;
// }}

// // I'm sure there's a way to optimize this with an array or an object for scale.
// const rotatingSubView = () => {
//   switch (subView) {
//     case "all-moments":
//       setSubView("past-moments");
//       break;
//     case "past-moments":
//       setSubView("current-moments");
//       break;
//     case "current-moments":
//       setSubView("future-moments");
//       break;
//     case "future-moments":
//       setSubView("all-moments");
//       break;
//     default:
//       break;
//   }
// };

// const reverseRotatingSubView = () => {
//   switch (subView) {
//     case "all-moments":
//       setSubView("future-moments");
//       break;
//     case "future-moments":
//       setSubView("current-moments");
//       break;
//     case "current-moments":
//       setSubView("past-moments");
//       break;
//     case "past-moments":
//       setSubView("all-moments");
//       break;
//     default:
//       break;
//   }
// };

// This below is the wrong approach. I think... I should accept having to manually change the type of my action's typing so that as the action changes, I'm constantly reminded that everything should fall together.
type TrueCreateOrUpdateMoment<T extends unknown[]> = (
  ...args: T[]
) => Promise<CreateOrUpdateMomentState>;

// In case – which is likely – the components using the server actions are in other files, these types should be in their respective type file
type CreateOrUpdateMoment = (
  variant: "creating" | "updating",
  indispensable: boolean,
  momentDate: string,
  steps: StepFromCRUD[],
  momentFromCRUD: MomentToCRUD | undefined,
  formData: FormData,
) => Promise<CreateOrUpdateMomentState>;

type DeleteMoment = (momentFromCRUD?: MomentToCRUD) => Promise<
  | {
      message: string;
    }
  | undefined
>;

type RevalidateMoments = () => Promise<void>;

// This needs to be an action. // DONE.
// And this needs a confirm. // DONE.
// I didn't know at the time that action could be use on pretty much anything. // DONE.

// masking the React 19 bug...
// OR, this should be on the server after validating fields from Votre moment
// if (steps.length === 0) {
//   if (destinationSelect) {
//     setDestinationTextControlled(destinationOptionControlled);
//     setDestinationSelect(false);
//   }
//   if (activitySelect) {
//     setActiviteTextControlled(activiteOptionControlled);
//     setActivitySelect(false);
//   }
//   return setCreateOrUpdateMomentState({
//     stepsMessage:
//       "Vous ne pouvez pas créer de moment sans la moindre étape. Veuillez créer au minimum une étape.",
//   });
// }

Test in surfacing server-side and client-side errors.
The connection to the server (and client!) has been established.

OLDEN COMMENTS
  // now to see if I can do all this in the action without the useEffect...
  // it can't work in the action, probably again due to the way they're batched
  // this means the scrolling information will have to be inferred from createOrUpdateMomentState inside the useEffect, making the useEffect an extension of the action (until actions are hopefully improved)
  useEffect(() => {
    // console.log("changed");
    // This is going to need its own stateful boolean or rather enum once I'll know exactly what I want to do here.
    if (view === "create-moment" && createOrUpdateMomentState) {
      // console.log("activated");
      // To be fair, createOrUpdateMomentState is enough of a trigger. If it's null, I let the useEffect from reset do the thing. If it's not, then that means createOrUpdate has return a setCreateOrUpdateMomentState.
      if (createOrUpdateMomentState.momentMessage) {
        const votreMoment = document.getElementById("votre-moment");
        return votreMoment?.scrollIntoView({ behavior: "smooth" });
      }
      if (createOrUpdateMomentState.stepsMessage) {
        const sesEtapes = document.getElementById("ses-etapes");
        return sesEtapes?.scrollIntoView({ behavior: "smooth" });
      }
    }
    // now I just need this to incorporate its own padding instead of having it be from the form's space-y-8 // done but keeping the comment as a reminder to never rely on Tailwind's space- in the long run, it's a kickstarting feature
  }, [createOrUpdateMomentState]);
  // Avec ça je vais impressionner Mohamed et renégocier avec lui. Je pense que les client ET server validations sont le différenciateur clair d'un usage indispensable entre l'ancien et le nouveau React.

// no need for RevalidateMomentsState, revalidateMomentsState and setRevalidateMomentsState for now since no error message is planned for this
// type RevalidateMomentsState = { message: string } | void;
// const [revalidateMomentsState, setRevalidateMomentsState] =
//   useState<RevalidateMomentsState>();

NO NEED, deleteMomentAction should only fire if there is deleteMomentBound.
else
  return setCreateOrUpdateMomentState({
    momentMessage: "Erreur.",
    momentSubMessage:
      "Il semble que deleteMomentBound est inexistant en interne.",
  }); // this one is very specific to the client since deleteMomentBound is optional, passed as a prop only on the updating variant of MomentForms

// Is the wrapping necessary if no default argument is to be provided?
// It's actually necessary because that's where the event is located. The prop receiving this requires at least an undefined, but not a void.

// and another state for that useEffect
// ...or you could argue, that this is the state for resetMomentFormAction, so I'm renaming it from resetMomentFormActionDone to resetMomentFormState at this time... no, they're not that related so isResetMomentDone it is
// const [isResetMomentDone, setIsResetMomentDone] = useState(false);

// test
// return setCreateOrUpdateStepState({ message: "It works though." });
// It does. But the formData goes away again. :')
// Works both for create and update separately.

// It's the sole circumstance where I'm OK with this using the formData since I don't do server-side validations here. // (Actually... No.) :')
// A next thought could be on thinking about how client-side errors could be surfaced since the form is on its own. Simple. Instantiate the state and the setState in the parent component that needs it, and pass them here as prop (just the setState maybe) to StepForm to be used in returns from createStepAction. // DONE.
// But then that means I'm also going to have to do away with the formData when that happens, and use controlled inputs so that they don't get reset when there's an error. Which also means a parent component where the "true nested form" lives will have to follow these states and pass them to StepForm to be somehow bound to a createStep above... But since it's all in the client, bind won't be needed and the states will be directly accessible from the action below. // DONE.
// Bonus: If isCreateStepPending is needed, that too will need to be instantiated in the parent component where the "true nested form" lives, with startCreateStepTransition passed as props here to create the action below. // DONE.
...
// If we're honest I need to learn more about animations before moving on, but I've already been able to apply a whole lot. Only one conditional can be wrapped by AnimatePresence, so when things get complicated go for the self-firing switch case. Also don't forget about "auto" to animate height to 100%. And so far gaps are the ban of sibling animations.

// initial={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
// animate={{
//   opacity: 1,
//   height: "auto",
//   transition: { duration: 0.2 },
// }}
// exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}

// The jump is due to space-y, actually the gap-y-8 from Section. I'll need to fix it. (Like I actually already did with ReorderItem.)
// That's what it is: the two gap-y-8 remain stacked during animations.
...
// Something else when it comes to animations that is very important. Preferring dropdowns. From just my experience, dynamic spaces that reach the edge of the page behave differently on my computer than on my mobile. So when it comes to adding a step, if I'd want the navigation to not move I'd need the step form to toggle from a button, not to replace the button.

// initial={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
// animate={{
//   opacity: 1,
//   height: "auto",
//   transition: { duration: 0.2 },
// }}
// exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
*/
