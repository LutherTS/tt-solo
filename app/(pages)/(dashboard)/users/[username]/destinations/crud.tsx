"use client";

import { Dispatch, SetStateAction, useState } from "react";

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]

import {
  Button,
  Divider,
  FieldTitle,
  InputText,
  PageTitle,
  Section,
  Textarea,
} from "../../../components";
import { numStringToTimeString } from "@/app/utilities/moments";

// Main Data

type View = "update-destination" | "create-destination" | "read-destinations";

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

// Main Component

export function CRUD({
  destinationsToCRUD,
  createOrUpdateDestination,
  deleteDestination,
}: {
  destinationsToCRUD: Destination[];
  createOrUpdateDestination: any;
  deleteDestination: any;
}) {
  let [view, setView] = useState<View>("read-destinations");

  let viewTitles = {
    "update-destination": "Modifiez votre destination",
    "read-destinations": "Vos destinations",
    "create-destination": "Créez une destination",
  };

  // for UpdateDestinationView
  let [destination, setDestination] = useState<Destination>();

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between align-baseline">
          <PageTitle title={viewTitles[view]} />
          {view === "update-destination" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("read-destinations")}
            >
              Vos destinations
            </Button>
          )}
          {view === "read-destinations" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("create-destination")}
            >
              Créez un destination
            </Button>
          )}
          {view === "create-destination" && (
            <Button
              type="button"
              variant="destroy-step"
              onClick={() => setView("read-destinations")}
            >
              Vos destinations
            </Button>
          )}
        </div>
        <Divider />
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
          destinations={destinationsToCRUD}
          setDestination={setDestination}
          setView={setView}
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
  destinations,
  setDestination,
  setView,
}: {
  destinations: Destination[];
  setDestination: Dispatch<SetStateAction<Destination | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
}) {
  return (
    <div className="space-y-8">
      {destinations.length > 0 ? (
        <>
          {destinations.map((e, i, a) => (
            <div className="group space-y-8" key={e.id}>
              <Section
                title={e.objectif}
                description={
                  e.contexte ? e.contexte : "(Pas de contexte défini.)"
                }
              >
                <div className="flex flex-col gap-y-8">
                  <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
                      Moments
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
                  {e.moments.length > 0 ? (
                    <>
                      {e.moments.map((e3) => (
                        <div className="group space-y-2" key={e3.id}>
                          <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
                            <p className="font-medium text-blue-950">
                              {e3.objectif}
                            </p>
                          </div>
                          <p>
                            <span className={"font-semibold text-neutral-800"}>
                              {e3.dateetheure.split("T")[1]}
                            </span>{" "}
                            • {numStringToTimeString(e3.duree)}
                            {e3.indispensable && (
                              <>
                                {" "}
                                •{" "}
                                <span className="text-sm font-semibold uppercase">
                                  indispensable
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-neutral-500">
                      (Pas de moment pour le moment.)
                    </p>
                  )}
                </div>
                {/* {e.destinations.map((e2) => {
                  return (
                    <div key={e2.destination} className="flex flex-col gap-y-8">
                      <div className="flex select-none items-baseline justify-between">
                        <p
                          className={clsx(
                            "text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500",
                          )}
                        >
                          {e2.destination}
                        </p>
                      </div>
                      {e2.moments.map((e3) => (
                        <div className="group space-y-2" key={e3.id}>
                          <div className="grid select-none grid-cols-[4fr_1fr] items-baseline gap-4">
                            <p className="font-medium text-blue-950">
                              {e3.objectif}
                            </p>
                            <div className="hidden justify-end group-hover:flex">
                              <Button
                                type="button"
                                variant="destroy-step"
                                onClick={() => {
                                  setMoment(
                                    moments.find((e) => e.id === e3.id),
                                  );
                                  setView("update-moment");
                                }}
                              >
                                Éditer
                              </Button>
                            </div>
                          </div>
                          <p>
                            <span className={"font-semibold text-neutral-800"}>
                              {e3.dateetheure.split("T")[1]}
                            </span>{" "}
                            • {numStringToTimeString(e3.duree)}
                            {e3.indispensable && (
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
                            {e3.etapes.map((e4) => (
                              <li
                                key={e4.id}
                                className="text-sm leading-loose text-neutral-500"
                              >
                                {e4.dateetheure?.split("T")[1]} -{" "}
                                {e4.findateetheure?.split("T")[1]} :{" "}
                                {e4.intitule}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ))}
                    </div>
                  );
                })} */}
              </Section>
              {i !== a.length - 1 && <Divider />}
            </div>
          ))}
        </>
      ) : (
        // fixing some padding towards the section title
        <div className="-mt-0.5">
          <FieldTitle
            title={"Pas de destination... pour la destination ? 🤔"}
          />
        </div>
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
  destination?: Destination;
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
          // https://stackoverflow.com/questions/76543082/how-could-i-change-state-on-server-actions-in-nextjs-13
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
          {/* fixing some padding towards the section title */}
          <div className="-mt-0.5">
            <InputText
              label="Objectif"
              name="objectif"
              defaultValue={destination ? destination.objectif : undefined}
              description="Indiquez en une phrase le résultat que vers lequel vous souhaitez tendre par le biais de cette destination."
            />
          </div>

          <Textarea
            label="Contexte"
            name="contexte"
            defaultValue={
              destination && destination.contexte !== null
                ? destination.contexte
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
              {/* this will eventually be a component too */}
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
