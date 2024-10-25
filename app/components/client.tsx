"use client";

import { ComponentProps, MouseEventHandler } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import { isValid } from "date-fns";

import * as Icons from "@/app/icons";
import * as GlocalServerComponents from "./server";
import { Option, SetState } from "@/app/types/globals";
import { EventStepDurationSchema } from "@/app/validations/steps";
import { CreateOrUpdateMomentState } from "@/app/types/moments";
import {
  baseInputTexts,
  focusVisibleTexts,
  notDatetimeLocalPadding,
  textareaPadding,
} from "../data/globals";

// Components

export function FormValidationError({
  error,
  setCreateOrUpdateMomentState,
  removeMessagesAndErrorsCallback,
}: {
  error: string;
  setCreateOrUpdateMomentState?: SetState<CreateOrUpdateMomentState>;
  removeMessagesAndErrorsCallback?: (
    s: CreateOrUpdateMomentState,
  ) => CreateOrUpdateMomentState; // could be more precise but true
}) {
  function handleClick() {
    if (setCreateOrUpdateMomentState && removeMessagesAndErrorsCallback)
      setCreateOrUpdateMomentState(removeMessagesAndErrorsCallback);
  }

  return (
    <p
      className={clsx(
        "max-w-prose text-sm text-pink-500",
        setCreateOrUpdateMomentState &&
          removeMessagesAndErrorsCallback &&
          "hover:cursor-pointer",
      )}
      onClick={handleClick}
    >
      {error}
    </p>
  );
}

// IMPORTANT: inputs and all will have to be upgraded to ComponentProps
export function InputText({
  label,
  description,
  addendum,
  name,
  tekTime,
  children,
  fieldFlexIsNotLabel,
  required = true,
  errors,
  hidden,
  ...rest
}: {
  label?: string;
  description?: string; // optional for search
  addendum?: string;
  name: string;
  tekTime?: boolean;
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
  errors?: string[];
  hidden?: boolean;
} & ComponentProps<"input">) {
  return (
    <GlocalServerComponents.FieldFlex
      isLabel={!fieldFlexIsNotLabel}
      hidden={hidden}
    >
      {label && (
        <div className="flex justify-between">
          <GlocalServerComponents.FieldTitle title={label} />
          {children}
        </div>
      )}
      {description && (
        <GlocalServerComponents.InputDescriptionOrError
          errors={errors}
          description={description}
          addendum={addendum}
        />
      )}
      {!tekTime ? (
        <input
          {...rest}
          type="text"
          name={name}
          required={required}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className={clsx(
            baseInputTexts,
            notDatetimeLocalPadding,
            focusVisibleTexts,
          )}
        />
      ) : (
        <div className="relative">
          <input
            {...rest}
            type="text"
            name={name}
            required={required}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            className={clsx(
              "peer relative z-30 w-full rounded border-2 border-transparent bg-white bg-clip-padding",
              notDatetimeLocalPadding,
              "outline-none",
            )}
          />
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
          <div className="invisible absolute inset-0 z-0 -ml-[4px] -mt-[4px] size-[calc(100%+8px)] rounded-lg bg-gradient-to-b from-[#5882f2] to-[#0fb8cb] peer-focus-visible:visible"></div>
        </div>
      )}
    </GlocalServerComponents.FieldFlex>
  );
}

// In the future, I hope to make uncontrolled and controlled into a single component, perhaps even defined by: if (definedValue) controlled else uncontrolled, which in fact is exactly how React behaves natively.
// Also, description are now obliged because they now transform into errors.
export function InputTextControlled({
  label,
  description,
  addendum,
  name,
  definedValue,
  definedOnValueChange = () => {},
  tekTime,
  children,
  fieldFlexIsNotLabel,
  required = true,
  errors,
  ...rest
}: {
  label?: string;
  description: string;
  addendum?: string;
  name: string;
  definedValue?: string;
  definedOnValueChange?: SetState<string>;
  tekTime?: boolean;
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
  errors?: string[];
} & ComponentProps<"input">) {
  return (
    <GlocalServerComponents.FieldFlex isLabel={!fieldFlexIsNotLabel}>
      {label && (
        <div className="flex justify-between">
          <GlocalServerComponents.FieldTitle title={label} />
          {children}
        </div>
      )}
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
        addendum={addendum}
      />
      {!tekTime ? (
        <input
          {...rest}
          type="text"
          name={name}
          value={definedValue}
          onChange={(event) => definedOnValueChange(event.currentTarget.value)}
          required={required}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className={clsx(
            baseInputTexts,
            notDatetimeLocalPadding,
            focusVisibleTexts,
          )}
        />
      ) : (
        <div className="relative">
          <input
            {...rest}
            type="text"
            name={name}
            value={definedValue}
            onChange={(event) =>
              definedOnValueChange(event.currentTarget.value)
            }
            required={required}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            className={clsx(
              "peer relative z-30 w-full rounded border-2 border-transparent bg-white bg-clip-padding",
              notDatetimeLocalPadding,
              "outline-none",
            )}
          />
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
          <div className="invisible absolute inset-0 z-0 -ml-[4px] -mt-[4px] size-[calc(100%+8px)] rounded-lg bg-gradient-to-b from-[#5882f2] to-[#0fb8cb] peer-focus-visible:visible"></div>
        </div>
      )}
    </GlocalServerComponents.FieldFlex>
  );
}

