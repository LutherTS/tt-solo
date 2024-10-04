"use client";

import {
  Dispatch,
  SetStateAction,
  // useActionState, // proudly commented out
  // useCallback,
  useEffect,
  useState,
  useTransition,
  MouseEvent,
  FormEvent,
  TransitionStartFunction,
} from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import {
  add,
  compareAsc,
  compareDesc,
  format,
  // roundToNearestHours,
  // sub,
} from "date-fns";
import { fr } from "date-fns/locale";
import {
  Reorder,
  useDragControls,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import debounce from "debounce";
// import { useTimer } from "react-use-precision-timer";

// @ts-ignore // no type declaration file on npm
import useKeypress from "react-use-keypress";

import { Option } from "@/app/types/globals";
import {
  UserMomentsToCRUD,
  MomentToCRUD,
  StepFromCRUD,
  CreateOrUpdateMomentState,
  CreateOrUpdateMoment,
  DeleteMoment,
  RevalidateMoments,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  defineCurrentPage,
  numStringToTimeString,
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
  InputSwitchControlled,
  InputText,
  InputTextControlled,
  PageTitle,
  Section,
  NoDateCard,
  SelectWithOptionsControlled,
  TextareaControlled,
} from "../../../components";
import * as Icons from "../icons";
import {
  CONTAINS,
  CURRENTUSERMOMENTSPAGE,
  FUTUREUSERMOMENTSPAGE,
  PASTUSERMOMENTSPAGE,
  USERMOMENTSPAGE,
} from "@/app/searches/moments";
import { CreateOrUpdateStepSchema } from "@/app/validations/steps";

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

// Main Types

// The types below are helpers for the file more than anything else. No need to have them imported for a type file at this time.

type View = "update-moment" | "create-moment" | "read-moments";

type SubView =
  | "all-moments"
  | "past-moments"
  | "current-moments"
  | "future-moments";

type StepVisible = "create" | "creating" | "updating";

// Main Data

const activityOptions: Option[] = [
  { key: 1, label: "Atelier", value: "Atelier" },
  { key: 2, label: "Comité", value: "Comité" },
  { key: 3, label: "Conférence", value: "Conférence" },
  { key: 4, label: "Entretien individuel", value: "Entretien individuel" },
  { key: 5, label: "Embauche", value: "Embauche" },
  { key: 6, label: "Pomodoro", value: "Pomodoro" },
  { key: 7, label: "Intégration", value: "Intégration" },
  { key: 8, label: "Partage d'informations", value: "Partage d'informations" },
  { key: 9, label: "Présentation", value: "Présentation" },
  { key: 10, label: "Réseautage", value: "Réseautage" },
  { key: 11, label: "Rituel agile", value: "Rituel agile" },
  { key: 12, label: "Résolution de problème", value: "Résolution de problème" },
  { key: 13, label: "Rendez-vous client", value: "Rendez-vous client" },
  { key: 14, label: "Réunion commerciale", value: "Réunion commerciale" },
  { key: 15, label: "Suivi de projet", value: "Suivi de projet" },
  { key: 16, label: "Séminaire", value: "Séminaire" },
];

const DEFAULT_STEP_MESSAGE =
  "Erreurs sur le renseignement étapes du formulaire.";
const DEFAULT_STEP_SUBMESSAGE = "Veuillez vérifier les champs concernés.";

// Main Component

export function CRUD({
  allUserMomentsToCRUD,
  destinationOptions,
  maxPages,
  createOrUpdateMoment,
  deleteMoment,
  revalidateMoments,
  now,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  destinationOptions: Option[];
  maxPages: number[];
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
  revalidateMoments: RevalidateMoments;
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

  let [view, setView] = useState<View>("read-moments");

  let viewTitles = {
    "update-moment": "Éditez",
    "read-moments": "Vos moments",
    "create-moment": "Créez",
  };

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

  // for UpdateMomentView
  let [moment, setMoment] = useState<MomentToCRUD>();

  return (
    <>
      <div>
        <div className="flex justify-between pb-8 align-baseline">
          <PageTitle title={viewTitles[view]} />
          {view === "update-moment" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setScrollToTop("read-moments", setView)}
            >
              Vos moments
            </Button>
          )}
          {view === "read-moments" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setScrollToTop("create-moment", setView)}
            >
              Créez un moment
            </Button>
          )}
          {view === "create-moment" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setScrollToTop("read-moments", setView)}
            >
              Vos moments
            </Button>
          )}
        </div>
        {view !== "read-moments" && <Divider />}
      </div>
      {/* For now create and update views need to be removed from the DOM opposingly, but eventually I have to give them respective form names. Same needs to be considered for destination and activite, but the solution used here for now is satisfactory. */}
      <div className={clsx(view !== "update-moment" && "hidden")}>
        {/* Here, UpdateMomentView needs to be unmounted on ReadMomentsView to be reinstantiated with the correct defaults */}
        {view === "update-moment" && (
          // UpdateMomentView
          <MomentForms
            variant="updating"
            moment={moment}
            destinationOptions={destinationOptions}
            createOrUpdateMoment={createOrUpdateMoment}
            deleteMoment={deleteMoment}
            view={view}
            setView={setView}
            setSubView={setSubView}
            now={now}
          />
        )}
      </div>
      <div className={clsx(view !== "read-moments" && "hidden")}>
        <ReadMomentsView
          allUserMomentsToCRUD={allUserMomentsToCRUD}
          maxPages={maxPages}
          revalidateMoments={revalidateMoments}
          setMoment={setMoment}
          view={view}
          subView={subView}
          setView={setView}
          setSubView={setSubView}
        />
      </div>
      <div className={clsx(view !== "create-moment" && "hidden")}>
        {/* Here, CreateMomentView needs to stay in the DOM in order for the form contents to remain when looking at other moments on ReadMomentsView. But an improvement could be to give variants of MomentForms their own form input names. However, in a real project with a database, revalidate could negate this effort depending on how it is implemented. This will be it for this demo. */}
        {view !== "update-moment" && (
          // CreateMomentView
          <MomentForms
            variant="creating"
            destinationOptions={destinationOptions}
            createOrUpdateMoment={createOrUpdateMoment}
            view={view}
            setView={setView}
            setSubView={setSubView}
            now={now}
          />
        )}
      </div>
    </>
  );
}

