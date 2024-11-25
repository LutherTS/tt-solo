"use agnostic"; // NOT A REAL DIRECTIVE. YET. I HOPE.

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]

import * as GlobalClientComponents from "../client";

import * as ValidationErrors from "./validation-errors";

import { SetState } from "@/app/types/globals";
import {
  FalseCreateOrUpdateMomentState,
  FormSectionTopic,
  CreateOrUpdateMomentState,
} from "@/app/types/moments";
import {
  removeMomentMessagesAndErrorsCallback,
  removeStepsMessagesAndErrorsCallback,
} from "@/app/utilities/moments";

export function Section({
  title,
  description,
  showDescription = true,
  addendum,
  showAddendum = true,
  id,
  error,
  subError,
  setCreateOrUpdateMomentState,
  removeMessagesAndErrorsCallback,
  children,
}: {
  title?: string;
  description?: string;
  showDescription?: boolean;
  addendum?: string;
  showAddendum?: boolean;
  id?: string;
  error?: string;
  subError?: string;
  setCreateOrUpdateMomentState?: SetState<FalseCreateOrUpdateMomentState>;
  removeMessagesAndErrorsCallback?: (
    s: FalseCreateOrUpdateMomentState,
  ) => FalseCreateOrUpdateMomentState;
  children: React.ReactNode;
}) {
  return (
    // pb-1 (or +1) making up for input padding inconsistencies
    <section
      className="grid items-baseline gap-8 pb-9 pt-8 md:grid-cols-[1fr_2fr]"
      id={id}
    >
      <div
        className={clsx(
          !title && "hidden md:block",
          description && showDescription && "flex flex-col gap-y-4",
        )}
      >
        {title && (
          <>
            <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
            <div className="flex flex-col gap-y-2">
              {description && showDescription && (
                <ValidationErrors.FalseFormDescriptionOrError
                  error={error}
                  description={description}
                  setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
                  removeMessagesAndErrorsCallback={
                    removeMessagesAndErrorsCallback
                  }
                />
              )}
              {subError ? (
                <GlobalClientComponents.FalseFormValidationError
                  error={subError}
                />
              ) : (
                <>
                  {addendum && showAddendum && (
                    <p className="max-w-prose text-sm text-neutral-500">
                      {addendum}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col gap-y-8">{children}</div>
    </section>
  );
}

const formSectionTopicRemoves: {
  [K in FormSectionTopic]: (
    s: CreateOrUpdateMomentState,
  ) => CreateOrUpdateMomentState;
} = {
  moment: removeMomentMessagesAndErrorsCallback,
  steps: removeStepsMessagesAndErrorsCallback,
};

export function FormSection({
  topic,
  title,
  description,
  showDescription = true,
  addendum,
  showAddendum = true,
  id,
  error,
  subError,
  setCreateOrUpdateMomentState,
  children,
}: {
  topic: FormSectionTopic;
  title?: string;
  description?: string;
  showDescription?: boolean;
  addendum?: string;
  showAddendum?: boolean;
  id?: string;
  error?: string;
  subError?: string;
  setCreateOrUpdateMomentState?: SetState<CreateOrUpdateMomentState>;
  children: React.ReactNode;
}) {
  return (
    // pb-1 (or +1) making up for input padding inconsistencies
    <section
      // pb-9 will be conditional, only on topic === "moment"
      className={clsx(
        "grid items-baseline gap-8 pt-8 md:grid-cols-[1fr_2fr]",
        topic === "moment" && "pb-9",
        topic === "steps" && "pb-8",
      )}
      id={id}
    >
      <div
        className={clsx(
          !title && "hidden md:block",
          description && showDescription && "flex flex-col gap-y-4",
        )}
      >
        {title && (
          <>
            <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
            <div className="flex flex-col gap-y-2">
              {description && showDescription && (
                <ValidationErrors.FormDescriptionOrError
                  error={error}
                  description={description}
                  setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
                  removeMessagesAndErrorsCallback={
                    formSectionTopicRemoves[topic]
                  }
                />
              )}
              {subError ? (
                <GlobalClientComponents.FalseFormValidationError
                  error={subError}
                />
              ) : (
                <>
                  {addendum && showAddendum && (
                    <p className="max-w-prose text-sm text-neutral-500">
                      {addendum}
                    </p>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <div className={clsx(topic === "moment" && "flex flex-col gap-y-8")}>
        {children}
      </div>
    </section>
  );
}

export function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="text-xl font-bold leading-none text-blue-950">{title}</h1>
  );
}

export function Divider() {
  return (
    <div className="h-px w-full origin-center scale-x-150 bg-neutral-200 md:scale-100"></div>
  );
}

export function FieldFlex({
  isLabel,
  hidden,
  children,
}: {
  isLabel?: boolean;
  hidden?: boolean;
  children: React.ReactNode;
}) {
  const className = "flex flex-col gap-2";

  return (
    <div className={clsx(hidden && "hidden")}>
      {isLabel ? (
        <label className={className}>{children}</label>
      ) : (
        <div className={clsx(className && className, "group/field")}>
          {children}
        </div>
      )}
    </div>
  );
}

export function FieldTitle({ title }: { title: string }) {
  return <p className="font-medium text-blue-950">{title}</p>;
}

export function FallbackFlex({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh_-_5rem)] flex-col items-center justify-center text-center">
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DefaultErrorBoundaryFallback() {
  return (
    <FallbackFlex>
      <p>Une erreur est survenue.</p>
    </FallbackFlex>
  );
}

function DefaultSuspenseFallback() {
  return (
    <FallbackFlex>
      <p>Loading...</p>
    </FallbackFlex>
  );
}

export function ErrorBoundarySuspense({
  ErrorBoundaryFallBack = <DefaultErrorBoundaryFallback />,
  SuspenseFallback = <DefaultSuspenseFallback />,
  children,
}: {
  ErrorBoundaryFallBack?: React.ReactNode;
  SuspenseFallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <ErrorBoundary fallback={ErrorBoundaryFallBack}>
        <Suspense fallback={SuspenseFallback}>{children}</Suspense>
      </ErrorBoundary>
    </>
  );
}

const globalAgnosticComponents = {
  Section,
  FormSection,
  PageTitle,
  Divider,
  FieldFlex,
  FieldTitle,
  FallbackFlex,
  ErrorBoundarySuspense,
} as const;

export type GlobalAgnosticComponentsName =
  keyof typeof globalAgnosticComponents;