export function SelectWithOptionsControlled({
  id,
  label,
  description,
  addendum,
  name,
  definedValue,
  definedOnValueChange = () => {},
  placeholder = "Choose...",
  options,
  children,
  fieldFlexIsNotLabel,
  required = true,
  errors,
  tekTime,
}: {
  id?: string;
  label: string;
  description: string;
  addendum?: string;
  definedValue?: string;
  definedOnValueChange?: SetState<string>;
  name: string;
  placeholder?: string;
  options: Option[];
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
  errors?: string[];
  tekTime?: boolean;
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel={!fieldFlexIsNotLabel}>
      <div className="flex justify-between">
        <GlocalServerComponents.FieldTitle title={label} />
        {children}
      </div>
      <GlocalServerComponents.InputDescriptionOrError
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
            value={definedValue}
            onChange={(event) =>
              definedOnValueChange(event.currentTarget.value)
            }
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
              value={definedValue}
              onChange={(event) =>
                definedOnValueChange(event.currentTarget.value)
              }
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
    </GlocalServerComponents.FieldFlex>
  );
}

export function Textarea({
  form,
  label,
  description,
  name,
  defaultValue,
  rows = 4,
  required = true,
  errors,
}: {
  form?: string;
  label: string;
  description: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <GlocalServerComponents.FieldTitle title={label} />
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
      <textarea
        form={form}
        name={name}
        defaultValue={defaultValue}
        required={required}
        // No line breaks.
        // ...But I'm sure it can still be circumvented by some copypasting. Something to explore.
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        rows={rows}
        className={clsx(
          "resize-none",
          baseInputTexts,
          textareaPadding,
          focusVisibleTexts,
        )}
      />
    </GlocalServerComponents.FieldFlex>
  );
}

export function TextareaControlled({
  form,
  label,
  description,
  name,
  definedValue,
  definedOnValueChange = () => {},
  rows = 4,
  required = true,
  errors,
}: {
  form?: string;
  label: string;
  description: string;
  name: string;
  definedValue?: string;
  definedOnValueChange?: SetState<string>;
  rows?: number;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <GlocalServerComponents.FieldTitle title={label} />
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
      <textarea
        form={form}
        name={name}
        value={definedValue}
        onChange={(event) => definedOnValueChange(event.currentTarget.value)}
        required={required}
        // No line breaks.
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        rows={rows}
        className={clsx(
          "resize-none",
          baseInputTexts,
          textareaPadding,
          focusVisibleTexts,
        )}
      />
    </GlocalServerComponents.FieldFlex>
  );
}

// IMPORTANT: input type number as a browser default does not show an error when the form fails to submit on mobile.
// (Same for input datetime-local.)
export function InputNumber({
  form,
  label,
  description,
  name,
  defaultValue = "0",
  step,
  min = "0",
  max,
  children,
}: {
  form?: string;
  label: string;
  name: string;
  description?: string;
  defaultValue?: string;
  step?: string;
  min?: string;
  max?: string;
  children?: React.ReactNode;
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <div className="flex items-baseline justify-between">
        {label && <GlocalServerComponents.FieldTitle title={label} />}
        {children}
      </div>
      {description && (
        <p className="select-none text-sm text-neutral-500">{description}</p>
      )}
      <div className="grid grid-cols-2 gap-4">
        <input
          form={form}
          type="number"
          name={name}
          defaultValue={defaultValue}
          step={step}
          min={min}
          max={max}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className={clsx(
            baseInputTexts,
            notDatetimeLocalPadding,
            focusVisibleTexts,
          )}
        />
        <div className="flex items-center">
          <p>minutes</p>
        </div>
      </div>
    </GlocalServerComponents.FieldFlex>
  );
}

