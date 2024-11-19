import * as Switch from "@radix-ui/react-switch";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

import * as Icons from "@/app/icons";
import * as GlobalClientComponents from "./client";
import { Option, SetState } from "@/app/types/globals";
import {
  FalseCreateOrUpdateMomentState,
  FormSectionTopic,
  CreateOrUpdateMomentState,
} from "@/app/types/moments";
import {
  baseInputTexts,
  focusVisibleTexts,
  notDatetimeLocalPadding,
} from "@/app/constants/globals";
import {
  removeMomentMessagesAndErrorsCallback,
  removeStepsMessagesAndErrorsCallback,
} from "@/app/utilities/moments";

// Components

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

function FalseFormDescriptionOrError({
  error,
  description,
  setCreateOrUpdateMomentState,
  removeMessagesAndErrorsCallback,
}: {
  error?: string;
  description: string;
  setCreateOrUpdateMomentState?: SetState<FalseCreateOrUpdateMomentState>;
  removeMessagesAndErrorsCallback?: (
    s: FalseCreateOrUpdateMomentState,
  ) => FalseCreateOrUpdateMomentState;
}) {
  return (
    <>
      {error &&
      setCreateOrUpdateMomentState &&
      removeMessagesAndErrorsCallback ? (
        <GlobalClientComponents.FalseFormValidationError
          error={error}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={removeMessagesAndErrorsCallback}
        />
      ) : (
        <p className="max-w-prose text-sm text-neutral-500">{description}</p>
      )}
    </>
  );
}

function FormDescriptionOrError({
  error,
  description,
  setCreateOrUpdateMomentState,
  removeMessagesAndErrorsCallback,
}: {
  error?: string;
  description: string;
  setCreateOrUpdateMomentState?: SetState<CreateOrUpdateMomentState>;
  removeMessagesAndErrorsCallback?: (
    s: CreateOrUpdateMomentState,
  ) => CreateOrUpdateMomentState;
}) {
  return (
    <>
      {error &&
      setCreateOrUpdateMomentState &&
      removeMessagesAndErrorsCallback ? (
        <GlobalClientComponents.FormValidationError
          error={error}
          setCreateOrUpdateMomentState={setCreateOrUpdateMomentState}
          removeMessagesAndErrorsCallback={removeMessagesAndErrorsCallback}
        />
      ) : (
        <p className="max-w-prose text-sm text-neutral-500">{description}</p>
      )}
    </>
  );
}

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
                <FalseFormDescriptionOrError
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
                <FormDescriptionOrError
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

function InputValidationError({ errors }: { errors: string[] }) {
  return (
    <>
      {errors.map((error, i) => {
        if (i === 0)
          return (
            <p key={i} className="select-none text-sm text-pink-500">
              {error}
              {errors.length > 1 && (
                <span className="text-pink-300"> (+{errors.length - 1})</span>
              )}
            </p>
          );
      })}
    </>
  );
}

export function InputDescriptionOrError({
  errors,
  description,
  addendum,
}: {
  errors?: string[];
  description: string;
  addendum?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      {errors ? (
        <InputValidationError errors={errors} />
      ) : (
        <p className="select-none text-sm text-neutral-500">{description}</p>
      )}
      {addendum && (
        <p className="select-none text-sm text-neutral-500">({addendum})</p>
      )}
    </div>
  );
}

export function SelectWithOptions({
  id,
  label,
  description,
  addendum,
  name,
  defaultValue = "",
  placeholder = "Choose...",
  options,
  children,
  fieldFlexIsNotLabel,
  required = true,
  errors,
  tekTime,
  hidden,
}: {
  id?: string;
  label: string;
  description: string;
  addendum?: string;
  defaultValue?: string;
  name: string;
  placeholder?: string;
  options: Option[];
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
  errors?: string[];
  tekTime?: boolean;
  hidden?: boolean;
}) {
  return (
    <FieldFlex isLabel={!fieldFlexIsNotLabel} hidden={hidden}>
      <div className="flex justify-between">
        <FieldTitle title={label} />
        {children}
      </div>
      <InputDescriptionOrError
        errors={errors}
        description={description}
        addendum={addendum}
      />
      {!tekTime ? (
        <div className="relative grid">
          <select
            className={clsx(
              "col-start-1 row-start-1 appearance-none",
              baseInputTexts,
              notDatetimeLocalPadding,
              focusVisibleTexts,
            )}
            id={id}
            name={name}
            defaultValue={defaultValue}
            required={required}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.key} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0.5 right-2.5 col-start-1 row-start-1 flex w-7 flex-col items-end justify-center bg-white">
            <Icons.ChevronDownMini className="size-5" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="peer relative z-30 grid">
            <select
              className={clsx(
                "col-start-1 row-start-1 appearance-none",
                // baseInputTexts,
                notDatetimeLocalPadding,
                // focusVisibleTexts,
                "w-full rounded border-2 border-transparent bg-white bg-clip-padding outline-none",
              )}
              id={id}
              name={name}
              defaultValue={defaultValue}
              required={required}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option) => (
                <option key={option.key} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0.5 right-2.5 col-start-1 row-start-1 flex w-7 flex-col items-end justify-center bg-white">
              <Icons.ChevronDownMini className="size-5" />
            </div>
          </div>
          {/* gradient border */}
          {/* from-blue-500 original #5882f2 to-cyan-500 original #0fb8cb */}
          <div className="absolute inset-0 z-20 rounded bg-gradient-to-b from-[#5882f2] to-[#0fb8cb]"></div>
          {/* background merging foundation */}
          {/* [calc(100%+4px)] adds the original outline-offset-2 */}
          {/* -ml-[2px] -mt-[2px] make up for it in positioning */}
          <div className="absolute inset-0 z-10 -ml-[2px] -mt-[2px] size-[calc(100%+4px)] rounded-md bg-teal-50"></div>
          {/* gradient focus-visible */}
          {/* [calc(100%+8px)] adds the original outline-2 */}
          {/* -ml-[4px] -mt-[4px] make up for it in positioning */}
          {/* outline's rounded is more pronounced, lg is the exact fit */}
          <div className="invisible absolute inset-0 z-0 -ml-[4px] -mt-[4px] size-[calc(100%+8px)] rounded-lg bg-gradient-to-b from-[#5882f2] to-[#0fb8cb] peer-has-[:focus-visible]:visible"></div>
        </div>
      )}
    </FieldFlex>
  );
}