// Main Leading Components

function ReadMomentsView({
  allUserMomentsToCRUD,
  maxPages,
  revalidateMoments,
  view,
  subView,
  setMoment,
  setView,
  setSubView,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  revalidateMoments: RevalidateMoments;
  view: View;
  subView: SubView;
  setMoment: Dispatch<SetStateAction<MomentToCRUD | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
  setSubView: Dispatch<SetStateAction<SubView>>;
}) {
  let subViewTitles = {
    "all-moments": "Tous",
    "past-moments": "Passés",
    "current-moments": "Actuels",
    "future-moments": "Futurs",
  };

  const [
    realAllMoments,
    realPastMoments,
    realCurrentMoments,
    realFutureMoments,
  ] = allUserMomentsToCRUD;

  const realShowcaseMoments = {
    "all-moments": realAllMoments,
    "past-moments": realPastMoments,
    "current-moments": realCurrentMoments,
    "future-moments": realFutureMoments,
  };

  const subViews = [
    "all-moments",
    "past-moments",
    "current-moments",
    "future-moments",
  ] as const;

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
  } // https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const subViewSearchParams = {
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

  let subViewMaxPages = {
    "all-moments": maxPageAllMoments,
    "past-moments": maxPagePastMoments,
    "current-moments": maxPageCurrentMoments,
    "future-moments": maxPageFutureMoments,
  };

  let initialPage = 1;
  const currentPage = defineCurrentPage(
    initialPage,
    Number(searchParams.get(subViewSearchParams[subView])),
    subViewMaxPages[subView],
  );

  function handlePagination(direction: "left" | "right", subView: SubView) {
    const params = new URLSearchParams(searchParams);
    if (direction === "left")
      params.set(
        subViewSearchParams[subView],
        Math.max(1, currentPage - 1).toString(),
      );
    else
      params.set(
        subViewSearchParams[subView],
        Math.min(subViewMaxPages[subView], currentPage + 1).toString(),
      );

    if (params.get(subViewSearchParams[subView]) === "1")
      params.delete(subViewSearchParams[subView]);

    replace(`${pathname}?${params.toString()}`);
  }

  /* FLASH IDEA
  Let's try some useKeyPress now.
  Arrow left and arrow right do handlePagination.
  With alt, arrow left and arrow right do "reverseSetSubView", setSubView.
  */ // DONE.

  const rotateSubView = (direction: "left" | "right") =>
    rotateStates(direction, setSubView, subViews, subView);

  useKeypress("ArrowLeft", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        // console.log("alt+left");
        rotateSubView("left"); // does not update the time because it speaks exclusively to the client
      } else {
        // console.log("left");
        if (currentPage !== 1) handlePagination("left", subView); // updates the time because it speaks to the server (and the database)
      }
    }
  });

  useKeypress("ArrowRight", (event: KeyboardEvent) => {
    if (view === "read-moments") {
      event.preventDefault();

      if (event.altKey) {
        // console.log("alt+right");
        rotateSubView("right"); // does not update the time because it speaks exclusively to the client
      } else {
        // console.log("right");
        if (currentPage !== subViewMaxPages[subView])
          handlePagination("right", subView); // updates the time because it speaks to the server (and the database)
      }
    }
  });

  /* FLASH IDEA
  One "last" thing I could do is save the scroll position in a state so that hopefully the scrollTo is fast enough that we don't notice the correct position being brought back on searchParms changes when switching pages inside a subView.
  */ // DONE.
  // Also, no need to lift subView to the URL. Since the page is time dependent, making someone land on a specific subView is inherently inconsistent. The current model of landing first on Actuels, then Futurs, then Passés, then Tous as a fallback makes the most sense.

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

  // no need for RevalidateMomentsState, revalidateMomentsState and setRevalidateMomentsState for now since no error message is planned for this
  // type RevalidateMomentsState = { message: string } | void;
  // const [revalidateMomentsState, setRevalidateMomentsState] =
  //   useState<RevalidateMomentsState>();

  const revalidateMomentsAction = async (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    startRevalidateMomentsTransition(async () => {
      const button = event.currentTarget;
      await revalidateMoments();
      replace(`${pathname}`);
      button.form?.reset(); // Indeed.
    });
  };

  return (
    <div className="space-y-8">
      <div className={clsx("flex flex-wrap gap-4")}>
        {subViews.map((e) => {
          const className = "px-4 py-2 h-9 flex items-center justify-center";
          return (
            <button
              onClick={() => setSubView(e)}
              key={e}
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
        })}
        <button
          // to target the input in the form that needs to be reset
          form="form"
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
          <div
            className={clsx("absolute inset-0 rounded-full", "bg-white")}
          ></div>
        </button>
      </div>
      {/* to place the input into a form so it can be reset */}
      <form id="form">
        <InputText
          // keeping the "contains" out of variable for this because unsure if "contains" the definitive id and name
          id="contains"
          name="contains"
          placeholder="Cherchez parmi vos moments..."
          defaultValue={searchParams.get(CONTAINS)?.toString()}
          onChange={(e) => {
            debouncedHandleSearch(e.currentTarget.value);
          }}
        />
      </form>
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
                      <div
                        className="flex flex-col gap-y-8"
                        key={e2.destinationIdeal}
                      >
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
                          <div
                            className={clsx(
                              "group space-y-2",
                              i3 === 0 && "-mt-5",
                            )}
                            key={e3.id}
                          >
                            <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
                              <p className="font-medium text-blue-950">
                                {e3.objective}
                              </p>
                              <div className="invisible flex justify-end group-hover:visible">
                                <Button
                                  type="button"
                                  variant="destroy-step"
                                  onClick={() => {
                                    setMoment(
                                      realMoments.find((e4) => e4.id === e3.id),
                                    );
                                    setScrollToTop("update-moment", setView);
                                  }}
                                >
                                  <Icons.PencilSquareSolid className="size-5" />
                                </Button>
                              </div>
                            </div>
                            <p>
                              <span
                                className={"font-semibold text-neutral-800"}
                              >
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
                                <li
                                  className="text-sm font-light leading-loose text-neutral-500"
                                  key={e4.id}
                                >
                                  <p className="">
                                    {e4.startDateAndTime.split("T")[1]} -{" "}
                                    {e4.endDateAndTime.split("T")[1]} :{" "}
                                    {e4.title}
                                  </p>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </DateCard>
              </div>
              {i === a.length - 1 && (
                <p className="font-extralight text-neutral-800">
                  <span className="font-normal">{e.momentsTotal}</span>{" "}
                  moment(s) affiché(s){" "}
                  <span className="font-normal">
                    (
                    {e.momentFirstIndex !== e.momentLastIndex
                      ? `${e.momentFirstIndex}-${e.momentLastIndex}`
                      : `${e.momentFirstIndex}`}
                    )
                  </span>{" "}
                  sur <span className="font-normal">{e.allMomentsTotal}</span> à
                  la page <span className="font-normal">{e.currentPage}</span>{" "}
                  sur <span className="font-normal">{e.totalPage}</span>
                </p>
              )}
            </div>
          ))}
          <div className="flex justify-between">
            <button
              onClick={() => handlePagination("left", subView)}
              disabled={currentPage === 1}
              className="disabled:text-neutral-200"
            >
              <div className="rounded-lg bg-white p-2 shadow">
                <Icons.ArrowLeftSolid />
              </div>
            </button>
            <button
              onClick={() => handlePagination("right", subView)}
              disabled={currentPage === subViewMaxPages[subView]}
              className="disabled:text-neutral-200"
            >
              <div className="rounded-lg bg-white p-2 shadow">
                <Icons.ArrowRightSolid />
              </div>
            </button>
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
  createOrUpdateMoment,
  deleteMoment,
  view,
  setView,
  setSubView,
  now,
}: {
  variant: "creating" | "updating";
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment?: DeleteMoment;
  view: View;
  setView: Dispatch<SetStateAction<View>>;
  setSubView: Dispatch<SetStateAction<SubView>>;
  now: string;
}) {
  const nowRoundedUpTenMinutes = roundTimeUpTenMinutes(now);

  // InputSwitch unfortunately has to be controlled for resetting
  let [indispensable, setIndispensable] = useState(
    moment ? moment.isIndispensable : false,
  );

  // datetime-local input is now controlled.
  let [startMomentDate, setStartMomentDate] = useState(
    moment ? moment.startDateAndTime : nowRoundedUpTenMinutes,
  );

  const momentSteps: StepFromCRUD[] | undefined = moment?.steps.map((e) => {
    return {
      id: e.id,
      intitule: e.title,
      details: e.details,
      duree: e.duration,
    };
  });

  let [stepVisible, setStepVisible] = useState<StepVisible>("creating");
  let [steps, setSteps] = useState<StepFromCRUD[]>(
    momentSteps ? momentSteps : [],
  );
  let overallAddingTime = steps.reduce((acc, curr) => acc + +curr.duree, 0);
  let endMomentDate = format(
    add(startMomentDate, {
      minutes: overallAddingTime,
    }),
    "yyyy-MM-dd'T'HH:mm",
  );

  let [currentStepId, setCurrentStepId] = useState("");
  let currentStep = steps.find((step) => step.id === currentStepId);

  let [destinationSelect, setDestinationSelect] = useState(false);
  let [activitySelect, setActivitySelect] = useState(false);

  // https://github.com/facebook/react/issues/29034
  // which is sad because React 19 kinda promise to never again need useState

  let [destinationTextControlled, setDestinationTextControlled] = useState(
    moment ? moment.destinationIdeal : "",
  );
  let [destinationOptionControlled, setDestinationOptionControlled] = useState(
    moment ? moment.destinationIdeal : "",
  );

  let [activiteTextControlled, setActiviteTextControlled] = useState(
    moment ? moment.activity : "",
  );

  const activityValues = activityOptions.map((e) => e.value);

  let [activiteOptionControlled, setActiviteOptionControlled] = useState(
    moment && activityValues.includes(moment.activity) ? moment.activity : "",
  );

  let [objectifControlled, setObjectifControlled] = useState(
    moment ? moment.objective : "",
  );
  let [contexteControlled, setContexteControlled] = useState(
    moment ? moment.context : "",
  );

  // createOrUpdateMomentAction

  const createOrUpdateMomentBound = createOrUpdateMoment.bind(
    null,
    variant,
    indispensable,
    startMomentDate,
    steps,
    destinationSelect ? destinationOptionControlled : destinationTextControlled,
    activitySelect ? activiteOptionControlled : activiteTextControlled,
    objectifControlled,
    contexteControlled,
    moment,
  );

  // since this is used in a form, the button already has isPending from useFormStatus making this isCreateOrUpdateMomentPending superfluous
  // ...but to make the action autonomous I'll add it nonetheless
  // a cool thought could be to have disabled styles specific to the reason that disables the button, like making them only visible if the action of the button itself is pending, and not if it's due to anything else.
  const [isCreateOrUpdateMomentPending, startCreateOrUpdateMomentTransition] =
    useTransition();

  const [createOrUpdateMomentState, setCreateOrUpdateMomentState] =
    useState<CreateOrUpdateMomentState>(null);

  const createOrUpdateMomentAction = async () => {
    startCreateOrUpdateMomentTransition(async () => {
      const state = await createOrUpdateMomentBound();
      if (state) {
        // watch this
        // aligning the text of controlled with the option or whatever value was provided (trimmed)
        if (state.bs?.destinationName)
          setDestinationTextControlled(state.bs.destinationName);
        if (state.bs?.momentActivity)
          setActiviteTextControlled(state.bs.momentActivity);
        // returning to the text version, so that shifting back to the select version will automatically set back to the proper value
        setDestinationSelect(false);
        setActivitySelect(false);
        // but what solving this specifically means is... you can never use selects on their own with the current state of React 19

        return setCreateOrUpdateMomentState(state);
      }

      if (variant === "creating") {
        setIndispensable(false);
        setStartMomentDate(nowRoundedUpTenMinutes);
        setSteps([]);
        setStepVisible("creating");

        setDestinationTextControlled("");
        setDestinationOptionControlled("");
        setActiviteTextControlled("");
        setActiviteOptionControlled("");
        setObjectifControlled("");
        setContexteControlled("");
      }

      // this now works thanks to export const dynamic = "force-dynamic";
      // ...I think
      if (compareDesc(endMomentDate, now) === 1) setSubView("past-moments");
      else if (compareAsc(startMomentDate, now) === 1)
        setSubView("future-moments");
      // therefore present by default
      else setSubView("current-moments");

      setScrollToTop("read-moments", setView);
      // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
    });
  };

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

  // deleteMomentAction

  let deleteMomentBound: DeleteMoment;
  if (deleteMoment) deleteMomentBound = deleteMoment.bind(null, moment);

  const [isDeleteMomentPending, startDeleteMomentTransition] = useTransition();

  // Not sure this line is necessary if no default argument is to be provided.
  // Edit: It's actually necessary because that's where the event is located. The prop receiving this requires at least an undefined, but not a void.
  const deleteMomentAction = async () => {
    startDeleteMomentTransition(async () => {
      if (confirm("Êtes-vous sûr que vous voulez effacer ce moment ?")) {
        if (deleteMomentBound) {
          const state = await deleteMomentBound();
          if (state) return setCreateOrUpdateMomentState(state);

          setScrollToTop("read-moments", setView);
        } else
          return setCreateOrUpdateMomentState({
            momentMessage: "Erreur.",
            momentSubMessage:
              "Il semble que deleteMomentBound est inexistant en interne.",
          }); // this one is very specific to the client since deleteMomentBound is optional, passed as a prop only on the updating variant of MomentForms
      }
    });
  };

  // resetMomentFormAction

  const [isResetMomentFormPending, startResetMomentFormTransition] =
    useTransition();

  // action is (now) completely client, so no need for async
  const resetMomentFormAction = (event: FormEvent<HTMLFormElement>) => {
    startResetMomentFormTransition(() => {
      if (
        confirm("Êtes-vous sûr que vous voulez réinitialiser le formulaire ?")
      ) {
        // if (revalidateMoments) await revalidateMoments();
        // The (side?) effects of the revalidation are felt after the action ends. That's why they can't be used within the action.

        setIndispensable(false);

        // setStartMomentDate(nowRoundedUpTenMinutes);
        // the easy solution
        setStartMomentDate(
          roundTimeUpTenMinutes(dateToInputDatetime(new Date())),
        ); // the harder solution would be returning that information a server action, but since it can be obtained on the client and it's just for cosmetics, that will wait for a more relevant use case (it's an escape hatch I've then used to solve a bug from React 19 above)
        // Or actually the flow that I preconize now is to do what's next to be done inside a subsequent useEffect (but I don't think that would have worked). Here it had only to do with time so I could guess it manually, but for anything more complex, that's where useEffect currently comes in until the React team defeat it as the "final boss."
        // https://x.com/acdlite/status/1758231913314091267
        // https://x.com/acdlite/status/1758233493408973104

        setSteps([]);
        setStepVisible("creating");

        setDestinationTextControlled("");
        setDestinationOptionControlled("");
        setActiviteTextControlled("");
        setActiviteOptionControlled("");
        setObjectifControlled("");
        setContexteControlled("");

        setIntituleCreateControlled("");
        setDetailsCreateControlled("");
        setDureeCreateControlled("10");

        // reset action states as well
        // !! Par la suite penser à faire en sorte que le bouton Confirmer le moment soit disponible et indique de faire des étapes si on le clique. (stepsMessage, vosEtapes?.scrollIntoView({ behavior: "smooth" }))
        setCreateOrUpdateMomentState(null); // the jumping culprit, even will null, but in the end a different solution below ignores the issue (irregular defaults)

        // for the useEffect
        setIsResetMomentDone(true);
      } else event.preventDefault();
    });
  };

  // and another state for that useEffect
  // ...or you could argue, that this is the state for resetMomentFormAction, so I'm renaming it from resetMomentFormActionDone to resetMomentFormState at this time... no, they're not that related so isResetMomentDone it is
  const [isResetMomentDone, setIsResetMomentDone] = useState(false);

  useEffect(() => {
    if (isResetMomentDone) {
      const votreMoment = document.getElementById("votre-moment");
      votreMoment?.scrollIntoView({ behavior: "smooth" });
      setIsResetMomentDone(false);
    }
  }, [isResetMomentDone]);

  // Here we go again to control the StepForm fields...
  // And there's two variant, so I need to duplicate the states...
  // ...Eventually. Only one variant is in the DOM at ont time. So for now I can... No. Two states. Even for startTransitions.
  // ...
  // I'm laughing but it's not funny.

  let [intituleCreateControlled, setIntituleCreateControlled] = useState("");
  let [detailsCreateControlled, setDetailsCreateControlled] = useState("");
  let [dureeCreateControlled, setDureeCreateControlled] = useState("10");

  let [intituleUpdateControlled, setIntituleUpdateControlled] = useState(
    currentStep ? currentStep.intitule : "",
  );
  let [detailsUpdateControlled, setDetailsUpdateControlled] = useState(
    currentStep ? currentStep.details : "",
  );
  let [dureeUpdateControlled, setDureeUpdateControlled] = useState(
    currentStep ? currentStep.duree : "",
  );

  // CreateOrUpdateStepAction

  const [isCreateStepPending, startCreateStepTransition] = useTransition();

  const [isUpdateStepPending, startUpdateStepTransition] = useTransition();

  return (
    <>
      <StepForm
        variant="creating"
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        intitule={intituleCreateControlled}
        details={detailsCreateControlled}
        duree={dureeCreateControlled}
        setIntitule={setIntituleCreateControlled}
        setDetails={setDetailsCreateControlled}
        setDuree={setDureeCreateControlled}
        startCreateOrUpdateStepTransition={startCreateStepTransition}
        createOrUpdateMomentState={createOrUpdateMomentState}
        setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
      />
      <StepForm
        variant="updating"
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        intitule={intituleUpdateControlled}
        details={detailsUpdateControlled}
        duree={dureeUpdateControlled}
        setIntitule={setIntituleUpdateControlled}
        setDetails={setDetailsUpdateControlled}
        setDuree={setDureeUpdateControlled}
        startCreateOrUpdateStepTransition={startUpdateStepTransition}
        createOrUpdateMomentState={createOrUpdateMomentState}
        setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
      />
      <form action={createOrUpdateMomentAction} onReset={resetMomentFormAction}>
        <Section
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
          id="votre-moment"
          error={createOrUpdateMomentState?.momentMessage}
          subError={createOrUpdateMomentState?.momentSubMessage}
        >
          {!destinationSelect ? (
            <InputTextControlled
              label="Destination"
              name="destination"
              definedValue={destinationTextControlled}
              definedOnValueChange={setDestinationTextControlled}
              description="Votre projet vise à atteindre quel idéal ?"
              addendum={
                destinationOptions.length > 0
                  ? "Ou choissisez parmi vos destinations précédemment instanciées."
                  : undefined
              }
              fieldFlexIsNotLabel
              tekTime
              // required={!destinationSelect}
              required={false}
              // errors={testErrors}
              errors={createOrUpdateMomentState?.errors?.destinationName}
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
            </InputTextControlled>
          ) : (
            <SelectWithOptionsControlled
              label="Destination"
              description="Choisissez la destination que cherche à atteindre ce moment."
              addendum="Ou définissez la vous-même via le bouton ci-dessus."
              name="destination"
              placeholder="Choisissez..."
              definedValue={destinationOptionControlled}
              definedOnValueChange={setDestinationOptionControlled}
              options={destinationOptions}
              fieldFlexIsNotLabel
              tekTime
              // required={destinationSelect}
              required={false}
              // errors={testErrors}
              errors={createOrUpdateMomentState?.errors?.destinationName}
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setDestinationSelect(false)}
              >
                Définir la destination
              </Button>
            </SelectWithOptionsControlled>
          )}
          {!activitySelect ? (
            <InputTextControlled
              label="Activité"
              description="Définissez le type d'activité qui va correspondre à votre problématique."
              addendum="Ou choissisez parmi une sélection prédéfinie via le bouton ci-dessus."
              name="activite"
              definedValue={activiteTextControlled}
              definedOnValueChange={setActiviteTextControlled}
              fieldFlexIsNotLabel
              // required={!activitySelect}
              required={false}
              errors={createOrUpdateMomentState?.errors?.momentActivity}
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setActivitySelect(true)}
              >
                Choisir l&apos;activité
              </Button>
            </InputTextControlled>
          ) : (
            <SelectWithOptionsControlled
              label="Activité"
              description="Choisissez le type d'activité qui va correspondre à votre problématique."
              addendum="Ou définissez le vous-même via le bouton ci-dessus."
              name="activite"
              definedValue={activiteOptionControlled}
              definedOnValueChange={setActiviteOptionControlled}
              placeholder="Choisissez..."
              options={activityOptions}
              fieldFlexIsNotLabel
              // required={activitySelect}
              required={false}
              errors={createOrUpdateMomentState?.errors?.momentActivity}
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setActivitySelect(false)}
              >
                Définir l&apos;activité
              </Button>
            </SelectWithOptionsControlled>
          )}
          <InputTextControlled
            label="Objectif"
            name="objectif"
            definedValue={objectifControlled}
            definedOnValueChange={setObjectifControlled}
            description="Indiquez en une phrase le résultat que vous souhaiterez obtenir quand ce moment touchera à sa fin."
            required={false}
            errors={createOrUpdateMomentState?.errors?.momentName}
          />
          <InputSwitchControlled
            label="Indispensable"
            name="indispensable"
            description="Activez l'interrupteur si ce moment est d'une importance incontournable."
            definedValue={indispensable}
            definedOnValueChange={setIndispensable}
            errors={createOrUpdateMomentState?.errors?.momentIsIndispensable}
          />
          <TextareaControlled
            label="Contexte"
            name="contexte"
            definedValue={contexteControlled}
            definedOnValueChange={setContexteControlled}
            description="Expliquez ce qui a motivé ce moment et pourquoi il est nécessaire."
            rows={6}
            required={false}
            errors={createOrUpdateMomentState?.errors?.momentDescription}
          />
          <InputDatetimeLocalControlled
            label="Date et heure"
            name="dateetheure"
            description="Déterminez la date et l'heure auxquelles ce moment doit débuter."
            definedValue={startMomentDate}
            definedOnValueChange={setStartMomentDate}
            // min={dateToInputDatetime(
            //   roundToNearestHours(sub(now, { hours: 1 }), {
            //     roundingMethod: "floor",
            //   }),
            // )}
            errors={createOrUpdateMomentState?.errors?.momentStartDateAndTime}
          />
        </Section>
        <Divider />
        <Section
          title="Ses étapes"
          description="Établissez une par une les étapes du déroulé de votre moment, de la manière la plus segmentée que vous désirez."
          id="ses-etapes"
          error={createOrUpdateMomentState?.stepsMessage}
          subError={createOrUpdateMomentState?.stepsSubMessage}
        >
          {steps.length > 0 && (
            <Reorder.Group axis="y" values={steps} onReorder={setSteps} as="ol">
              {steps.map((step, index) => {
                const map: Map<number, number> = new Map();
                let durationTotal = 0;
                for (let j = 0; j < steps.length; j++) {
                  durationTotal += +steps[j].duree;
                  map.set(j, durationTotal);
                }

                let addingTime = index === 0 ? 0 : map.get(index - 1)!; // I know what I'm doing for now.
                // And with this, I can even compute "endTime" if I want: startMomentDate + map.get(index)

                return (
                  <ReorderItem
                    step={step}
                    index={index}
                    steps={steps}
                    stepVisible={stepVisible}
                    currentStepId={currentStepId}
                    setCurrentStepId={setCurrentStepId}
                    setStepVisible={setStepVisible}
                    startMomentDate={startMomentDate}
                    addingTime={addingTime}
                    setSteps={setSteps}
                    key={step.id}
                    isUpdateStepPending={isUpdateStepPending}
                    intitule={intituleUpdateControlled}
                    details={detailsUpdateControlled}
                    duree={dureeUpdateControlled}
                    setIntitule={setIntituleUpdateControlled}
                    setDetails={setDetailsUpdateControlled}
                    setDuree={setDureeUpdateControlled}
                    createOrUpdateMomentState={createOrUpdateMomentState}
                  />
                );
              })}
            </Reorder.Group>
          )}
          {steps.length > 0 && (
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
                    {format(endMomentDate, "HH:mm")}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-blue-950">Durée totale</p>
                  <p className="font-semibold">
                    <span className="font-medium text-neutral-800">de </span>
                    {numStringToTimeString(overallAddingTime.toString())}
                  </p>
                </div>
              </div>
            </>
          )}
          {stepVisible === "creating" && (
            // was a form, but forms can't be nested
            <div className="flex flex-col gap-y-8">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
                  Ajouter une étape
                </p>{" "}
                <Button
                  form="step-form-creating"
                  type="reset"
                  variant="destroy-step"
                >
                  Réinitialiser l&apos;étape
                </Button>
              </div>
              <InputTextControlled
                form="step-form-creating"
                label="Intitulé de l'étape"
                name="intituledeleetape"
                definedValue={intituleCreateControlled}
                definedOnValueChange={setIntituleCreateControlled}
                description="Définissez simplement le sujet de l'étape."
                errors={createOrUpdateMomentState?.errors?.stepName}
              />
              <TextareaControlled
                form="step-form-creating"
                label="Détails de l'étape"
                name="detailsdeleetape"
                definedValue={detailsCreateControlled}
                definedOnValueChange={setDetailsCreateControlled}
                description="Expliquez en détails le déroulé de l'étape."
                rows={4}
                errors={createOrUpdateMomentState?.errors?.stepDescription}
              />
              <InputNumberControlled
                form="step-form-creating"
                label="Durée de l'étape"
                name="dureedeletape"
                description="Renseignez en minutes la longueur de l'étape."
                definedValue={dureeCreateControlled}
                definedOnValueChange={setDureeCreateControlled}
                min="5"
                errors={createOrUpdateMomentState?.errors?.trueStepDuration}
              />
              <div className="flex">
                {/* Mobile */}
                <div className="flex w-full flex-col gap-4 md:hidden">
                  <Button
                    variant="confirm-step"
                    form="step-form-creating"
                    type="submit"
                    disabled={isCreateStepPending}
                  >
                    Confirmer l&apos;étape
                  </Button>
                  <Button
                    variant="cancel-step"
                    form="step-form-creating"
                    type="button"
                    onClick={() => setStepVisible("create")}
                    disabled={steps.length === 0}
                  >
                    Annuler l&apos;étape
                  </Button>
                </div>
                {/* Desktop */}
                <div className="hidden pt-2 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
                  <Button
                    variant="cancel-step"
                    form="step-form-creating"
                    type="button"
                    onClick={() => setStepVisible("create")}
                    disabled={steps.length === 0}
                  >
                    Annuler l&apos;étape
                  </Button>
                  <Button
                    variant="confirm-step"
                    form="step-form-creating"
                    type="submit"
                    disabled={isCreateStepPending}
                  >
                    Confirmer l&apos;étape
                  </Button>
                </div>
              </div>
            </div>
          )}
          {stepVisible === "create" && (
            <Button
              type="button"
              variant="neutral"
              onClick={() => {
                setStepVisible("creating");
              }}
            >
              Ajouter une étape
            </Button>
          )}
        </Section>
        <Divider />
        <Section>
          {/* Doubling up instead of reverse for accessibility */}
          <div className="flex">
            {/* Mobile */}
            <div className="flex w-full flex-col gap-4 md:hidden">
              <Button
                type="submit"
                variant="confirm"
                disabled={
                  isResetMomentFormPending ||
                  isDeleteMomentPending ||
                  isCreateOrUpdateMomentPending
                }
              >
                Confirmer le moment
              </Button>
              {variant === "creating" && (
                <Button
                  type="reset"
                  variant="cancel"
                  disabled={isResetMomentFormPending}
                >
                  Réinitialiser le moment
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={deleteMomentAction}
                  variant="cancel"
                  disabled={isDeleteMomentPending}
                >
                  Effacer le moment
                </Button>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              {variant === "creating" && (
                <Button
                  type="reset"
                  variant="cancel"
                  disabled={isResetMomentFormPending}
                >
                  Réinitialiser le moment
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={deleteMomentAction}
                  variant="cancel"
                  disabled={isDeleteMomentPending}
                >
                  Effacer le moment
                </Button>
              )}
              <Button
                type="submit"
                variant="confirm"
                disabled={
                  isResetMomentFormPending ||
                  isDeleteMomentPending ||
                  isCreateOrUpdateMomentPending
                }
              >
                Confirmer le moment
              </Button>
            </div>
          </div>
        </Section>
      </form>
    </>
  );
}

