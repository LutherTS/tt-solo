"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]

import { DestinationToCRUD } from "@/app/types/destinations";

import {
  Button,
  Divider,
  FieldTitle,
  InputText,
  PageTitle,
  Section,
  SectionWrapper,
  Textarea,
} from "../../../components";
import * as Icons from "../icons";

// Main Data

type View = "update-destination" | "create-destination" | "read-destinations";

// Main Component

export function CRUD({
  destinationsToCRUD,
  createOrUpdateDestination,
  deleteDestination,
  revalidateDestinations,
}: {
  destinationsToCRUD: DestinationToCRUD[];
  createOrUpdateDestination: any;
  deleteDestination: any;
  revalidateDestinations: any;
}) {
  let [view, setView] = useState<View>("read-destinations");

  let viewTitles = {
    "update-destination": "Éditez",
    "read-destinations": "Vos destinations",
    "create-destination": "Créez",
  };

  // for UpdateDestinationView
  let [destination, setDestination] = useState<DestinationToCRUD>();

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title={viewTitles[view]} />
          {view === "read-destinations" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("create-destination")}
            >
              Créez une destination
            </Button>
          )}
          {(view === "update-destination" || view === "create-destination") && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => {
                setDestination(undefined);
                setView("read-destinations");
              }}
            >
              Vos destinations
            </Button>
          )}
        </div>
        {view !== "read-destinations" && <Divider />}
      </div>
      <div className={clsx(view !== "update-destination" && "hidden")}>
        {view === "update-destination" && (
          // UpdateDestinationView
          <DestinationForm
            setView={setView}
            variant="updating"
            destination={destination}
            createOrUpdateDestination={createOrUpdateDestination}
            deleteDestination={deleteDestination}
          />
        )}
      </div>
      <div className={clsx(view !== "read-destinations" && "hidden")}>
        <ReadDestinationsView
          destinationsToCRUD={destinationsToCRUD}
          setDestination={setDestination}
          setView={setView}
          revalidateDestinations={revalidateDestinations}
        />
      </div>
      <div className={clsx(view !== "create-destination" && "hidden")}>
        {view !== "update-destination" && (
          // CreateDestinationView
          <DestinationForm
            setView={setView}
            variant="creating"
            destination={destination}
            createOrUpdateDestination={createOrUpdateDestination}
            deleteDestination={deleteDestination}
          />
        )}
      </div>
    </>
  );
}

// Main Leading Components