// Modified from Advanced Radix UI's Animated Switch
export function InputSwitch({
  label,
  name,
  defaultChecked,
  description,
  required = true,
  errors,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  description: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <FieldFlex isLabel>
      <div className="flex select-none items-center gap-4">
        <FieldTitle title={label} />
        <Switch.Root
          name={name}
          // reset and submit are not correctly resetting this input with defaultChecked, so it has to be controlled // later solved with keys
          // now going for uncontrolled, so using back defaultChecked
          defaultChecked={defaultChecked}
          required={required}
          className={clsx(
            "w-12 rounded-full bg-blue-500 p-[2px] shadow-inner shadow-black/50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:bg-blue-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:focus-visible:outline-cyan-400 data-[state=checked]:active:bg-cyan-400",
          )}
        >
          <Switch.Thumb
            className={clsx(
              "block size-6 rounded-[calc(1.5rem/2)] bg-gray-100 shadow-sm transition duration-150 data-[state=checked]:bg-white",
              "data-[state=checked]:translate-x-5",
            )}
          />
        </Switch.Root>
      </div>
      <InputDescriptionOrError errors={errors} description={description} />
    </FieldFlex>
  );
}

// Modified from Advanced Radix UI's Animated Switch
export function InputSwitchControlled({
  label,
  name,
  description,
  definedValue,
  definedOnValueChange = () => {},
  errors,
}: {
  label: string;
  name: string;
  description: string;
  definedValue?: boolean;
  definedOnValueChange?: SetState<boolean>;
  errors?: string[];
}) {
  return (
    <FieldFlex isLabel>
      <div className="flex select-none items-center gap-4">
        <FieldTitle title={label} />
        <Switch.Root
          name={name}
          checked={definedValue}
          onCheckedChange={definedOnValueChange}
          className={clsx(
            "w-12 rounded-full bg-blue-500 p-[2px] shadow-inner shadow-black/50 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:bg-blue-400 data-[state=checked]:bg-cyan-500 data-[state=checked]:focus-visible:outline-cyan-400 data-[state=checked]:active:bg-cyan-400",
          )}
        >
          <Switch.Thumb
            className={clsx(
              "block size-6 rounded-[calc(1.5rem/2)] bg-gray-100 shadow-sm transition duration-150 data-[state=checked]:bg-white",
              "data-[state=checked]:translate-x-5",
            )}
          />
        </Switch.Root>
      </div>
      <InputDescriptionOrError errors={errors} description={description} />
    </FieldFlex>
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

export function DefaultErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <FallbackFlex>
          <p>Une erreur est survenue.</p>
        </FallbackFlex>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function DefaultSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <FallbackFlex>
          <p>Loading...</p>
        </FallbackFlex>
      }
    >
      {children}
    </Suspense>
  );
}

/* Notes
For now I just want all of my components to be Client Components. It's once the projet gets running that I'll want to optimize between Client Components and Server Components.
*/

const globalServerComponents = {
  PageTitle,
  Divider,
  FormDescriptionOrError: FalseFormDescriptionOrError,
  Section,
  FormSection,
  InputValidationError,
  InputDescriptionOrError,
  SelectWithOptions,
  InputSwitch,
  InputSwitchControlled,
  FieldFlex,
  FieldTitle,
  FallbackFlex,
  DefaultErrorBoundary,
  DefaultSuspense,
} as const;

export type GlobalServerComponentsName = keyof typeof globalServerComponents;