export function InputNumberControlled({
  form,
  label,
  description,
  name,
  definedValue,
  definedOnValueChange = () => {},
  step,
  min = "0",
  max,
  required = true,
  errors,
  schema, // indispensible with noValidate
  children,
}: {
  form?: string;
  label: string;
  name: string;
  description: string;
  definedValue?: string;
  definedOnValueChange?: SetState<string>;
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
  errors?: string[];
  schema: typeof EventStepDurationSchema; // project-specific
  children?: React.ReactNode;
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <div className="flex items-baseline justify-between">
        {label && <GlocalServerComponents.FieldTitle title={label} />}
        {children}
      </div>
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
      <div className="grid grid-cols-2 gap-4">
        <input
          form={form}
          type="number"
          name={name}
          value={definedValue}
          // because the field is controlled and immediately impacts the UI with calculations, I'm specifically using zod directly on the onChange event to make sure an incorrect data can never be registered even on the client itself
          // event.currentTarget.value doesn't differentiate between an empty string and any string here
          // so that means I need to allow strings in there but consider that they should always be understood as 0
          onChange={(event) => {
            const value = event.currentTarget.value;
            // no .valueAsNumber because indeed invalids are all empty strings
            const validatedFields = schema.safeParse({
              eventStepDuration: +value,
            });
            if (validatedFields.success) {
              const { eventStepDuration } = validatedFields.data;
              definedOnValueChange(eventStepDuration.toString());
            }
          }}
          step={step}
          min={min}
          max={max}
          required={required}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className={clsx(
            baseInputTexts,
            notDatetimeLocalPadding,
            focusVisibleTexts,
          )}
        />
        <div className="flex items-center">
          <p>minutes</p>
        </div>
      </div>
    </GlocalServerComponents.FieldFlex>
  );
}

export function InputDatetimeLocal({
  label,
  name,
  description,
  defaultValue,
  min,
  max,
  required = true,
  errors,
}: {
  label: string;
  name: string;
  description: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <GlocalServerComponents.FieldTitle title={label} />
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
      <input
        // because it is so impossible to deeply modify the input datetime-local defaults, I'm forced to adapt all of my other inputs to some of its defaults (like their padding)
        type="datetime-local"
        name={name}
        defaultValue={defaultValue}
        min={min}
        max={max}
        required={required}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        className={clsx(
          "p-2",
          baseInputTexts,
          focusVisibleTexts,
          "w-full appearance-none",
        )}
      />
    </GlocalServerComponents.FieldFlex>
  );
}

export function InputDatetimeLocalControlled({
  label,
  name,
  description,
  definedValue,
  definedOnValueChange = () => {},
  min,
  max,
  required = true,
  errors,
}: {
  label: string;
  name: string;
  description: string;
  definedValue: string;
  definedOnValueChange: SetState<string>;
  min?: string;
  max?: string;
  required?: boolean;
  errors?: string[];
}) {
  return (
    <GlocalServerComponents.FieldFlex isLabel>
      <GlocalServerComponents.FieldTitle title={label} />
      <GlocalServerComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
      <input
        // because it is so impossible to deeply modify the input datetime-local defaults, I'm forced to adapt all of my other inputs to some of its defaults (like their padding)
        type="datetime-local"
        name={name}
        value={definedValue}
        onChange={(event) => {
          // no .valueAsDate because it's as a string that it can be set in the setState and understood by the HTML input
          const value = event.currentTarget.value;
          // ...incredible stuff
          if (isValid(new Date(value))) definedOnValueChange(value);
        }}
        min={min}
        max={max}
        required={required}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        className={clsx(
          "p-2",
          baseInputTexts,
          focusVisibleTexts,
          "w-full appearance-none",
        )}
      />
    </GlocalServerComponents.FieldFlex>
  );
}

