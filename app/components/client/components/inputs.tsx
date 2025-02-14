"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

/* IMPORTS */

// External imports

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import { isValid } from "date-fns";
import * as Switch from "@radix-ui/react-switch";

// Components imports

import * as AllGlobalIcons from "@/app/icons/agnostic";
import * as AllGlobalAgnosticComponents from "../../agnostic";

// Internal imports

import {
  baseInputTexts,
  focusVisibleTexts,
  notDatetimeLocalPadding,
  textareaPadding,
} from "@/app/constants/agnostic/globals";
import { EventStepDurationSchema } from "@/app/validations/agnostic/steps";

// Types imports

import type { ComponentProps } from "react";
import type { Option } from "@/app/types/agnostic/globals";
import type { SetState } from "@/app/types/client/globals";

/* LOGIC */

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
    <AllGlobalAgnosticComponents.FieldFlex
      isLabel={!fieldFlexIsNotLabel}
      hidden={hidden}
    >
      {label && (
        <div className="flex justify-between">
          <AllGlobalAgnosticComponents.FieldTitle title={label} />
          {children}
        </div>
      )}
      {description && (
        <AllGlobalAgnosticComponents.InputDescriptionOrError
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
              "peer relative z-30 w-full rounded-sm border-2 border-transparent bg-white bg-clip-padding",
              notDatetimeLocalPadding,
              "outline-hidden",
            )}
          />
          {/* gradient border */}
          {/* from-blue-500 original #5882f2 to-cyan-500 original #0fb8cb */}
          <div className="absolute inset-0 z-20 rounded-sm bg-linear-to-b from-[#5882f2] to-[#0fb8cb]"></div>
          {/* background merging foundation */}
          {/* [calc(100%+4px)] adds the original outline-offset-2 */}
          {/* -ml-[2px] -mt-[2px] make up for it in positioning */}
          <div className="absolute inset-0 z-10 -mt-[2px] -ml-[2px] size-[calc(100%+4px)] rounded-md bg-teal-50"></div>
          {/* gradient focus-visible */}
          {/* [calc(100%+8px)] adds the original outline-2 */}
          {/* -ml-[4px] -mt-[4px] make up for it in positioning */}
          {/* outline's rounded is more pronounced, lg is the exact fit */}
          <div className="invisible absolute inset-0 z-0 -mt-[4px] -ml-[4px] size-[calc(100%+8px)] rounded-lg bg-linear-to-b from-[#5882f2] to-[#0fb8cb] peer-focus-visible:visible"></div>
        </div>
      )}
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel={!fieldFlexIsNotLabel}>
      {label && (
        <div className="flex justify-between">
          <AllGlobalAgnosticComponents.FieldTitle title={label} />
          {children}
        </div>
      )}
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
              "peer relative z-30 w-full rounded-sm border-2 border-transparent bg-white bg-clip-padding",
              notDatetimeLocalPadding,
              "outline-hidden",
            )}
          />
          {/* gradient border */}
          {/* from-blue-500 original #5882f2 to-cyan-500 original #0fb8cb */}
          <div className="absolute inset-0 z-20 rounded-sm bg-linear-to-b from-[#5882f2] to-[#0fb8cb]"></div>
          {/* background merging foundation */}
          {/* [calc(100%+4px)] adds the original outline-offset-2 */}
          {/* -ml-[2px] -mt-[2px] make up for it in positioning */}
          <div className="absolute inset-0 z-10 -mt-[2px] -ml-[2px] size-[calc(100%+4px)] rounded-md bg-teal-50"></div>
          {/* gradient focus-visible */}
          {/* [calc(100%+8px)] adds the original outline-2 */}
          {/* -ml-[4px] -mt-[4px] make up for it in positioning */}
          {/* outline's rounded is more pronounced, lg is the exact fit */}
          <div className="invisible absolute inset-0 z-0 -mt-[4px] -ml-[4px] size-[calc(100%+8px)] rounded-lg bg-linear-to-b from-[#5882f2] to-[#0fb8cb] peer-focus-visible:visible"></div>
        </div>
      )}
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex
      isLabel={!fieldFlexIsNotLabel}
      hidden={hidden}
    >
      <div className="flex justify-between">
        <AllGlobalAgnosticComponents.FieldTitle title={label} />
        {children}
      </div>
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
            <AllGlobalIcons.ChevronDownMiniIcon className="size-5" />
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
                "w-full rounded-sm border-2 border-transparent bg-white bg-clip-padding outline-hidden",
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
              <AllGlobalIcons.ChevronDownMiniIcon className="size-5" />
            </div>
          </div>
          {/* gradient border */}
          {/* from-blue-500 original #5882f2 to-cyan-500 original #0fb8cb */}
          <div className="absolute inset-0 z-20 rounded-sm bg-linear-to-b from-[#5882f2] to-[#0fb8cb]"></div>
          {/* background merging foundation */}
          {/* [calc(100%+4px)] adds the original outline-offset-2 */}
          {/* -ml-[2px] -mt-[2px] make up for it in positioning */}
          <div className="absolute inset-0 z-10 -mt-[2px] -ml-[2px] size-[calc(100%+4px)] rounded-md bg-teal-50"></div>
          {/* gradient focus-visible */}
          {/* [calc(100%+8px)] adds the original outline-2 */}
          {/* -ml-[4px] -mt-[4px] make up for it in positioning */}
          {/* outline's rounded is more pronounced, lg is the exact fit */}
          <div className="invisible absolute inset-0 z-0 -mt-[4px] -ml-[4px] size-[calc(100%+8px)] rounded-lg bg-linear-to-b from-[#5882f2] to-[#0fb8cb] peer-has-focus-visible:visible"></div>
        </div>
      )}
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel={!fieldFlexIsNotLabel}>
      <div className="flex justify-between">
        <AllGlobalAgnosticComponents.FieldTitle title={label} />
        {children}
      </div>
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
            <AllGlobalIcons.ChevronDownMiniIcon className="size-5" />
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
                "w-full rounded-sm border-2 border-transparent bg-white bg-clip-padding outline-hidden",
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
              <AllGlobalIcons.ChevronDownMiniIcon className="size-5" />
            </div>
          </div>
          {/* gradient border */}
          {/* from-blue-500 original #5882f2 to-cyan-500 original #0fb8cb */}
          <div className="absolute inset-0 z-20 rounded-sm bg-linear-to-b from-[#5882f2] to-[#0fb8cb]"></div>
          {/* background merging foundation */}
          {/* [calc(100%+4px)] adds the original outline-offset-2 */}
          {/* -ml-[2px] -mt-[2px] make up for it in positioning */}
          <div className="absolute inset-0 z-10 -mt-[2px] -ml-[2px] size-[calc(100%+4px)] rounded-md bg-teal-50"></div>
          {/* gradient focus-visible */}
          {/* [calc(100%+8px)] adds the original outline-2 */}
          {/* -ml-[4px] -mt-[4px] make up for it in positioning */}
          {/* outline's rounded is more pronounced, lg is the exact fit */}
          <div className="invisible absolute inset-0 z-0 -mt-[4px] -ml-[4px] size-[calc(100%+8px)] rounded-lg bg-linear-to-b from-[#5882f2] to-[#0fb8cb] peer-has-focus-visible:visible"></div>
        </div>
      )}
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <div className="flex items-center gap-4 select-none">
        <AllGlobalAgnosticComponents.FieldTitle title={label} />
        <Switch.Root
          name={name}
          // reset and submit are not correctly resetting this input with defaultChecked, so it has to be controlled // later solved with keys
          // now going for uncontrolled, so using back defaultChecked
          defaultChecked={defaultChecked}
          required={required}
          className={clsx(
            "w-12 rounded-full bg-blue-500 p-[2px] shadow-inner shadow-black/50 transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:bg-blue-300 data-[state=checked]:bg-cyan-500 data-[state=checked]:hover:bg-cyan-400 data-[state=checked]:focus-visible:outline-cyan-400 data-[state=checked]:active:bg-cyan-300",
          )}
        >
          <Switch.Thumb
            className={clsx(
              "block size-6 rounded-[calc(1.5rem/2)] bg-gray-100 shadow-xs transition duration-150 data-[state=checked]:bg-white",
              "data-[state=checked]:translate-x-5",
            )}
          />
        </Switch.Root>
      </div>
      <AllGlobalAgnosticComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <div className="flex items-center gap-4 select-none">
        <AllGlobalAgnosticComponents.FieldTitle title={label} />
        <Switch.Root
          name={name}
          checked={definedValue}
          onCheckedChange={definedOnValueChange}
          className={clsx(
            "w-12 rounded-full bg-blue-500 p-[2px] shadow-inner shadow-black/50 transition hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:bg-blue-300 data-[state=checked]:bg-cyan-500 data-[state=checked]:hover:bg-cyan-400 data-[state=checked]:focus-visible:outline-cyan-400 data-[state=checked]:active:bg-cyan-300",
          )}
        >
          <Switch.Thumb
            className={clsx(
              "block size-6 rounded-[calc(1.5rem/2)] bg-gray-100 shadow-xs transition duration-150 data-[state=checked]:bg-white",
              "data-[state=checked]:translate-x-5",
            )}
          />
        </Switch.Root>
      </div>
      <AllGlobalAgnosticComponents.InputDescriptionOrError
        errors={errors}
        description={description}
      />
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <AllGlobalAgnosticComponents.FieldTitle title={label} />
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <AllGlobalAgnosticComponents.FieldTitle title={label} />
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <div className="flex items-baseline justify-between">
        {label && <AllGlobalAgnosticComponents.FieldTitle title={label} />}
        {children}
      </div>
      {description && (
        <p className="text-sm text-neutral-500 select-none">{description}</p>
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
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <div className="flex items-baseline justify-between">
        {label && <AllGlobalAgnosticComponents.FieldTitle title={label} />}
        {children}
      </div>
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <AllGlobalAgnosticComponents.FieldTitle title={label} />
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
    </AllGlobalAgnosticComponents.FieldFlex>
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
    <AllGlobalAgnosticComponents.FieldFlex isLabel>
      <AllGlobalAgnosticComponents.FieldTitle title={label} />
      <AllGlobalAgnosticComponents.InputDescriptionOrError
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
    </AllGlobalAgnosticComponents.FieldFlex>
  );
}

const inputsClientComponents = {
  InputText,
  InputTextControlled,
  SelectWithOptions,
  SelectWithOptionsControlled,
  Textarea,
  TextareaControlled,
  InputNumber,
  InputNumberControlled,
  InputDatetimeLocal,
  InputDatetimeLocalControlled,
} as const;

export type InputsClientComponentsName = keyof typeof inputsClientComponents;

/* Notes
For now I just want all of my components to be Client Components. It's once the projet gets running that I'll want to optimize between Client Components and Server Components.
*/
