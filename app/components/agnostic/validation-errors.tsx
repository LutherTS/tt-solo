// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

import * as AllGlobalClientComponents from "../client/global";

import { SetState } from "@/app/types/globals";
import {
  FalseCreateOrUpdateMomentState,
  CreateOrUpdateMomentState,
} from "@/app/types/moments";

export function FalseFormDescriptionOrError({
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
        <AllGlobalClientComponents.FalseFormValidationError
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

const validationErrorsAgnosticComponents = {
  FalseFormDescriptionOrError,
  FormDescriptionOrError,
  InputValidationError,
  InputDescriptionOrError,
} as const;

export type ValidationErrorsAgnosticComponentsName =
  keyof typeof validationErrorsAgnosticComponents;
