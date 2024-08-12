"use client";

import { Dispatch, SetStateAction, useState } from "react";

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import {
  add,
  compareAsc,
  compareDesc,
  format,
  roundToNearestMinutes,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Reorder, useDragControls } from "framer-motion";

import { numStringToTimeString, toWordsing } from "@/app/utilities/moments";
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
  SelectWithOptions,
  Textarea,
} from "../../../components";

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

type StepForCRUD = {
  id: string;
  orderId: number;
  title: string;
  details: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
};

type MomentForCRUD = {
  id: string;
  activity: string;
  objective: string;
  isIndispensable: boolean;
  context: string;
  startDateAndTime: string;
  duration: string;
  endDateAndTime: string;
  steps: StepForCRUD[];
};

type MomentsDestinationForCRUD = {
  destinationIdeal: string;
  moments: MomentForCRUD[];
};

type MomentsDateForCRUD = {
  date: string;
  destinations: MomentsDestinationForCRUD[];
};

type UserMomentsForCRUD = {
  dates: MomentsDateForCRUD[];
};

type Step = {
  id: number;
  intitule: string;
  details: string;
  duree: string;
  dateetheure?: string; // calculated
  findateetheure?: string; // calculated
};

type StepVisible = "create" | "creating" | "updating";

type Moment = {
  id: string;
  destination: string;
  activite: string;
  objectif: string;
  indispensable: boolean;
  contexte: string;
  dateetheure: string;
  etapes: Step[];
  duree: string; // calculated
  findateetheure: string; // calculated
};

type Option = {
  key: number;
  label: string;
  value: string;
};

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
  momentsToCRUD,
  allUserMomentsForCRUD,
  createOrUpdateMoment,
  deleteMoment,
  now,
}: {
  momentsToCRUD: Moment[];
  allUserMomentsForCRUD: UserMomentsForCRUD[];
  createOrUpdateMoment: any;
  deleteMoment: any;
  now: string;
}) {
  console.log(now);

  let [view, setView] = useState<View>("read-moments");

  let viewTitles = {
    "update-moment": "Modifiez votre moment",
    "read-moments": "Vos moments",
    "create-moment": "Créez un moment",
  };

  // ! Pour pouvoir déterminer la subView dynamiquement, il me faudra segmenter mes moments en amont depuis le serveur. (En vrai il faut juste y copier le code.)
  const [subView, setSubView] = useState<SubView>("current-moments");

  // for UpdateMomentView
  let [moment, setMoment] = useState<Moment>();

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
        <Divider />
      </div>
      {/* For now create and update views need to be removed from the DOM opposingly, but eventually I have to give them respective form names. Same needs to be considered for destination and activite, but the solution used here for now is satisfactory. */}
      <div className={clsx(view !== "update-moment" && "hidden")}>
        {/* Here, UpdateMomentView needs to be unmounted on ReadMomentsView to be reinstantiated with the correct defaults */}
        {view === "update-moment" && (
          // UpdateMomentView
          <MomentForms
            setView={setView}
            moments={momentsToCRUD}
            variant="updating"
            moment={moment}
            createOrUpdateMoment={createOrUpdateMoment}
            deleteMoment={deleteMoment}
            setSubView={setSubView}
            now={now}
          />
        )}
      </div>
      <div className={clsx(view !== "read-moments" && "hidden")}>
        <ReadMomentsView
          moments={momentsToCRUD}
          allUserMomentsForCRUD={allUserMomentsForCRUD}
          setMoment={setMoment}
          setView={setView}
          subView={subView}
          setSubView={setSubView}
          // now={now}
        />
      </div>
      <div className={clsx(view !== "create-moment" && "hidden")}>
        {/* Here, CreateMomentView needs to stay in the DOM in order for the form contents to remain when looking at other moments on ReadMomentsView. But an improvement could be to give variants of MomentForms their own form input names. However, in a real project with a database, revalidate could negate this effort depending on how it is implemented. This will be it for this demo. */}
        {view !== "update-moment" && (
          // CreateMomentView
          <MomentForms
            setView={setView}
            moments={momentsToCRUD}
            variant="creating"
            createOrUpdateMoment={createOrUpdateMoment}
            now={now}
            setSubView={setSubView}
          />
        )}
      </div>
    </>
  );
}