// This is the perfect example of what Sam Selikoff called a bad abstraction, which will have to evolve in the final version.
// https://www.youtube.com/watch?v=9iJK-Vl6PhE&t=693s&pp=ygUMc2FtIHNlbGlrb2Zm
export function Button({
  form,
  type,
  variant,
  disabled,
  isDedicatedDisabled,
  formAction,
  onClick,
  children,
}: {
  form?: string;
  type?: "button" | "submit" | "reset";
  variant:
    | "destroy"
    | "destroy-step"
    | "neutral"
    | "confirm"
    | "cancel"
    | "destroy-step"
    | "confirm-step"
    | "cancel-step";
  disabled?: boolean;
  isDedicatedDisabled?: boolean;
  formAction?: string | ((formData: FormData) => void);
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  const showDisabledStyles =
    isDedicatedDisabled || (isDedicatedDisabled === undefined && disabled);

  // add a disable that does not affect disable styles //

  const destroy =
    "w-fit px-1 text-sm text-blue-500 hover:text-blue-600 focus-visible:rounded focus-visible:outline-blue-500 active:text-blue-400";
  const destroyStep = clsx(
    "w-fit px-1 text-sm text-cyan-500 hover:text-cyan-600 focus-visible:rounded focus-visible:outline-cyan-500 active:text-cyan-400",
    showDisabledStyles && "disabled:grayscale disabled:hover:text-cyan-500",
  );
  const notDestroy = "w-full rounded border py-2";
  const neutral =
    "border-[#e5e7eb] bg-neutral-100 px-3 text-neutral-900 hover:!bg-neutral-200 hover:!text-neutral-950 focus-visible:outline-neutral-900 group-hover/field:bg-neutral-50 group-hover/field:text-neutral-800";
  // disabled:border-neutral-800 disabled:bg-neutral-800
  const confirm = clsx(
    "border-blue-500 bg-blue-500 px-6 text-white hover:border-blue-600 hover:bg-blue-600 focus-visible:outline-blue-500 active:border-blue-400 active:bg-blue-400",
    // ensure disabled styles are only applied if the button is disabled by its own dedicated action, and are not applied if the button is disabled by another action... in fact, more like isDedicatedDisabled, differentiating disabled of function only from disabled of function and style
    showDisabledStyles &&
      "disabled:grayscale disabled:hover:border-blue-500 disabled:hover:bg-blue-500",
  );
  // no disable styles on cancel for now because deleting a moment is currently fast enough that it's not worth highlighting visually
  const cancel =
    "border-blue-500 bg-white px-6 text-blue-500 hover:border-blue-600 hover:text-blue-600 focus-visible:outline-blue-500 active:border-blue-400 active:text-blue-400";
  const confirmStep =
    "border-cyan-500 bg-cyan-500 px-6 text-white hover:border-cyan-600 hover:bg-cyan-600 focus-visible:outline-cyan-500 active:border-cyan-400 active:bg-cyan-400";
  // disabled:border-neutral-500 disabled:text-neutral-500 bg-current
  const cancelStep = clsx(
    "border-cyan-500 bg-white px-6 text-cyan-500 hover:border-cyan-600 hover:text-cyan-600 focus-visible:outline-cyan-500 active:border-cyan-400 active:text-cyan-400",
    showDisabledStyles &&
      "disabled:grayscale disabled:hover:border-cyan-500 disabled:hover:text-cyan-500",
  );

  // mostly superfluous, but serves as an absolute safety, especially now that I'm turning all handlers into startTransition-powered actions
  const status = useFormStatus();

  return (
    <button
      form={form}
      type={type}
      disabled={disabled ? status.pending || disabled : status.pending}
      className={clsx(
        "font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:duration-0",
        variant === "destroy" && clsx(destroy),
        variant === "destroy-step" && clsx(destroyStep),
        variant === "neutral" && clsx(notDestroy, neutral, "md:w-fit"),
        variant === "confirm" && clsx(notDestroy, confirm),
        variant === "cancel" && clsx(notDestroy, cancel),
        variant === "confirm-step" && clsx(notDestroy, confirmStep),
        variant === "cancel-step" && clsx(notDestroy, cancelStep),
      )}
      // yeah I'm not using that action/formAction prop anymore
      formAction={formAction}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const globalClientComponents = {
  FormValidationError,
  InputText,
  InputTextControlled,
  SelectWithOptionsControlled,
  Textarea,
  TextareaControlled,
  InputNumber,
  InputNumberControlled,
  InputDatetimeLocal,
  InputDatetimeLocalControlled,
  Button,
} as const;

export type GlobalClientComponentsName = keyof typeof globalClientComponents;

/* Notes
For now I just want all of my components to be Client Components. It's once the projet gets running that I'll want to optimize between Client Components and Server Components.
*/