// Main Supporting Components

function StepForm({
  variant,
  currentStepId,
  steps,
  setSteps,
  setStepVisible,
  intitule,
  details,
  duree,
  setIntitule,
  setDetails,
  setDuree,
  startCreateOrUpdateStepTransition,
  createOrUpdateMomentState,
  setCreateOrUpdateMomentState,
}: {
  variant: "creating" | "updating";
  currentStepId: string;
  steps: StepFromCRUD[];
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>;
  setStepVisible: Dispatch<SetStateAction<StepVisible>>;
  intitule: string;
  details: string;
  duree: string;
  setIntitule: Dispatch<SetStateAction<string>>;
  setDetails: Dispatch<SetStateAction<string>>;
  setDuree: Dispatch<SetStateAction<string>>;
  startCreateOrUpdateStepTransition: TransitionStartFunction;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
  setCreateOrUpdateMomentState: Dispatch<
    SetStateAction<CreateOrUpdateMomentState>
  >;
}) {
  let ids = {
    creating: "step-form-creating",
    updating: "step-form-updating",
  };

  // createStepAction

  // It's the sole circumstance where I'm OK with this using the formData since I don't do server-side validations here. // (Actually... No.) :')
  // A next thought could be on thinking about how client-side errors could be surfaced since the form is on its own. Simple. Instantiate the state and the setState in the parent component that needs it, and pass them here as prop (just the setState maybe) to StepForm to be used in returns from createStepAction. // DONE.
  // But then that means I'm also going to have to do away with the formData when that happens, and use controlled inputs so that they don't get reset when there's an error. Which also means a parent component where the "true nested form" lives will have to follow these states and pass them to StepForm to be somehow bound to a createStep above... But since it's all in the client, bind won't be needed and the states will be directly accessible from the action below. // DONE.
  // Bonus: If isCreateStepPending is needed, that too will need to be instantiated in the parent component where the "true nested form" lives, with startCreateStepTransition passed as props here to create the action below. // DONE.
  const createOrUpdateStepAction = () => {
    startCreateOrUpdateStepTransition(() => {
      // test
      // return setCreateOrUpdateStepState({ message: "It works though." });
      // It does. But the formData goes away again. :')
      // Works both for create and update separately.

      if (
        typeof intitule !== "string" ||
        typeof details !== "string" // ||
        // typeof +duree !== "number" // number verified in zod
      )
        return setCreateOrUpdateMomentState({
          stepsMessage: "Erreur sur le renseignement étapes du formulaire.",
          stepsSubMessage:
            "(Si vous voyez ce message, cela signifie que la cause est sûrement hors de votre contrôle.)",
        });

      const [trimmedIntitule, trimmedDetails] = [intitule, details].map((e) =>
        e.trim(),
      );

      const numberedDuree = +duree;

      const validatedFields = CreateOrUpdateStepSchema.safeParse({
        stepName: trimmedIntitule,
        stepDescription: trimmedDetails,
        trueStepDuration: numberedDuree,
      });

      if (!validatedFields.success) {
        return setCreateOrUpdateMomentState({
          stepsMessage: DEFAULT_STEP_MESSAGE,
          stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
          errors: validatedFields.error.flatten().fieldErrors,
        });
      }

      const { stepName, stepDescription, trueStepDuration } =
        validatedFields.data;

      const stepsIntitules = steps.map((e) => e.intitule);
      const stepsDetails = steps.map((e) => e.details);

      if (stepsIntitules.includes(stepName)) {
        return setCreateOrUpdateMomentState({
          stepsMessage: DEFAULT_STEP_MESSAGE,
          stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
          errors: {
            stepName: [
              "Vous ne pouvez pas créer deux étapes du même nom sur le même moment.",
            ],
          },
        });
      }
      if (stepsDetails.includes(stepDescription)) {
        return setCreateOrUpdateMomentState({
          stepsMessage: DEFAULT_STEP_MESSAGE,
          stepsSubMessage: DEFAULT_STEP_SUBMESSAGE,
          errors: {
            stepDescription: [
              "Vous ne pouvez pas vraiment créer deux étapes avec les mêmes détails sur le même moment.",
            ],
          },
        });
      }

      intitule = stepName;
      details = stepDescription;
      duree = trueStepDuration.toString();

      let id = "";
      if (variant === "creating") id = window.crypto.randomUUID();
      if (variant === "updating") id = currentStepId;

      const step = {
        id,
        intitule,
        details,
        duree,
      };

      let newSteps: StepFromCRUD[] = [];
      if (variant === "creating") newSteps = [...steps, step];
      if (variant === "updating")
        newSteps = steps.map((e) => {
          if (e.id === currentStepId) return step;
          else return e;
        });

      setSteps(newSteps);
      setStepVisible("create");

      setIntitule("");
      setDetails("");
      setDuree("10");

      setIsCreateOrUpdateStepDone(true);
    });
  };

  const [isCreateOrUpdateStepDone, setIsCreateOrUpdateStepDone] =
    useState(false);

  useEffect(() => {
    if (isCreateOrUpdateStepDone) {
      const newState = {
        ...createOrUpdateMomentState,
        stepsMessage: undefined,
        stepsSubMessage: undefined,
        errors: {
          stepName: undefined,
          stepDescription: undefined,
          trueStepDuration: undefined,
        },
      };
      setCreateOrUpdateMomentState(newState);
    }
    setIsCreateOrUpdateStepDone(false);

    const sesEtapes = document.getElementById("ses-etapes");
    return sesEtapes?.scrollIntoView({ behavior: "smooth" });
    // }
  }, [isCreateOrUpdateStepDone]); // Imagine now doing all this with dedicated animations.

  return <form id={ids[variant]} action={createOrUpdateStepAction}></form>;
}

