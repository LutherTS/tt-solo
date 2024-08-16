"use client";

import {
  ComponentProps,
  Dispatch,
  MouseEventHandler,
  SetStateAction,
} from "react";
import { useFormStatus } from "react-dom";

import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]
import * as Switch from "@radix-ui/react-switch";

// Variables

// temporarily change variable name to className for Intellisense
// (or add it to "tailwindCSS.classAttributes" in VSCode settings)
// wrap variable string with clsx() for Prettier sorting
// or in a tw template literal // .prettierrc – "tailwindFunctions": ["tw"]

// border-[#e5e7eb] is the browser's default for border color if needed
const baseInputTexts = clsx(
  "rounded border-2 border-[#e5e7eb] bg-white transition-colors duration-0 hover:border-neutral-100 hover:duration-150",
);

const notDatetimeLocalPadding = clsx("px-3 py-2");

const textareaPadding = clsx("px-3 py-3");

const focusVisibleTexts = clsx(
  "focus-visible:border-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500",
);

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

export function SectionWrapper({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-white p-5 shadow-sm">{children}</div>;
}

export function Section({
  title,
  description,
  showDescription = true,
  addendum,
  showAddendum = true,
  children,
}: {
  title?: string;
  description?: string;
  showDescription?: boolean;
  addendum?: string;
  showAddendum?: boolean;
  children: React.ReactNode;
}) {
  return (
    // pb-1 making up for input padding inconsistencies
    <section className="grid items-baseline gap-8 pb-1 md:grid-cols-[1fr_2fr]">
      <div
        className={clsx(
          !title && "hidden md:block",
          description && showDescription && "flex flex-col gap-y-4",
        )}
      >
        {title && (
          <>
            <h2 className="text-lg font-semibold text-blue-950">{title}</h2>
            {description && showDescription && (
              // Last handmade padding fix...
              <p className="-mt-1 max-w-prose text-sm text-neutral-500">
                {description}
              </p>
            )}
            {addendum && showAddendum && (
              <p className="-mt-1 max-w-prose text-sm text-neutral-500">
                {addendum}
              </p>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col gap-y-8">{children}</div>
    </section>
  );
}

export function InputText({
  label,
  description,
  addendum,
  name,
  tekTime,
  children,
  fieldFlexIsNotLabel,
  required = true,
  ...rest
}: {
  label?: string;
  description?: string;
  addendum?: string;
  name: string;
  tekTime?: boolean;
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
} & ComponentProps<"input">) {
  return (
    <FieldFlex isLabel={!fieldFlexIsNotLabel}>
      <div className="flex justify-between">
        {label && <FieldTitle title={label} />}
        {children}
      </div>
      {description && (
        <div className="flex flex-col gap-1">
          <p className="select-none text-sm text-neutral-500">{description}</p>
          {addendum && (
            <p className="select-none text-sm text-neutral-500">({addendum})</p>
          )}
        </div>
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
          <div className="invisible absolute inset-0 z-0 -ml-[4px] -mt-[4px] size-[calc(100%+8px)] rounded-lg bg-gradient-to-b from-[#5882f2] to-[#0fb8cb] peer-focus-visible:visible"></div>
          {/* outline's rounded is more pronounced, lg is the exact fit */}
        </div>
      )}
    </FieldFlex>
  );
}

type Option = {
  key: number;
  label: string;
  value: string;
};

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
  tekTime,
}: {
  id?: string;
  label: string;
  description?: string;
  addendum?: string;
  defaultValue?: string;
  name: string;
  placeholder?: string;
  options: Option[];
  children?: React.ReactNode;
  fieldFlexIsNotLabel?: boolean;
  required?: boolean;
  tekTime?: boolean;
}) {
  return (
    <FieldFlex isLabel={!fieldFlexIsNotLabel}>
      <div className="flex justify-between">
        <FieldTitle title={label} />
        {children}
      </div>
      {description && (
        <div className="flex flex-col gap-1">
          <p className="select-none text-sm text-neutral-500">{description}</p>
          {addendum && (
            <p className="select-none text-sm text-neutral-500">({addendum})</p>
          )}
        </div>
      )}
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
            <ChevronDownIcon className="size-5" />
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
              <ChevronDownIcon className="size-5" />
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
          <div className="invisible absolute inset-0 z-0 -ml-[4px] -mt-[4px] size-[calc(100%+8px)] rounded-lg bg-gradient-to-b from-[#5882f2] to-[#0fb8cb] peer-has-[:focus-visible]:visible"></div>
          {/* outline's rounded is more pronounced, lg is the exact fit */}
        </div>
      )}
    </FieldFlex>
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
}: {
  form?: string;
  label: string;
  description?: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <FieldFlex isLabel>
      <FieldTitle title={label} />
      {description && (
        <p className="select-none text-sm text-neutral-500">{description}</p>
      )}
      <textarea
        form={form}
        name={name}
        defaultValue={defaultValue}
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
    </FieldFlex>
  );
}

// Modified from Advanced Radix UI's Animated Switch
export function InputSwitchControlled({
  label,
  name,
  description,
  definedValue = false,
  definedOnValueChange = () => {},
}: {
  label: string;
  name: string;
  description?: string;
  definedValue?: boolean;
  definedOnValueChange?: Dispatch<SetStateAction<boolean>>;
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
      {description && (
        <p className="select-none text-sm text-neutral-500">{description}</p>
      )}
    </FieldFlex>
  );
}

// IMPORTANT: input type number as a browser default does not show an error when the form fails to submit on mobile, so do remember the importance of server-side validations.
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
}: {
  form?: string;
  label: string;
  name: string;
  description?: string;
  defaultValue?: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <FieldFlex isLabel>
      <FieldTitle title={label} />
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
    </FieldFlex>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className || "size-5"}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
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
}: {
  label: string;
  name: string;
  description?: string;
  definedValue: string;
  definedOnValueChange: Dispatch<SetStateAction<string>>;
  min?: string;
  max?: string;
}) {
  return (
    <FieldFlex isLabel>
      <FieldTitle title={label} />
      {description && (
        <p className="select-none text-sm text-neutral-500">{description}</p>
      )}
      <input
        // because it is so impossible to deeply modify the input datetime-local defaults, I'm forced to adapt all of my other inputs to some of its defaults (like their padding)
        type="datetime-local"
        name={name}
        value={definedValue}
        onChange={(event) => definedOnValueChange(event.currentTarget.value)}
        min={min}
        max={max}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault();
        }}
        className={clsx("p-2", baseInputTexts, focusVisibleTexts)}
      />
    </FieldFlex>
  );
}