function ReadDestinationsView({
  destinationsToCRUD,
  setDestination,
  setView,
  revalidateDestinations,
}: {
  destinationsToCRUD: DestinationToCRUD[];
  setDestination: Dispatch<SetStateAction<DestinationToCRUD | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
  revalidateDestinations: any;
}) {
  const pathname = usePathname();
  const { replace } = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={async (event) => {
            const button = event.currentTarget;
            button.disabled = true;
            await revalidateDestinations();
            replace(`${pathname}`);
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
      {destinationsToCRUD.length > 0 ? (
        <>
          {destinationsToCRUD.map((e) => {
            const className =
              "inline-block font-serif font-light text-neutral-500";
            return (
              <div key={e.id} className="group space-y-8">
                <SectionWrapper>
                  <Section title={e.ideal}>
                    <div className="space-y-2">
                      <div className="grid select-none grid-cols-[4fr_1fr] items-center gap-4">
                        <p className="font-medium leading-7">
                          {e.aspiration
                            ? e.aspiration
                            : "(Pas d'aspiration défini.)"}
                        </p>
                        <div className="flex h-full flex-col justify-start">
                          <div className="invisible flex justify-end group-hover:visible">
                            <Button
                              type="button"
                              variant="destroy-step"
                              onClick={() => {
                                setDestination(
                                  destinationsToCRUD.find(
                                    (e2) => e2.id === e.id,
                                  ),
                                );
                                setView("update-destination");
                              }}
                            >
                              <Icons.PencilSquareSolid className="mt-1 size-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2">
                        <li className="list-inside list-disc">
                          <p className={className}>
                            {e.allMomentsCount >= 2
                              ? `${e.allMomentsCount} moments au total`
                              : e.allMomentsCount === 1
                                ? `${e.allMomentsCount} moment au total`
                                : "Aucun moment pour le moment."}
                          </p>
                        </li>
                        <li className="list-inside list-disc">
                          <p className={className}>
                            {e.pastMomentsCount >= 2
                              ? `${e.pastMomentsCount} moments passés`
                              : e.pastMomentsCount === 1
                                ? `${e.pastMomentsCount} moment passé`
                                : "Aucun moment passé."}
                          </p>
                        </li>
                        <li className="list-inside list-disc">
                          <p className={className}>
                            {e.currentMomentsCount >= 2
                              ? `${e.currentMomentsCount} moments actuels`
                              : e.currentMomentsCount === 1
                                ? `${e.currentMomentsCount} moment actuel`
                                : "Aucun moment actuel."}
                          </p>
                        </li>
                        <li className="list-inside list-disc">
                          <p className={className}>
                            {e.futureMomentsCount >= 2
                              ? `${e.futureMomentsCount} moments futurs`
                              : e.futureMomentsCount === 1
                                ? `${e.futureMomentsCount} moment futur`
                                : "Aucun moment futur."}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </Section>
                </SectionWrapper>
              </div>
            );
          })}
        </>
      ) : (
        <SectionWrapper>
          <FieldTitle
            title={"Pas de destination... pour la destination ? 🤔"}
          />
        </SectionWrapper>
      )}
    </div>
  );
}

function DestinationForm({
  setView,
  variant,
  destination,
  createOrUpdateDestination,
  deleteDestination,
}: {
  setView: Dispatch<SetStateAction<View>>;
  variant: "creating" | "updating";
  destination?: DestinationToCRUD;
  createOrUpdateDestination: any;
  deleteDestination?: any;
}) {
  const createOrUpdateDestinationBound = createOrUpdateDestination.bind(
    null,
    variant,
    destination,
  );

  let deleteDestinationBound: any;
  if (deleteDestination)
    deleteDestinationBound = deleteDestination.bind(null, destination);

  return (
    <>
      <form
        action={async (formData) => {
          await createOrUpdateDestinationBound(formData);

          setView("read-destinations");
        }}
        onReset={(event) => {
          if (
            confirm(
              "Êtes-vous sûr que vous voulez réinitialiser le formulaire ?",
            )
          ) {
          } else event.preventDefault();
        }}
        className="space-y-8"
      >
        <Section
          title="Votre destination"
          description="Définissez simplement votre destination et l'idéal qu'elle souhaite atteindre, honnêtement, de la manière la plus utopique que vous pouvez."
        >
          <InputText
            label="Idéal"
            name="ideal"
            defaultValue={destination ? destination.ideal : undefined}
            description="Indiquez en une phrase le résultat que vers lequel vous souhaitez tendre par le biais de cette destination."
          />
          <Textarea
            label="Aspiration"
            name="aspiration"
            defaultValue={
              destination && destination.aspiration !== null
                ? destination.aspiration
                : undefined
            }
            description="Expliquez de manière étendue en quoi cette destination vous tient à cœur."
            rows={6}
          />
        </Section>
        <Divider />
        <Section>
          {/* Doubling up instead of reverse for accessibility */}
          <div className="flex">
            {/* Mobile */}
            <div className="flex w-full flex-col gap-4 md:hidden">
              <Button type="submit" variant="confirm">
                Confirmer la destination
              </Button>
              {/* this could eventually be a component too */}
              {variant === "creating" && (
                <Button type="reset" variant="cancel">
                  Réinitialiser la destination
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={async () => {
                    if (!destination)
                      return console.error(
                        "Somehow a destination was not found.",
                      );

                    if (
                      confirm(
                        "Êtes-vous sûr que vous voulez effacer cette destination ? Tous les moments qui lui sont attribués seront effacés aussi.",
                      )
                    ) {
                      if (deleteDestinationBound)
                        await deleteDestinationBound();
                      else
                        return console.error(
                          "Somehow deleteDestinationBound was not a thing.",
                        );

                      setView("read-destinations");
                    }
                  }}
                  variant="cancel"
                >
                  Effacer la destination
                </Button>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden pt-1.5 md:ml-auto md:grid md:w-fit md:grow md:grid-cols-2 md:gap-4">
              {variant === "creating" && (
                <Button type="reset" variant="cancel">
                  Réinitialiser la destination
                </Button>
              )}
              {variant === "updating" && (
                <Button
                  type="button"
                  onClick={async () => {
                    if (!destination)
                      return console.error(
                        "Somehow a destination was not found.",
                      );

                    if (
                      confirm(
                        "Êtes-vous sûr que vous voulez effacer cette destination ? Tous les moments qui lui sont attribués seront effacés aussi.",
                      )
                    ) {
                      if (deleteDestinationBound)
                        await deleteDestinationBound();
                      else
                        return console.error(
                          "Somehow deleteDestinationBound was not a thing.",
                        );

                      setView("read-destinations");
                    }
                  }}
                  variant="cancel"
                >
                  Effacer la destination
                </Button>
              )}
              <Button type="submit" variant="confirm">
                Confirmer la destination
              </Button>
            </div>
          </div>
        </Section>
      </form>
    </>
  );
}

/* Notes
PREVIOUS CODE:
{e.dates.length > 0 ? (
  <>
    {e.dates.map((e2, i2) => (
      <div key={e2.date} className="flex flex-col gap-y-8">
        <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
            {format(e2.date, "eeee d MMMM", {
              locale: fr,
            })}
          </p>
          {i2 === 0 && (
            <div className="hidden justify-end group-hover:flex">
              <Button
                type="button"
                variant="destroy-step"
                onClick={() => {
                  setDestination(
                    destinations.find((e2) => e2.id === e.id),
                  );
                  setView("update-destination");
                }}
              >
                Éditer
              </Button>
            </div>
          )}
        </div>
        {e2.moments.map((e3) => (
          <div className="space-y-2" key={e3.id}>
            <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
              <p className="font-medium text-blue-950">
                {e3.objective}
              </p>
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
                  key={e4.id}
                  className="text-sm leading-loose text-neutral-500"
                >
                  {e4.startDateAndTime?.split("T")[1]} -{" "}
                  {e4.endDateAndTime?.split("T")[1]} :{" "}
                  {e4.title}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    ))}
  </>
) : (
  <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
    <p className="text-neutral-500">
      (Pas de moment pour le moment.)
    </p>
    <div className="hidden justify-end group-hover:flex">
      <Button
        type="button"
        variant="destroy-step"
        onClick={() => {
          setDestination(
            destinations.find((e2) => e2.id === e.id),
          );
          setView("update-destination");
        }}
      >
        Éditer
      </Button>
    </div>
  </div>
)}
PREVIOUS TYPES:
type Moment = {
  id: string;
  // destination: string;
  activite: string;
  objectif: string;
  indispensable: boolean;
  contexte: string;
  dateetheure: string;
  // etapes: Step[];
  duree: string; // calculated
  findateetheure: string; // calculated
};

type Destination = {
  id: string;
  objectif: string;
  contexte: string | null;
  moments: Moment[];
};

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

type DestinationForCRUD = {
  id: string;
  ideal: string;
  aspiration: string | null;
  dates: {
    date: string;
    moments: MomentForCRUD[];
  }[];
};
*/
