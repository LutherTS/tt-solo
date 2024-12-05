// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import clsx from "clsx";

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllLocalClientComponents from "../client";

import { numStringToTimeString } from "@/app/utilities/agnostic/moments";
import {
  DateAdapted,
  DestinationAdapted,
  MomentAdapted,
  StepAdapted,
} from "@/app/types/agnostic/moments";

export function DateCard({
  title,
  e,
  i,
  realMoments,
}: {
  title: string;
  e: DateAdapted;
  i: number;
  realMoments: MomentAdapted[];
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <section className="grid items-baseline gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
        </div>
        <div className="flex flex-col gap-y-8">
          {e.destinations.map((e2) => {
            return (
              <DestinationInDateCard
                key={`${e2.key}-${i.toString()}`}
                e2={e2}
                realMoments={realMoments}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function DestinationInDateCard({
  e2,
  realMoments,
}: {
  e2: DestinationAdapted;
  realMoments: MomentAdapted[];
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
          key={`${e3.key}-${e2.key}`}
          e3={e3}
          i3={i3}
          realMoments={realMoments}
        />
      ))}
    </div>
  );
}

function MomentInDateCard({
  e3,
  i3,
  realMoments,
}: {
  e3: MomentAdapted;
  i3: number;
  realMoments: MomentAdapted[];
}) {
  return (
    <div className={clsx("group space-y-2", i3 === 0 && "-mt-5")}>
      <div className="grid grid-cols-[4fr_1fr] items-center gap-4">
        <p className="font-medium text-blue-950">{e3.objective}</p>
        <div className="invisible flex justify-end group-hover:visible">
          <AllLocalClientComponents.UpdateMomentViewButton
            e3={e3}
            realMoments={realMoments}
          />
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
      <ol>
        {e3.steps.map((e4) => (
          <StepInDateCard key={`${e4.key}-${e3.key}`} e4={e4} />
        ))}
      </ol>
    </div>
  );
}

function StepInDateCard({ e4 }: { e4: StepAdapted }) {
  return (
    <li className="text-sm font-light leading-loose text-neutral-500">
      <p>
        {e4.startDateAndTime.split("T")[1]} - {e4.endDateAndTime.split("T")[1]}{" "}
        : {e4.title}
      </p>
    </li>
  );
}

export function NoDateCard() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <AllGlobalAgnosticComponents.FieldTitle
        title={"Pas de moment... pour le moment. 😅"}
      />
    </div>
  );
}

const dateCardsAgnosticComponents = {
  DateCard,
  NoDateCard,
} as const;

export type DateCardsAgnosticComponentsName =
  keyof typeof dateCardsAgnosticComponents;