function ReorderItem({
  step,
  index,
  steps,
  stepVisible,
  currentStepId,
  setCurrentStepId,
  setStepVisible,
  startMomentDate,
  addingTime,
  setSteps,
  isUpdateStepPending,
  intitule,
  details,
  duree,
  setIntitule,
  setDetails,
  setDuree,
  createOrUpdateMomentState,
}: {
  step: StepFromCRUD;
  index: number;
  steps: StepFromCRUD[];
  stepVisible: StepVisible;
  currentStepId: string;
  setCurrentStepId: Dispatch<SetStateAction<string>>;
  setStepVisible: Dispatch<SetStateAction<StepVisible>>;
  startMomentDate: string;
  addingTime: number;
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>;
  isUpdateStepPending: boolean;
  intitule: string;
  details: string;
  duree: string;
  setIntitule: Dispatch<SetStateAction<string>>;
  setDetails: Dispatch<SetStateAction<string>>;
  setDuree: Dispatch<SetStateAction<string>>;
  createOrUpdateMomentState: CreateOrUpdateMomentState;
}) {
  const controls = useDragControls();

  // deleteStepAction

  const [isDeleteStepPending, startDeleteStepTransition] = useTransition();

  const deleteStepAction = () => {
    if (
      confirm(
        "Êtes-vous sûr que vous voulez effacer cette étape ? (Cela ne sera véritablement pris en compte qui si vous confirmez ce moment. Retourner au préalable sur Vos moments ignorera cette effacement.)",
      )
    ) {
      startDeleteStepTransition(() => {
        let newSteps = steps.filter((step) => step.id !== currentStepId);
        setSteps(newSteps);
        if (newSteps.length === 0) setStepVisible("creating");
        else setStepVisible("create");
      });
    }
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
          index !== steps.length - 1 && "pb-8",
        )}
      >
        <div className="flex select-none items-baseline justify-between">
          <p
            className={clsx(
              "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
              "transition-colors hover:text-neutral-400",
            )}
            onPointerDown={(event) => controls.start(event)}
            style={{ touchAction: "none" }}
          >
            Étape <span>{toWordsing(index + 1)}</span>
          </p>{" "}
          {stepVisible === "updating" && currentStepId === step.id ? (
            <Button
              form="step-form-updating"
              type="button"
              variant="destroy-step"
              onClick={() => setStepVisible("create")}
            >
              Restaurer l&apos;étape
            </Button>
          ) : (
            <Button
              variant="destroy-step"
              type="button"
              // since this is a selection of setStates and as a would-be action it would only be used once, there's no imperative need to make an action here
              // ...but, if I want to "secure" ever single one of my buttons with isPending, I'd need all of them to be actions
              // ...which is overkill, and would require so many action names, and would confuse people reading the code.
              onClick={() => {
                setCurrentStepId(step.id);

                setIntitule(step.intitule);
                setDetails(step.details);
                setDuree(step.duree);

                setStepVisible("updating");
              }}
            >
              Modifier cette étape
            </Button>
          )}
        </div>
        {stepVisible === "updating" && currentStepId === step.id ? (
          <div className="flex flex-col gap-y-8">
            <InputTextControlled
              form="step-form-updating"
              label="Intitulé de l'étape"
              name="intituledeleetape"
              definedValue={intitule}
              definedOnValueChange={setIntitule}
              description="Définissez simplement le sujet de l'étape."
              // only because there is maximum one form open at all times
              // the buttons that change the forms will also have to reset the step errors on createOrUpdateMomentState
              errors={createOrUpdateMomentState?.errors?.stepName}
            />
            <TextareaControlled
              form="step-form-updating"
              label="Détails de l'étape"
              name="detailsdeleetape"
              definedValue={details}
              definedOnValueChange={setDetails}
              description="Expliquez en détails le déroulé de l'étape."
              rows={4}
              errors={createOrUpdateMomentState?.errors?.stepDescription}
            />
            <InputNumberControlled
              form="step-form-updating"
              label="Durée de l'étape"
              name="dureedeletape"
              definedValue={duree}
              definedOnValueChange={setDuree}
              description="Renseignez en minutes la longueur de l'étape."
              min="5"
              errors={createOrUpdateMomentState?.errors?.trueStepDuration}
            />
            <div className="flex">
              {/* Mobile */}
              <div className="flex w-full flex-col gap-4 md:hidden">
                <Button
                  form="step-form-updating"
                  type="submit"
                  variant="confirm-step"
                  disabled={isUpdateStepPending}
                >
                  Actualiser l&apos;étape
                </Button>
                <Button
                  form="step-form-updating"
                  type="button"
                  onClick={deleteStepAction}
                  variant="cancel-step"
                  disabled={isDeleteStepPending}
                >
                  Effacer l&apos;étape
                </Button>
              </div>
              {/* Desktop */}
              <div className="hidden pt-2 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
                <Button
                  form="step-form-updating"
                  type="button"
                  onClick={deleteStepAction}
                  variant="cancel-step"
                  disabled={isDeleteStepPending}
                >
                  Effacer l&apos;étape
                </Button>
                <Button
                  form="step-form-updating"
                  type="submit"
                  variant="confirm-step"
                  disabled={isUpdateStepPending}
                >
                  Actualiser l&apos;étape
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="font-medium text-blue-950">{step.intitule}</p>
              <p>
                <span
                  className={clsx(
                    index === 0 && "font-semibold text-neutral-800",
                  )}
                >
                  {format(
                    add(startMomentDate, {
                      minutes: addingTime,
                    }),
                    "HH:mm",
                  )}
                </span>
                <> • </>
                {numStringToTimeString(step.duree)}
              </p>
              <p className="text-sm text-neutral-500">{step.details}</p>
            </div>
          </>
        )}
      </div>
    </Reorder.Item>
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
*/
