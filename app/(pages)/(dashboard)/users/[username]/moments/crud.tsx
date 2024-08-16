"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import {
  add,
  format,
  roundToNearestHours,
  roundToNearestMinutes,
  sub,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Reorder, useDragControls } from "framer-motion";
import debounce from "debounce";

import { Option } from "@/app/types/general";
import {
  UserMomentsToCRUD,
  MomentToCRUD,
  StepFromCRUD,
} from "@/app/types/moments";
import {
  dateToInputDatetime,
  numStringToTimeString,
  toWordsing,
} from "@/app/utilities/moments";
import {
  Button,
  Divider,
  FieldTitle,
  InputDatetimeLocalControlled,
  InputNumber,
  InputSwitchControlled,
  InputText,
  PageTitle,
  Section,
  SectionWrapper,
  SelectWithOptions,
  Textarea,
} from "../../../components";
import * as Icons from "../icons";

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

// Main Data

type View = "update-moment" | "create-moment" | "read-moments";

type SubView =
  | "all-moments"
  | "past-moments"
  | "current-moments"
  | "future-moments";

type StepVisible = "create" | "creating" | "updating";

const exchangeOptions: Option[] = [
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
  createOrUpdateMoment: any;
  deleteMoment: any;
  revalidateMoments: any;
  now: string;
}) {
  console.log(now);

  let [view, setView] = useState<View>("read-moments");

  let viewTitles = {
    "update-moment": "Éditez",
    "read-moments": "Vos moments",
    "create-moment": "Créez",
  };

  const [_, realPastMoments, realCurrentMoments, realFutureMoments] =
    allUserMomentsToCRUD;

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
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title={viewTitles[view]} />
          {view === "update-moment" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("read-moments")}
            >
              Vos moments
            </Button>
          )}
          {view === "read-moments" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("create-moment")}
            >
              Créez un moment
            </Button>
          )}
          {view === "create-moment" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("read-moments")}
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
            setView={setView}
            destinationOptions={destinationOptions}
            variant="updating"
            moment={moment}
            createOrUpdateMoment={createOrUpdateMoment}
            deleteMoment={deleteMoment}
            // setSubView={setSubView}
            now={now}
          />
        )}
      </div>
      <div className={clsx(view !== "read-moments" && "hidden")}>
        <ReadMomentsView
          allUserMomentsToCRUD={allUserMomentsToCRUD}
          maxPages={maxPages}
          setMoment={setMoment}
          setView={setView}
          subView={subView}
          setSubView={setSubView}
          revalidateMoments={revalidateMoments}
        />
      </div>
      <div className={clsx(view !== "create-moment" && "hidden")}>
        {/* Here, CreateMomentView needs to stay in the DOM in order for the form contents to remain when looking at other moments on ReadMomentsView. But an improvement could be to give variants of MomentForms their own form input names. However, in a real project with a database, revalidate could negate this effort depending on how it is implemented. This will be it for this demo. */}
        {view !== "update-moment" && (
          // CreateMomentView
          <MomentForms
            setView={setView}
            destinationOptions={destinationOptions}
            variant="creating"
            createOrUpdateMoment={createOrUpdateMoment}
            now={now}
            // setSubView={setSubView}
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
  setMoment,
  setView,
  subView,
  setSubView,
  revalidateMoments,
}: {
  allUserMomentsToCRUD: UserMomentsToCRUD[];
  maxPages: number[];
  setMoment: Dispatch<SetStateAction<MomentToCRUD | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
  subView: SubView;
  setSubView: Dispatch<SetStateAction<SubView>>;
  revalidateMoments: any;
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

    if (term) params.set("contains", term);
    else params.delete("contains");

    params.delete("usermomentspage");
    params.delete("pastusermomentspage");
    params.delete("currentusermomentspage");
    params.delete("futureusermomentspage");

    replace(`${pathname}?${params.toString()}`);
  } // https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

  const debouncedHandleSearch = debounce(handleSearch, 500);

  const subViewSearchParams = {
    "all-moments": "usermomentspage",
    "past-moments": "pastusermomentspage",
    "current-moments": "currentusermomentspage",
    "future-moments": "futureusermomentspage",
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

  const params = new URLSearchParams(searchParams);
  let currentPage = +(params.get(subViewSearchParams[subView]) || "1");

  function handlePagination(direction: "left" | "right", subView: SubView) {
    if (direction === "left")
      params.set(
        subViewSearchParams[subView],
        Math.max(1, currentPage - 1).toString(),
      );
    if (direction === "right")
      params.set(
        subViewSearchParams[subView],
        Math.min(subViewMaxPages[subView], currentPage + 1).toString(),
      );

    if (params.get(subViewSearchParams[subView]) === "1")
      params.delete(subViewSearchParams[subView]);

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      {/* -mt-4 to resolve padding from Vos moments */}
      <div
        className={clsx(
          "flex flex-wrap gap-4",
          // "-mt-4",
        )}
      >
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
          // to target the input in form that needs to be reset
          form="form"
          onClick={async (event) => {
            const button = event.currentTarget;
            button.disabled = true;
            await revalidateMoments();
            replace(`${pathname}`);
            button.form!.reset(); // EXACTLY.
            button.disabled = false;
          }}
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
          id="contains"
          name="contains"
          placeholder="Cherchez parmi vos moments..."
          defaultValue={searchParams.get("contains")?.toString()}
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
                <SectionWrapper>
                  <Section
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
                                        realMoments.find(
                                          (e4) => e4.id === e3.id,
                                        ),
                                      );
                                      setView("update-moment");
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
                              <ol>
                                {e3.steps.map((e4) => (
                                  <li
                                    className="list-inside list-disc font-serif font-light leading-loose text-neutral-500"
                                    key={e4.id}
                                  >
                                    <span>
                                      {e4.startDateAndTime.split("T")[1]}
                                    </span>{" "}
                                    - {e4.endDateAndTime.split("T")[1]} :{" "}
                                    {e4.title}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </Section>
                </SectionWrapper>
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
        <SectionWrapper>
          <FieldTitle title={"Pas de moment... pour le moment. 😅"} />
        </SectionWrapper>
      )}
    </div>
  );
}

function MomentForms({
  setView,
  variant,
  moment,
  destinationOptions,
  createOrUpdateMoment,
  deleteMoment,
  // setSubView,
  now,
}: {
  setView: Dispatch<SetStateAction<View>>;
  variant: "creating" | "updating";
  moment?: MomentToCRUD;
  destinationOptions: Option[];
  createOrUpdateMoment: any;
  deleteMoment?: any;
  // setSubView: Dispatch<SetStateAction<SubView>>;
  now: string;
}) {
  // roundToNearestMinutes are nested to create a clamp method, meaning:
  // - the time shown will always be a minimum of 10 minutes later
  // (e.g. if it's 10:59, 11:10 will be shown)
  // - the time shown will always be a maximum of 20 minutes later
  // (e.g. if it's 11:01, 11:20 will be shown)
  // This is to account for the time it will take to fill the form, especially to fill all the steps of the moment at hand.
  const nowRoundedUpTenMinutes = roundToNearestMinutes(
    add(
      roundToNearestMinutes(now, {
        roundingMethod: "ceil",
        nearestTo: 10,
      }),
      { seconds: 1 },
    ),
    {
      roundingMethod: "ceil",
      nearestTo: 10,
    },
  );

  // InputSwitch unfortunately has to be controlled for resetting
  let [indispensable, setIndispensable] = useState(
    moment ? moment.isIndispensable : false,
  );
  // datetime-local input is now controlled.
  let [momentDate, setMomentDate] = useState(
    moment
      ? moment.startDateAndTime
      : format(nowRoundedUpTenMinutes, "yyyy-MM-dd'T'HH:mm"),
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

  let [currentStepId, setCurrentStepId] = useState("");
  let currentStep = steps.find((step) => step.id === currentStepId);

  let [destinationSelect, setDestinationSelect] = useState(false);
  let [activitySelect, setActivitySelect] = useState(false);

  const createOrUpdateMomentBound = createOrUpdateMoment.bind(
    null,
    variant,
    indispensable,
    momentDate,
    steps,
    moment,
  );

  let deleteMomentBound: any;
  if (deleteMoment) deleteMomentBound = deleteMoment.bind(null, moment);

  return (
    <>
      <StepForm
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        variant="creating"
      />
      <StepForm
        currentStepId={currentStepId}
        steps={steps}
        setSteps={setSteps}
        setStepVisible={setStepVisible}
        variant="updating"
      />
      <form
        action={async (formData) => {
          await createOrUpdateMomentBound(formData);

          if (variant === "creating") {
            setIndispensable(false);
            setMomentDate(format(nowRoundedUpTenMinutes, "yyyy-MM-dd'T'HH:mm"));
            setSteps([]);
            setStepVisible("creating");
          }

          setView("read-moments");
          // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
        }}
        onReset={(event) => {
          if (
            confirm(
              "Êtes-vous sûr que vous voulez réinitialiser le formulaire ?",
            )
          ) {
            setIndispensable(false);
            setMomentDate(format(nowRoundedUpTenMinutes, "yyyy-MM-dd'T'HH:mm"));
            setSteps([]);
            setStepVisible("creating");
          } else event.preventDefault();
        }}
        className="space-y-8"
      >
        <Section
          title="Votre moment"
          description="Définissez votre moment de collaboration dans ses moindres détails, de la manière la plus précise que vous pouvez."
        >
          {!destinationSelect ? (
            <InputText
              label="Destination"
              name="destination"
              // controlling the value for SelectWithOptions crossover is something to keep in mind, but for now, default values from preceding moment will only be on InputText components
              defaultValue={moment ? moment.destinationIdeal : undefined}
              description="Votre projet vise à atteindre quel idéal ?"
              addendum={
                destinationOptions.length > 0
                  ? "Ou choissisez parmi vos destinations précédemment instanciées."
                  : undefined
              }
              fieldFlexIsNotLabel
              tekTime
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
          ) : (
            <SelectWithOptions
              label="Destination"
              description="Choisissez la destination que cherche à atteindre ce moment."
              addendum="Ou définissez la vous-même via le bouton ci-dessus."
              name="destination"
              placeholder="Choisissez..."
              options={destinationOptions}
              fieldFlexIsNotLabel
              tekTime
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setDestinationSelect(false)}
              >
                Définir la destination
              </Button>
            </SelectWithOptions>
          )}
          {!activitySelect ? (
            <InputText
              label="Activité"
              description="Définissez le type d'activité qui va correspondre à votre problématique."
              addendum="Ou choissisez parmi une sélection prédéfinie via le bouton ci-dessus."
              name="activite"
              defaultValue={moment ? moment.activity : undefined}
              fieldFlexIsNotLabel
              required={!activitySelect}
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setActivitySelect(true)}
              >
                Choisir l&apos;activité
              </Button>
            </InputText>
          ) : (
            <SelectWithOptions
              label="Activité"
              description="Choisissez le type d'activité qui va correspondre à votre problématique."
              addendum="Ou définissez le vous-même via le bouton ci-dessus."
              name="activite"
              placeholder="Choisissez..."
              options={exchangeOptions}
              fieldFlexIsNotLabel
              required={activitySelect}
            >
              <Button
                type="button"
                variant="destroy"
                onClick={() => setActivitySelect(false)}
              >
                Définir l&apos;activité
              </Button>
            </SelectWithOptions>
          )}
          <InputText
            label="Objectif"
            name="objectif"
            defaultValue={moment ? moment.objective : undefined}
            description="Indiquez en une phrase le résultat que vous souhaiterez obtenir quand ce moment touchera à sa fin."
          />
          <InputSwitchControlled
            label="Indispensable"
            name="indispensable"
            description="Activez l'interrupteur si ce moment est d'une importance incontournable."
            definedValue={indispensable}
            definedOnValueChange={setIndispensable}
          />
          <Textarea
            label="Contexte"
            name="contexte"
            defaultValue={moment ? moment.context : undefined}
            description="Expliquez ce qui a motivé ce moment et pourquoi il est nécessaire."
            rows={6}
          />
          <InputDatetimeLocalControlled
            label="Date et heure"
            name="dateetheure"
            description="Déterminez la date et l'heure auxquelles ce moment doit débuter."
            definedValue={momentDate}
            definedOnValueChange={setMomentDate}
            min={dateToInputDatetime(
              roundToNearestHours(sub(now, { hours: 1 }), {
                roundingMethod: "floor",
              }),
            )}
          />
        </Section>
        <Divider />
        <Section
          title="Ses étapes"
          description="Établissez une par une les étapes du déroulé de votre moment, de la manière la plus segmentée que vous désirez."
          // addendum={`(Vous pouvez réorganiser les étapes par cliquer-déposer en sélectionnant Étape Une, Étape Deux...)`}
          // showAddendum={steps.length >= 1}
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
                // And with this, I can even compute "endTime" if I want: momentDate + map.get(index)

                return (
                  <ReorderItem
                    step={step}
                    index={index}
                    steps={steps}
                    stepVisible={stepVisible}
                    currentStepId={currentStepId}
                    setCurrentStepId={setCurrentStepId}
                    setStepVisible={setStepVisible}
                    momentDate={momentDate}
                    addingTime={addingTime}
                    currentStep={currentStep}
                    setSteps={setSteps}
                    key={step.id}
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
                    {format(
                      add(momentDate, {
                        minutes: overallAddingTime,
                      }),
                      "HH:mm",
                    )}
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
              {/* manually fixing that padding... */}
              <div className="-mt-1.5">
                <InputText
                  form="step-form-creating"
                  label="Intitulé de l'étape"
                  name="intituledeleetape"
                  description="Définissez simplement le sujet de l'étape."
                />
              </div>
              <Textarea
                form="step-form-creating"
                label="Détails de l'étape"
                name="detailsdeleetape"
                description="Expliquez en détails le déroulé de l'étape."
                rows={4}
              />
              <InputNumber
                form="step-form-creating"
                label="Durée de l'étape"
                name="dureedeletape"
                description="Renseignez en minutes la longueur de l'étape."
                defaultValue="10"
                min="5"
              />
              <div className="flex">
                {/* Mobile */}
                <div className="flex w-full flex-col gap-4 md:hidden">
                  <Button
                    form="step-form-creating"
                    type="submit"
                    variant="confirm-step"
                  >
                    Confirmer l&apos;étape
                  </Button>
                  <Button
                    form="step-form-creating"
                    type="button"
                    onClick={() => setStepVisible("create")}
                    disabled={steps.length === 0}
                    variant="cancel-step"
                  >
                    Annuler l&apos;étape
                  </Button>
                </div>
                {/* Desktop */}
                {/* There's a slight py issue here handled by hand */}
                <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
                  <Button
                    form="step-form-creating"
                    type="button"
                    onClick={() => setStepVisible("create")}
                    disabled={steps.length === 0}
                    variant="cancel-step"
                  >
                    Annuler l&apos;étape
                  </Button>
                  <Button
                    form="step-form-creating"
                    type="submit"
                    variant="confirm-step"
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
                disabled={steps.length === 0}
              >
                Confirmer le moment
              </Button>
              {/* this could eventually be a component too */}
              {variant === "creating" && (
                <Button type="reset" variant="cancel">
                  Réinitialiser le moment
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={async () => {
                    if (!moment)
                      return console.error("Somehow a moment was not found.");

                    if (
                      confirm(
                        "Êtes-vous sûr que vous voulez effacer ce moment ?",
                      )
                    ) {
                      if (deleteMomentBound) await deleteMomentBound();
                      else
                        return console.error(
                          "Somehow deleteMomentBound was not a thing.",
                        );

                      setView("read-moments");
                    }
                  }}
                  variant="cancel"
                >
                  Effacer le moment
                </Button>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              {variant === "creating" && (
                <Button type="reset" variant="cancel">
                  Réinitialiser le moment
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={async () => {
                    if (!moment)
                      return console.error("Somehow a moment was not found.");

                    if (
                      confirm(
                        "Êtes-vous sûr que vous voulez effacer ce moment ?",
                      )
                    ) {
                      if (deleteMomentBound) await deleteMomentBound();
                      else
                        return console.error(
                          "Somehow deleteMomentBound was not a thing.",
                        );

                      setView("read-moments");
                    }
                  }}
                  variant="cancel"
                >
                  Effacer le moment
                </Button>
              )}
              <Button
                type="submit"
                variant="confirm"
                disabled={steps.length === 0}
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
  currentStepId,
  steps,
  setSteps,
  setStepVisible,
  variant,
}: {
  currentStepId: string;
  steps: StepFromCRUD[];
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>;
  setStepVisible: Dispatch<SetStateAction<StepVisible>>;
  variant: "creating" | "updating";
}) {
  let ids = {
    creating: "step-form-creating",
    updating: "step-form-updating",
  };

  return (
    <form
      id={ids[variant]}
      action={(formData: FormData) => {
        let intitule = formData.get("intituledeleetape");
        let details = formData.get("detailsdeleetape");
        let duree = formData.get("dureedeletape");

        if (
          typeof intitule !== "string" ||
          typeof details !== "string" ||
          typeof duree !== "string"
        )
          return console.error(
            "Le formulaire de l'étape n'a pas été correctement renseigné.",
          );

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
      }}
    ></form>
  );
}

function ReorderItem({
  step,
  index,
  steps,
  stepVisible,
  currentStepId,
  setCurrentStepId,
  setStepVisible,
  momentDate,
  addingTime,
  currentStep,
  setSteps,
}: {
  step: StepFromCRUD;
  index: number;
  steps: StepFromCRUD[];
  stepVisible: StepVisible;
  currentStepId: string;
  setCurrentStepId: Dispatch<SetStateAction<string>>;
  setStepVisible: Dispatch<SetStateAction<StepVisible>>;
  momentDate: string;
  addingTime: number;
  currentStep: StepFromCRUD | undefined;
  setSteps: Dispatch<SetStateAction<StepFromCRUD[]>>;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      transition={{ layout: { duration: 0 } }}
      // layout="position" // or ""preserve-aspect""
      dragTransition={{
        bounceStiffness: 900,
        bounceDamping: 30,
      }}
      // whileDrag={{ opacity: 0.5 }}
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
              onClick={() => {
                setCurrentStepId(step.id);
                setStepVisible("updating");
              }}
            >
              Modifier cette étape
            </Button>
          )}
        </div>
        {stepVisible === "updating" && currentStepId === step.id ? (
          <div className="flex flex-col gap-y-8">
            {/* manually fixing that padding... */}
            <div className="-mt-1.5">
              <InputText
                form="step-form-updating"
                label="Intitulé de l'étape"
                name="intituledeleetape"
                defaultValue={currentStep?.intitule}
                description="Définissez simplement le sujet de l'étape."
              />
            </div>
            <Textarea
              form="step-form-updating"
              label="Détails de l'étape"
              name="detailsdeleetape"
              defaultValue={currentStep?.details}
              description="Expliquez en détails le déroulé de l'étape."
              rows={4}
            />
            <InputNumber
              form="step-form-updating"
              label="Durée de l'étape"
              name="dureedeletape"
              defaultValue={currentStep?.duree}
              description="Renseignez en minutes la longueur de l'étape."
              min="5"
            />
            <div className="flex">
              {/* Mobile */}
              <div className="flex w-full flex-col gap-4 md:hidden">
                <Button
                  form="step-form-updating"
                  type="submit"
                  variant="confirm-step"
                >
                  Actualiser l&apos;étape
                </Button>
                <Button
                  form="step-form-updating"
                  type="submit"
                  formAction={() => {
                    let newSteps = steps.filter(
                      (step) => step.id !== currentStepId,
                    );
                    setSteps(newSteps);
                    if (newSteps.length === 0) setStepVisible("creating");
                    else setStepVisible("create");
                  }}
                  variant="cancel-step"
                >
                  Effacer l&apos;étape
                </Button>
              </div>
              {/* Desktop */}
              {/* There's a slight py issue here handled by hand */}
              <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
                <Button
                  form="step-form-updating"
                  type="submit"
                  formAction={() => {
                    let newSteps = steps.filter(
                      (step) => step.id !== currentStepId,
                    );
                    setSteps(newSteps);
                    if (newSteps.length === 0) setStepVisible("creating");
                    else setStepVisible("create");
                  }}
                  variant="cancel-step"
                >
                  Effacer l&apos;étape
                </Button>
                <Button
                  form="step-form-updating"
                  type="submit"
                  variant="confirm-step"
                >
                  Actualiser l&apos;étape
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* manually fixing that padding... */}
            <div className="-mt-1.5 space-y-2">
              <p className="font-medium text-blue-950">{step.intitule}</p>
              <p>
                <span
                  className={clsx(
                    index === 0 && "font-semibold text-neutral-800",
                  )}
                >
                  {format(
                    add(momentDate, {
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
Based out of /complex-form-after.
Sincerely, for now, my work is on this file and not on the former, as if they are two different projets altogether. It's only once I'm sufficiently done here that I shall adapt the advancements made here on complex-form-after, if needed.
The flow is not competely stable. I'll work on it tomorrow. 
Keeping it here if I even allow only one minute.
{overallAddingTime >= 60 && (
  <>
    de {Math.floor(overallAddingTime / 60)} h{" "}
    {overallAddingTime % 60 !== 0 && (
      <>
        et {overallAddingTime % 60}{" "}
        {overallAddingTime % 60 === 1 ? (
          <>minute</>
        ) : (
          <>minutes</>
        )}
      </>
    )}
  </>
)}
Shifting inputs on Destination will have to wait when the full flow of creating a moment will be made.
No longer in use since submitting on Enter is not prevented all around:
// forcing with "!" because AFAIK there will always be a form.
// event.currentTarget.form!.requestSubmit();
Required supercedes display none. After all required is HTML, while display-none is CSS.
PREVIOUS CODE
// console.log({ momentDate });
// console.log({ now });
// This should sleep for now. The now I send is stuck to prevent timezone issues, so that's why it gets things messy.
// if (compareDesc(momentDate, now) === 1) setSubView("past-moments");
// else if (compareAsc(momentDate, now) === 1)
//   setSubView("future-moments");
// else setSubView("current-moments");
*/