// Main Leading Components

function ReadMomentsView({
  moments,
  allUserMomentsForCRUD,
  setMoment,
  setView,
  subView,
  setSubView,
  // now,
}: {
  moments: Moment[];
  allUserMomentsForCRUD: UserMomentsForCRUD[];
  setMoment: Dispatch<SetStateAction<Moment | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
  subView: SubView;
  setSubView: Dispatch<SetStateAction<SubView>>;
  // now: string;
}) {
  let subViewTitles = {
    "all-moments": "Tous",
    "past-moments": "Passés",
    "current-moments": "Actuels",
    "future-moments": "Futurs",
  };

  // ...
  // A take (LIMIT) is going to be needed at scale. So each operation for past, present and future is going to be needed to be had from the database.
  // But so since it's from the database, that means the database will have to save when the moment ends... Or that can––
  // (The first thought was nice, but think about the cases where you are not senior enough to do a migration, and where even if that was the case you wouldn't be able to retroactively modify all previous entries, and even if you could your boss may not approve of you making such a dramatic implementation... for something that can be finetuned, for now, on the client, and can also be less error-prone doing so.)
  // ...This is really something worth discussing.
  // The real problem is, what I'm afraid of would make sense on an app that is in production, but it wouldn't in an app that is being constructed, where I would still have the chance at time to change this proactively forever. Except... I really, REALLY don't want to put hardcoded in my database anything that can be inferred, and that's my position until some performance issues make it obligatory.
  // Basically, the idea is to yes, get all moments on top, but with the minimum amount of data from them. The most minimum. Then I filter and treat them in the client with JavaScript. And eventually I'll have some server components in the lists that will each go look for the extra data that is being needed.
  // SO LET'S GO.

  // let pastMoments: Moment[] = [];
  // let currentMoments: Moment[] = [];
  // let futureMoments: Moment[] = [];

  // moments.forEach((e) => {
  //   // if the end of the moment came before now
  //   if (compareDesc(e.findateetheure, now) === 1) pastMoments.push(e);
  //   // if the beginning of the moment comes after now
  //   else if (compareAsc(e.dateetheure, now) == 1) futureMoments.push(e);
  //   // any of the situation is within the scope of now
  //   else currentMoments.push(e);
  // });

  // let allMoments = [moments, pastMoments, currentMoments, futureMoments];

  // let allMomentsDates = [
  //   moments,
  //   pastMoments,
  //   currentMoments,
  //   futureMoments,
  // ].map((e0) =>
  //   [...new Set(e0.map((moment) => moment.dateetheure.split("T")[0]))].sort(),
  // );

  // let allMomentsDatesWithMoments = allMomentsDates.map((e0, i0) =>
  //   e0.map((e) => {
  //     let momentsDateMoments = allMoments[i0].filter((e2) =>
  //       e2.dateetheure.startsWith(e),
  //     );
  //     return { date: e, moments: momentsDateMoments };
  //   }),
  // );

  // let allMomentsDatesWithMomentsByDestinations = allMomentsDatesWithMoments.map(
  //   (e0) =>
  //     e0.map((e) => {
  //       return {
  //         date: e.date,
  //         destinations: [
  //           ...new Set(e.moments.map((e2) => e2.destination)),
  //         ].sort((a, b) => {
  //           const destinationA = a.toLowerCase();
  //           const destinationB = b.toLowerCase();
  //           if (destinationA < destinationB) return -1;
  //           if (destinationA > destinationB) return 1;
  //           return 0;
  //           // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sorting_array_of_objects
  //         }),
  //       };
  //     }),
  // );

  // let allTrueMomentsDatesWithMomentsByDestinations =
  //   allMomentsDatesWithMomentsByDestinations.map((e0, i0) =>
  //     e0.map((e) => {
  //       return {
  //         date: e.date,
  //         destinations: e.destinations.map((e2) => {
  //           let theseMoments = allMoments[i0]
  //             .filter((e3) => {
  //               return (
  //                 e3.destination === e2 && e3.dateetheure.startsWith(e.date)
  //               );
  //             })
  //             .sort((a, b) => {
  //               const dateA = a.dateetheure;
  //               const dateB = b.dateetheure;
  //               if (dateA < dateB) return -1;
  //               if (dateA > dateB) return 1;
  //               return 0;
  //             });
  //           return {
  //             destination: e2,
  //             moments: theseMoments,
  //           };
  //         }),
  //       };
  //     }),
  //   );

  // const [
  //   trueMomentsDatesWithMomentsByDestinations,
  //   truePastMoments,
  //   trueCurrentMoments,
  //   trueFutureMoments,
  // ] = allTrueMomentsDatesWithMomentsByDestinations;

  // const showcaseMoments = {
  //   "past-moments": truePastMoments,
  //   "current-moments": trueCurrentMoments,
  //   "future-moments": trueFutureMoments,
  // };

  //

  const [
    realAllMoments,
    realPastMoments,
    realCurrentMoments,
    realFutureMoments,
  ] = allUserMomentsForCRUD;

  const realShowcaseMoments = {
    "all-moments": realAllMoments,
    "past-moments": realPastMoments,
    "current-moments": realCurrentMoments,
    "future-moments": realFutureMoments,
  };

  //

  const subViews = [
    "all-moments",
    "past-moments",
    "current-moments",
    "future-moments",
  ] as const;

  // let displayedMoments = trueMomentsDatesWithMomentsByDestinations;
  // if (subView !== undefined && subViews.includes(subView))
  //   displayedMoments = showcaseMoments[subView];

  //

  let realDisplayedMoments = realAllMoments.dates;
  if (subView !== undefined && subViews.includes(subView))
    realDisplayedMoments = realShowcaseMoments[subView].dates;

  let realMoments: MomentForCRUD[] = [];
  realDisplayedMoments.forEach((e) =>
    e.destinations.forEach((e2) =>
      e2.moments.forEach((e3) => realMoments.push(e3)),
    ),
  );

  //

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        {subViews.map((e) => {
          const className = "px-4 py-2";
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
      </div>
      {realDisplayedMoments.length > 0 ? (
        <>
          {realDisplayedMoments.map((e, i, a) => (
            <div className="space-y-8" key={e.date}>
              <Section
                title={format(new Date(e.date), "eeee d MMMM", {
                  locale: fr,
                })}
              >
                {e.destinations.map((e2) => {
                  return (
                    <div
                      key={e2.destinationIdeal}
                      className="flex flex-col gap-y-8"
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
                      {e2.moments.map((e3) => (
                        <div className="group space-y-2" key={e3.id}>
                          <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
                            <p className="font-medium text-blue-950">
                              {e3.objective}
                            </p>
                            <div className="hidden justify-end group-hover:flex">
                              <Button
                                type="button"
                                variant="destroy-step"
                                onClick={() => {
                                  setMoment(
                                    moments.find((e4) => e4.id === e3.id),
                                  ); // TO BE CORRECTED.
                                  // I still need the old format for the moment in order not to break my form. Whose mechanism will probably need to be rethought.
                                  setView("update-moment");
                                }}
                              >
                                Éditer
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
                          {subView !== "all-moments" && (
                            <ol>
                              {e3.steps.map((e4) => (
                                <li
                                  key={e4.id}
                                  className="text-sm leading-loose text-neutral-500"
                                >
                                  {e4.startDateAndTime.split("T")[1]} -{" "}
                                  {e4.endDateAndTime.split("T")[1]} : {e4.title}
                                </li>
                              ))}
                            </ol>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </Section>
              {i !== a.length - 1 && <Divider />}
            </div>
          ))}
        </>
      ) : (
        // fixing some padding towards the section title
        <div className="-mt-0.5">
          <FieldTitle title={"Pas de moment... pour le moment. 😅"} />
        </div>
      )}
    </div>
  );
}

function MomentForms({
  setView,
  moments, // gonna go for destinations from the database
  variant,
  moment,
  createOrUpdateMoment,
  deleteMoment,
  setSubView,
  now,
}: {
  setView: Dispatch<SetStateAction<View>>;
  moments: Moment[]; // gonna go for destinations from the database
  variant: "creating" | "updating";
  moment?: Moment;
  createOrUpdateMoment: any;
  deleteMoment?: any;
  setSubView: Dispatch<SetStateAction<SubView>>;
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
    moment ? moment.indispensable : false,
  );
  // datetime-local input is now controlled.
  let [momentDate, setMomentDate] = useState(
    moment
      ? moment.dateetheure
      : format(nowRoundedUpTenMinutes, "yyyy-MM-dd'T'HH:mm"),
  );
  let momentDateAsDate = new Date(momentDate);

  let [stepVisible, setStepVisible] = useState<StepVisible>("creating");
  let [steps, setSteps] = useState<Step[]>(moment ? moment.etapes : []);
  let overallAddingTime = steps.reduce((acc, curr) => acc + +curr.duree, 0);

  let [counterStepId, setCounterStepId] = useState(0);
  let [currentStepId, setCurrentStepId] = useState(0);
  let currentStep = steps.find((step) => step.id === currentStepId);

  let [destinationSelect, setDestinationSelect] = useState(false);
  let [activitySelect, setActivitySelect] = useState(false);

  // Destinations will need to be passed since it will be possible to create a destination without a moment.
  // Therefore, moments will then not be needed anymore.
  const momentsDestinations = [
    ...new Set(moments.map((moment) => moment.destination)),
  ];

  const destinationOptions: Option[] = momentsDestinations.map((e, i) => {
    return {
      key: i + 1,
      label: e,
      value: e,
    };
  });

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

          if (compareDesc(momentDate, now) === 1) setSubView("past-moments");
          else if (compareAsc(momentDate, now) == 1)
            setSubView("future-moments");
          else setSubView("current-moments");

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
          {/* fixing some padding towards the section title */}
          <div className="-mt-0.5">
            {!destinationSelect ? (
              <InputText
                label="Destination"
                name="destination"
                // controlling the value for SelectWithOptions crossover is something to keep in mind, but for now, default values from preceding moment will only be on InputText components
                defaultValue={moment ? moment.destination : undefined}
                description="Votre projet vise à atteindre quel idéal ?"
                addendum={
                  momentsDestinations.length > 0
                    ? "Ou choissisez parmi vos destinations précédemment instanciées."
                    : undefined
                }
                fieldFlexIsNotLabel
                tekTime
              >
                {momentsDestinations.length > 0 && (
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
          </div>
          {!activitySelect ? (
            <InputText
              label="Activité"
              description="Définissez le type d'activité qui va correspondre à votre problématique."
              addendum="Ou choissisez parmi une sélection prédéfinie via le bouton ci-dessus."
              name="activite"
              defaultValue={moment ? moment.activite : undefined}
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
            defaultValue={moment ? moment.objectif : undefined}
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
            defaultValue={moment ? moment.contexte : undefined}
            description="Expliquez ce qui a motivé ce moment et pourquoi il est nécessaire."
            rows={6}
          />
          <InputDatetimeLocalControlled
            label="Date et heure"
            name="dateetheure"
            description="Déterminez la date et l'heure auxquelles ce moment doit débuter."
            definedValue={momentDate}
            definedOnValueChange={setMomentDate}
            min={now}
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
                    // momentDateAsDate still works but will need to be removed in favor of momentDate since we're moving away from the Date object here
                    momentDateAsDate={momentDateAsDate}
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
                      add(momentDateAsDate, {
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
                // step="10"
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
                let newCounterStepId = counterStepId + 1;
                setCounterStepId(newCounterStepId);
                setCurrentStepId(newCounterStepId);
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
              {/* this will eventually be a component too */}
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
  currentStepId: number;
  steps: Step[];
  setSteps: Dispatch<SetStateAction<Step[]>>;
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

        const step = {
          id: currentStepId,
          intitule,
          details,
          duree,
        };

        let newSteps: Step[] = [];
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
  momentDateAsDate,
  addingTime,
  currentStep,
  setSteps,
}: {
  step: Step;
  index: number;
  steps: Step[];
  stepVisible: StepVisible;
  currentStepId: number;
  setCurrentStepId: Dispatch<SetStateAction<number>>;
  setStepVisible: Dispatch<SetStateAction<StepVisible>>;
  momentDateAsDate: Date;
  addingTime: number;
  currentStep: Step | undefined;
  setSteps: Dispatch<SetStateAction<Step[]>>;
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
              // step="10"
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
                    add(momentDateAsDate, {
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
*/