export function FieldFlex({
  isLabel,
  children,
}: {
  isLabel?: boolean;
  children: React.ReactNode;
}) {
  const className = "flex flex-col gap-2";

  return (
    <>
      {isLabel ? (
        <label className={className}>{children}</label>
      ) : (
        <div className={clsx(className && className, "group/field")}>
          {children}
        </div>
      )}
    </>
  );
}

export function FieldTitle({ title }: { title: string }) {
  return <p className="font-medium text-blue-950">{title}</p>;
}

export function Button({
  form,
  type,
  variant,
  disabled,
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
  formAction?: string | ((formData: FormData) => void);
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}) {
  const destroy =
    "w-fit px-1 text-sm text-blue-500 hover:text-blue-600 focus-visible:rounded focus-visible:outline-blue-500 active:text-blue-400";
  const destroyStep =
    "w-fit px-1 text-sm text-cyan-500 hover:text-cyan-600 focus-visible:rounded focus-visible:outline-cyan-500 active:text-cyan-400";
  const notDestroy = "w-full rounded border py-2";
  const neutral =
    "border-[#e5e7eb] bg-neutral-100 px-3 text-neutral-900 hover:!bg-neutral-200 hover:!text-neutral-950 focus-visible:outline-neutral-900 group-hover/field:bg-neutral-50 group-hover/field:text-neutral-800";
  // disabled:border-neutral-800 disabled:bg-neutral-800
  const confirm =
    "border-blue-500 bg-blue-500 px-6 text-white hover:border-blue-600 hover:bg-blue-600 focus-visible:outline-blue-500 active:border-blue-400 active:bg-blue-400 disabled:grayscale disabled:hover:border-blue-500 disabled:hover:bg-blue-500";
  // no disable styles on cancel for now because deleting a moment is currently fast enough that it's not worth highlighting visually
  const cancel =
    "border-blue-500 bg-white px-6 text-blue-500 hover:border-blue-600 hover:text-blue-600 focus-visible:outline-blue-500 active:border-blue-400 active:text-blue-400";
  const confirmStep =
    "border-cyan-500 bg-cyan-500 px-6 text-white hover:border-cyan-600 hover:bg-cyan-600 focus-visible:outline-cyan-500 active:border-cyan-400 active:bg-cyan-400";
  // disabled:border-neutral-500 disabled:text-neutral-500 bg-current
  const cancelStep =
    "border-cyan-500 bg-white px-6 text-cyan-500 hover:border-cyan-600 hover:text-cyan-600 focus-visible:outline-cyan-500 active:border-cyan-400 active:text-cyan-400 disabled:grayscale disabled:hover:border-cyan-500 disabled:hover:text-cyan-500";

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
      formAction={formAction}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
