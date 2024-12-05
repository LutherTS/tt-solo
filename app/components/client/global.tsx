"use client";
// Enforces a Client Module.

import { MouseEventHandler } from "react";
import { useFormStatus } from "react-dom";
import clsx from "clsx"; // .prettierc – "tailwindFunctions": ["clsx"]

import { SetState } from "@/app/types/client/globals";
import {
  FalseCreateOrUpdateMomentState,
  CreateOrUpdateMomentState,
} from "@/app/types/agnostic/moments";

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

export function FalseFormValidationError({
  error,
  setCreateOrUpdateMomentState,
  removeMessagesAndErrorsCallback,
}: {
  error: string;
  setCreateOrUpdateMomentState?: SetState<FalseCreateOrUpdateMomentState>;
  removeMessagesAndErrorsCallback?: (
    s: FalseCreateOrUpdateMomentState,
  ) => FalseCreateOrUpdateMomentState; // could be more precise but true
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
        "max-w-prose text-sm text-pink-500 transition-colors",
        setCreateOrUpdateMomentState &&
          removeMessagesAndErrorsCallback &&
          "hover:cursor-pointer hover:text-pink-400 active:text-pink-600",
      )}
      onClick={handleClick}
    >
      {error}
    </p>
  );
}

const globalClientComponents = {
  Button,
  FalseFormValidationError,
  FormValidationError,
} as const;

export type GlobalClientComponentsName = keyof typeof globalClientComponents;

/* Notes
For now I just want all of my components to be Client Components. It's once the projet gets running that I'll want to optimize between Client Components and Server Components.
*/
