import { add, format } from "date-fns";
import clsx from "clsx";

import * as LocalClientComponents from "./client";
import * as GlobalServerComponents from "@/app/components/agnostic";
import * as GlobalClientComponents from "@/app/components/client";
import { Option, SetState } from "@/app/types/globals";
import {
  ACTIVITY_OPTIONS,
  momentFormIds,
  viewsTitles,
} from "@/app/constants/moments";
import {
  MomentFormVariant,
  RevalidateMoments,
  StepFromClient,
  StepVisible,
  CreateOrUpdateMomentState,
  View,
  MomentAdapted,
  DestinationAdapted,
  PageDetails,
  StepAdapted,
  CreateOrUpdateMoment,
  DeleteMoment,
  FetchViewAndMomentData,
  FetchReadMomentsViewData,
  FetchMomentFormsData,
} from "@/app/types/moments";
import { numStringToTimeString } from "@/app/utilities/moments";
import { EventStepDurationSchema } from "@/app/validations/steps";

export default async function ServerCore({
  // time
  now,
  // reads as promises
  fetchViewAndMomentData,
  fetchReadMomentsViewData,
  fetchMomentFormsData,
  // writes
  revalidateMoments,
  createOrUpdateMoment,
  deleteMoment,
}: {
  now: string;
  fetchViewAndMomentData: FetchViewAndMomentData;
  fetchReadMomentsViewData: FetchReadMomentsViewData;
  fetchMomentFormsData: FetchMomentFormsData;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  const { view, moment } = await fetchViewAndMomentData;

  return (
    <>
      <Header view={view} />
      <GlobalServerComponents.Divider />
      <Main
        now={now}
        view={view}
        moment={moment}
        fetchReadMomentsViewData={fetchReadMomentsViewData}
        fetchMomentFormsData={fetchMomentFormsData}
        revalidateMoments={revalidateMoments}
        createOrUpdateMoment={createOrUpdateMoment}
        deleteMoment={deleteMoment}
      />
    </>
  );
}

export function Header({ view }: { view: View }) {
  return (
    <header>
      <PageSegment>
        <HeaderSegment>
          <GlobalServerComponents.PageTitle title={viewsTitles[view]} />
          <LocalClientComponents.SetViewButton view={view} />
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
  fetchReadMomentsViewData: FetchReadMomentsViewData;
  fetchMomentFormsData: FetchMomentFormsData;
  revalidateMoments: RevalidateMoments;
  createOrUpdateMoment: CreateOrUpdateMoment;
  deleteMoment: DeleteMoment;
}) {
  return (
    <main>
      {/* ViewsCarousel */}
      <ViewsCarouselWrapper>
        {/* where the client boundary currently begins */}
        <LocalClientComponents.ViewsCarouselContainer
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

export function DestinationInDateCard({
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
          key={e3.key + e2.key}
          e3={e3}
          i3={i3}
          realMoments={realMoments}
        />
      ))}
    </div>
  );
}

export function MomentInDateCard({
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
          <LocalClientComponents.UpdateMomentViewButton
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
      <ol className="">
        {e3.steps.map((e4) => (
          <StepInDateCard key={e4.key} e4={e4} />
        ))}
      </ol>
    </div>
  );
}

