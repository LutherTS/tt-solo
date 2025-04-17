"use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.
// (directive enforced via index.ts) (not anymore)

/* IMPORTS */

// External imports

import { add, format } from "date-fns";
import clsx from "clsx";

// Components imports

import * as AllGlobalAgnosticComponents from "@/app/components/agnostic";
import * as AllGlobalClientComponents from "@/app/components/client";
import * as AllLocalClientComponents from "../client";

// Internal imports

import { momentFormIds, viewsTitles } from "@/app/constants/agnostic/moments";
import { numStringToTimeString } from "@/app/utilities/agnostic/moments";
// import { EventStepDurationSchema } from "@/app/validations/agnostic/steps";

// Types imports

import type { SetState } from "@/app/types/client/globals";
import type {
  MomentFormVariant,
  RevalidateMoments,
  StepFromClient,
  StepVisible,
  CreateOrUpdateMomentState,
  View,
  MomentAdapted,
  PageDetails,
  CreateOrUpdateMoment,
  DeleteMoment,
  ReadMomentsViewData,
  MomentFormsData,
} from "@/app/types/agnostic/moments";

/* LOGIC */

export function Header({ view }: { view: View }) {
  return (
    <header>
      <PageSegment>
        <HeaderSegment>
          <AllGlobalAgnosticComponents.PageTitle title={viewsTitles[view]} />
          <AllLocalClientComponents.SetViewButton view={view} />
        </HeaderSegment>
      </PageSegment>
    </header>
  );
}

export function Main({
  now,
  view,
  moment,
  fetchReadMomentsViewData,
  fetchMomentFormsData,
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
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
  return (
    <main>
      {/* ViewsCarousel */}
      <ViewsCarouselWrapper>
        {/* where the client boundary currently begins */}
        <AllLocalClientComponents.ViewsCarouselContainer
          now={now}
          view={view}
          moment={moment}
          fetchReadMomentsViewData={fetchReadMomentsViewData}
          fetchMomentFormsData={fetchMomentFormsData}
          revalidateMoments={revalidateMoments}
          createOrUpdateMoment={createOrUpdateMoment}
          deleteMoment={deleteMoment}
        />
      </ViewsCarouselWrapper>
    </main>
  );
}

export function PageSegment({
  isSegmentContainerInvisible,
  children,
}: {
  isSegmentContainerInvisible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <SegmentWrapper>
      <SegmentContainer isInvisible={isSegmentContainerInvisible}>
        {children}
      </SegmentContainer>
    </SegmentWrapper>
  );
}

export function SegmentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen shrink-0 flex-col items-center md:w-[calc(100vw_-_9rem)]">
      {children}
    </div>
  );
}

export function SegmentContainer({
  isInvisible,
  children,
}: {
  isInvisible?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "container px-8 lg:max-w-4xl",
        isInvisible && "invisible",
      )}
    >
      {children}
    </div>
  );
}

export function HeaderSegment({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between py-8 align-baseline">{children}</div>
  );
}

export function ViewsCarouselWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // the overflow-hidden just doesn't work without relative
    <div className="relative w-screen overflow-hidden md:w-[calc(100vw_-_9rem)]">
      {children}
    </div>
  );
}

export function MomentsPageDetails({
  pageDetails,
}: {
  pageDetails: PageDetails;
}) {
  return (
    <p className="font-extralight text-neutral-800">
      <span className="font-normal">{pageDetails.momentsTotal}</span> moment(s)
      affiché(s){" "}
      <span className="font-normal">
        (
        {pageDetails.momentsFirstIndex !== pageDetails.momentsLastIndex
          ? `${pageDetails.momentsFirstIndex}-${pageDetails.momentsLastIndex}`
          : `${pageDetails.momentsFirstIndex}`}
        )
      </span>{" "}
      sur <span className="font-normal">{pageDetails.total}</span> à la page{" "}
      <span className="font-normal">{pageDetails.page}</span> sur{" "}
      <span className="font-normal">{pageDetails.maxPage}</span>
    </p>
  );
}

export function StepsSummaries({
  stepVisible,
  endMomentDate,
  momentAddingTime,
}: {
  stepVisible: StepVisible;
  endMomentDate: string;
  momentAddingTime: number;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold tracking-[0.08em] text-neutral-500 uppercase">
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
    </div>
  );
}

export function StepVisibleCreating({
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
  allButtonsDisabled,
}: {
  momentFormVariant: MomentFormVariant;
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
}) {
  const form = momentFormIds[momentFormVariant].stepFormCreating;

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold tracking-[0.08em] text-neutral-500 uppercase">
          Ajouter une étape
        </p>{" "}
        <AllGlobalClientComponents.Button
          form={form}
          variant="destroy-step"
          type="button"
          onClick={cancelStepAction}
          disabled={
            allButtonsDisabled || steps.length === 0 || isCancelStepPending
          }
        >
          Annuler l&apos;étape
        </AllGlobalClientComponents.Button>
      </div>
      <AllLocalClientComponents.StepInputs
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
          <AllGlobalClientComponents.Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={allButtonsDisabled || isCreateStepPending}
          >
            Confirmer l&apos;étape
          </AllGlobalClientComponents.Button>
          <AllGlobalClientComponents.Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={allButtonsDisabled || isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </AllGlobalClientComponents.Button>
        </StepFormControlsMobileWrapper>
        {/* Desktop */}
        <StepFormControlsDesktopWrapper>
          <AllGlobalClientComponents.Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={allButtonsDisabled || isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </AllGlobalClientComponents.Button>
          <AllGlobalClientComponents.Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={allButtonsDisabled || isCreateStepPending}
          >
            Confirmer l&apos;étape
          </AllGlobalClientComponents.Button>
        </StepFormControlsDesktopWrapper>
      </div>
    </div>
  );
}

export function StepFormControlsMobileWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex w-full flex-col gap-4 md:hidden">{children}</div>;
}

export function StepFormControlsDesktopWrapper({
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

export function StepContents({
  step,
  index,
  hasAPreviousStepUpdating,
  startMomentDate,
  stepAddingTime,
}: {
  step: StepFromClient;
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

const localAgnosticComponents = {
  Header,
  PageSegment,
  SegmentWrapper,
  SegmentContainer,
  HeaderSegment,
  ViewsCarouselWrapper,
  MomentsPageDetails,
  StepsSummaries,
  StepVisibleCreating,
  StepFormControlsMobileWrapper,
  StepFormControlsDesktopWrapper,
  StepContents,
} as const;

export type LocalAgnosticComponentsName = keyof typeof localAgnosticComponents;
