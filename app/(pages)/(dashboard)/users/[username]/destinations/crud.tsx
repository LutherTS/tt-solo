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
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

// Main Component

export function CRUD({
  destinationsForCRUD,
  createOrUpdateDestination,
  deleteDestination,
}: {
  destinationsForCRUD: DestinationForCRUD[];
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
  let [destination, setDestination] = useState<DestinationForCRUD>();

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
              Créez un destination
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
          destinations={destinationsForCRUD}
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
  destinations: DestinationForCRUD[];
  setDestination: Dispatch<SetStateAction<DestinationForCRUD | undefined>>;
  setView: Dispatch<SetStateAction<View>>;
}) {
  return (
    <div className="space-y-8">
      {destinations.length > 0 ? (
        <>
          {destinations.map((e, i, a) => (
            <div key={e.id} className="group space-y-8">
              <Section
                title={e.ideal}
                description={
                  e.aspiration ? e.aspiration : "(Pas d'aspiration défini.)"
                }
              >
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
                          <div className="group space-y-2" key={e3.id}>
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
                  <p className="text-neutral-500">
                    (Pas de moment pour le moment.)
                  </p>
                )}
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
  destination?: DestinationForCRUD;
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
              label="Idéal"
              name="ideal"
              defaultValue={destination ? destination.ideal : undefined}
              description="Indiquez en une phrase le résultat que vers lequel vous souhaitez tendre par le biais de cette destination."
            />
          </div>

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
