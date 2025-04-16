"use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

// You can now import from a Client Components Module inside an Agnostic Module, but you can't import from a Server Module inside an Agnostic Module.

/* IMPORTS */

// Components imports

import * as AllGlobalClientComponents from "../client/components/global";

// Types imports

import type { SetState } from "@/app/types/client/globals";
import type { CreateOrUpdateMomentState } from "@/app/types/agnostic/moments";

/* LOGIC */

export function FormDescriptionOrError({
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
        <AllGlobalClientComponents.FormValidationError
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

export function InputValidationError({ errors }: { errors: string[] }) {
  return (
    <>
      {errors.map((error, i) => {
        if (i === 0)
          return (
            <p key={i} className="text-sm text-pink-500 select-none">
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
        <p className="text-sm text-neutral-500 select-none">{description}</p>
      )}
      {addendum && (
        <p className="text-sm text-neutral-500 select-none">({addendum})</p>
      )}
    </div>
  );
}

const validationErrorsAgnosticComponents = {
  FormDescriptionOrError,
  InputValidationError,
  InputDescriptionOrError,
} as const;

export type ValidationErrorsAgnosticComponentsName =
  keyof typeof validationErrorsAgnosticComponents;