export function StepInDateCard({ e4 }: { e4: StepAdapted }) {
  return (
    <li className="text-sm font-light leading-loose text-neutral-500">
      <p>
        {e4.startDateAndTime.split("T")[1]} - {e4.endDateAndTime.split("T")[1]}{" "}
        : {e4.title}
      </p>
    </li>
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

export function MomentInputs({
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
  moment?: MomentAdapted;
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
  const activityValues = ACTIVITY_OPTIONS.map((e) => e.value);

  return (
    <>
      <GlobalClientComponents.InputText
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
        errors={createOrUpdateMomentState?.error?.momentErrors?.destinationName}
        hidden={destinationSelect}
      >
        {destinationOptions.length > 0 && (
          <SetSelectButton
            setSelect={setDestinationSelect}
            text={"Choisir la destination"}
          />
        )}
      </GlobalClientComponents.InputText>
      <GlobalServerComponents.SelectWithOptions
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
        errors={createOrUpdateMomentState?.error?.momentErrors?.destinationName}
        hidden={!destinationSelect}
      >
        <SetSelectButton
          setSelect={setDestinationSelect}
          text={"Définir la destination"}
        />
      </GlobalServerComponents.SelectWithOptions>
      <GlobalClientComponents.InputText
        label="Activité"
        description="Définissez le type d'activité qui va correspondre à votre problématique."
        addendum="Ou choissisez parmi une sélection prédéfinie via le bouton ci-dessus."
        name="activite"
        defaultValue={isVariantUpdatingMoment ? moment.activity : ""}
        fieldFlexIsNotLabel
        required={false}
        errors={createOrUpdateMomentState?.error?.momentErrors?.momentActivity}
        hidden={activitySelect}
      >
        <SetSelectButton
          setSelect={setActivitySelect}
          text={"Choisir l'activité"}
        />
      </GlobalClientComponents.InputText>
      <GlobalServerComponents.SelectWithOptions
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
        options={ACTIVITY_OPTIONS}
        fieldFlexIsNotLabel
        required={false}
        errors={createOrUpdateMomentState?.error?.momentErrors?.momentActivity}
        hidden={!activitySelect}
      >
        <SetSelectButton
          setSelect={setActivitySelect}
          text={"Définir l'activité"}
        />
      </GlobalServerComponents.SelectWithOptions>
      <GlobalClientComponents.InputText
        label="Objectif"
        name="objectif"
        defaultValue={isVariantUpdatingMoment ? moment.objective : ""}
        description="Indiquez en une phrase le résultat que vous souhaiterez obtenir par ce moment."
        required={false}
        errors={createOrUpdateMomentState?.error?.momentErrors?.momentName}
      />
      <GlobalServerComponents.InputSwitch
        key={inputSwitchKey}
        label="Indispensable ?"
        name="indispensable"
        defaultChecked={
          isVariantUpdatingMoment ? moment.isIndispensable : false
        }
        description="Activez l'interrupteur si ce moment est d'une importance incontournable."
        required={false}
        errors={
          createOrUpdateMomentState?.error?.momentErrors?.momentIsIndispensable
        }
      />
      <GlobalClientComponents.Textarea
        label="Contexte"
        name="contexte"
        defaultValue={isVariantUpdatingMoment ? moment.context : ""}
        description="Expliquez ce qui a motivé ce moment et pourquoi il est nécessaire."
        rows={6}
        required={false}
        errors={
          createOrUpdateMomentState?.error?.momentErrors?.momentDescription
        }
      />
      <GlobalClientComponents.InputDatetimeLocalControlled
        label="Date et heure"
        name="dateetheure"
        description="Déterminez la date et l'heure auxquelles ce moment doit débuter."
        definedValue={startMomentDate}
        definedOnValueChange={setStartMomentDate}
        required={false}
        errors={
          createOrUpdateMomentState?.error?.momentErrors?.momentStartDateAndTime
        }
      />
    </>
  );
}

export function SetSelectButton({
  setSelect,
  text,
}: {
  setSelect: SetState<boolean>;
  text: string;
}) {
  return (
    <GlobalClientComponents.Button
      type="button"
      variant="destroy"
      onClick={() => setSelect((s) => !s)}
    >
      {text}
    </GlobalClientComponents.Button>
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
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-neutral-500">
          Ajouter une étape
        </p>{" "}
        <GlobalClientComponents.Button
          form={form}
          variant="destroy-step"
          type="button"
          onClick={cancelStepAction}
          disabled={
            allButtonsDisabled || steps.length === 0 || isCancelStepPending
          }
        >
          Annuler l&apos;étape
        </GlobalClientComponents.Button>
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
          <GlobalClientComponents.Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={allButtonsDisabled || isCreateStepPending}
          >
            Confirmer l&apos;étape
          </GlobalClientComponents.Button>
          <GlobalClientComponents.Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={allButtonsDisabled || isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </GlobalClientComponents.Button>
        </StepFormControlsMobileWrapper>
        {/* Desktop */}
        <StepFormControlsDesktopWrapper>
          <GlobalClientComponents.Button
            variant="cancel-step"
            form={form}
            type="reset"
            disabled={allButtonsDisabled || isResetStepPending}
          >
            Réinitialiser l&apos;étape
          </GlobalClientComponents.Button>
          <GlobalClientComponents.Button
            variant="confirm-step"
            form={form}
            type="submit"
            disabled={allButtonsDisabled || isCreateStepPending}
          >
            Confirmer l&apos;étape
          </GlobalClientComponents.Button>
        </StepFormControlsDesktopWrapper>
      </div>
    </div>
  );
}

export function StepVisibleCreate({
  addStepAction,
  isAddStepPending,
  allButtonsDisabled,
}: {
  addStepAction: () => void;
  isAddStepPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <div>
      <GlobalClientComponents.Button
        type="button"
        variant="neutral"
        onClick={addStepAction}
        disabled={allButtonsDisabled || isAddStepPending}
      >
        Ajouter une étape
      </GlobalClientComponents.Button>
    </div>
  );
}

export function ConfirmMomentButton({
  isCreateOrUpdateMomentPending,
  isResetMomentPending,
  isDeleteMomentPending,
  allButtonsDisabled,
}: {
  isCreateOrUpdateMomentPending: boolean;
  isResetMomentPending: boolean;
  isDeleteMomentPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <GlobalClientComponents.Button
      type="submit"
      variant="confirm"
      disabled={
        allButtonsDisabled ||
        isCreateOrUpdateMomentPending ||
        isResetMomentPending ||
        isDeleteMomentPending
      }
      isDedicatedDisabled={isCreateOrUpdateMomentPending}
    >
      Confirmer le moment
    </GlobalClientComponents.Button>
  );
}

export function ResetOrEraseMomentButton({
  variant,
  deleteMomentAction,
  isResetMomentPending,
  isDeleteMomentPending,
  isCreateOrUpdateMomentPending,
  allButtonsDisabled,
}: {
  variant: string;
  deleteMomentAction: () => Promise<void>;
  isResetMomentPending: boolean;
  isDeleteMomentPending: boolean;
  isCreateOrUpdateMomentPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <>
      {(() => {
        switch (variant) {
          case "creating":
            return (
              <GlobalClientComponents.Button
                type="reset"
                variant="cancel"
                disabled={
                  allButtonsDisabled ||
                  isResetMomentPending ||
                  isCreateOrUpdateMomentPending
                }
                isDedicatedDisabled={isResetMomentPending}
              >
                Réinitialiser le moment
              </GlobalClientComponents.Button>
            );
          case "updating":
            return (
              <GlobalClientComponents.Button
                type="button"
                onClick={deleteMomentAction}
                variant="cancel"
                disabled={
                  allButtonsDisabled ||
                  isDeleteMomentPending ||
                  isCreateOrUpdateMomentPending
                }
                isDedicatedDisabled={isDeleteMomentPending}
              >
                Effacer le moment
              </GlobalClientComponents.Button>
            );
          default:
            return null;
        }
      })()}
    </>
  );
}

export function StepInputs({
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
  step?: StepFromClient;
  startMomentDate: string;
  stepAddingTime?: number;
  stepsCompoundDurations: number[];
}) {
  return (
    <>
      <GlobalClientComponents.InputText
        form={form}
        label="Intitulé de l'étape"
        name="intituledeleetape"
        defaultValue={step?.intitule}
        description="Définissez simplement le sujet de l'étape."
        required={false}
        errors={createOrUpdateMomentState?.error?.stepsErrors?.stepName}
      />
      <GlobalClientComponents.Textarea
        form={form}
        label="Détails de l'étape"
        name="detailsdeleetape"
        defaultValue={step?.details}
        description="Expliquez en détails le déroulé de l'étape."
        rows={4}
        required={false}
        errors={createOrUpdateMomentState?.error?.stepsErrors?.stepDescription}
      />
      <GlobalClientComponents.InputNumberControlled
        form={form}
        label="Durée de l'étape"
        name="dureedeletape"
        definedValue={stepDuree}
        definedOnValueChange={setStepDuree}
        description="Renseignez en minutes la longueur de l'étape."
        min="5"
        required={false}
        errors={createOrUpdateMomentState?.error?.stepsErrors?.realStepDuration}
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
      </GlobalClientComponents.InputNumberControlled>
    </>
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

export function UpdateStepButton({
  form,
  isUpdateStepPending,
  allButtonsDisabled,
}: {
  form: string;
  isUpdateStepPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <GlobalClientComponents.Button
      form={form}
      type="submit"
      variant="confirm-step"
      disabled={allButtonsDisabled || isUpdateStepPending}
    >
      Actualiser l&apos;étape
    </GlobalClientComponents.Button>
  );
}

export function EraseStepButton({
  form,
  deleteStepAction,
  isDeleteStepPending,
  allButtonsDisabled,
}: {
  form: string;
  deleteStepAction: () => void;
  isDeleteStepPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <GlobalClientComponents.Button
      form={form}
      type="button"
      onClick={deleteStepAction}
      variant="cancel-step"
      disabled={allButtonsDisabled || isDeleteStepPending}
    >
      Effacer l&apos;étape
    </GlobalClientComponents.Button>
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

const localServerComponents = {
  ServerCore,
  Header,
  PageSegment,
  SegmentWrapper,
  SegmentContainer,
  HeaderSegment,
  ViewsCarouselWrapper,
  DateCard,
  NoDateCard,
  DestinationInDateCard,
  MomentInDateCard,
  StepInDateCard,
  MomentsPageDetails,
  MomentInputs,
  SetSelectButton,
  StepsSummaries,
  StepVisibleCreating,
  StepVisibleCreate,
  ConfirmMomentButton,
  ResetOrEraseMomentButton,
  StepInputs,
  StepFormControlsMobileWrapper,
  StepFormControlsDesktopWrapper,
  UpdateStepButton,
  EraseStepButton,
  StepContents,
} as const;

export type LocalServerComponentsName = keyof typeof localServerComponents;
