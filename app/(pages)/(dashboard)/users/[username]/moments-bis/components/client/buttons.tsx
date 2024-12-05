"use client"; // "use client components"
// Proposes "use client components" to enforce a Client Components Module.

import { MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

import * as AllGlobalIcons from "@/app/icons/agnostic";
import * as AllGlobalClientComponents from "@/app/components/client";

import { MomentAdapted, SubView, View } from "@/app/types/agnostic/moments";
import {
  momentsPageSearchParamsKeys,
  SEARCH_FORM_ID,
  subViewsTitles,
  views,
} from "@/app/constants/agnostic/moments";
import { defineDesiredView } from "@/app/utilities/agnostic/moments";
import { scrollToTopOfDesiredView } from "@/app/utilities/client/moments";
import { SetState } from "@/app/types/client/globals";

export function SetSelectButton({
  setSelect,
  text,
}: {
  setSelect: SetState<boolean>;
  text: string;
}) {
  return (
    <AllGlobalClientComponents.Button
      type="button"
      variant="destroy"
      onClick={() => setSelect((s) => !s)}
    >
      {text}
    </AllGlobalClientComponents.Button>
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
    <AllGlobalClientComponents.Button
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
    </AllGlobalClientComponents.Button>
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
              <AllGlobalClientComponents.Button
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
              </AllGlobalClientComponents.Button>
            );
          case "updating":
            return (
              <AllGlobalClientComponents.Button
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
              </AllGlobalClientComponents.Button>
            );
          default:
            return null;
        }
      })()}
    </>
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
    <AllGlobalClientComponents.Button
      form={form}
      type="submit"
      variant="confirm-step"
      disabled={allButtonsDisabled || isUpdateStepPending}
    >
      Actualiser l&apos;étape
    </AllGlobalClientComponents.Button>
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
    <AllGlobalClientComponents.Button
      form={form}
      type="button"
      onClick={deleteStepAction}
      variant="cancel-step"
      disabled={allButtonsDisabled || isDeleteStepPending}
    >
      Effacer l&apos;étape
    </AllGlobalClientComponents.Button>
  );
}

export function SetSubViewButton({
  e,
  subView,
}: {
  e: SubView;
  subView: SubView;
}) {
  const className = "px-4 py-2 h-9 flex items-center justify-center";

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  function handleSubView() {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(momentsPageSearchParamsKeys.SUB_VIEW, e);
    replace(`${pathname}?${newSearchParams.toString()}`);
  }

  return (
    <button
      onClick={handleSubView}
      className={clsx(
        className,
        "relative rounded-full text-sm font-semibold uppercase tracking-widest text-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        subView === e && "focus-visible:outline-blue-500",
        subView !== e && "focus-visible:outline-cyan-500",
      )}
    >
      {/* real occupied space */}
      <span className="invisible static">{subViewsTitles[e]}</span>
      {/* gradient text */}
      <span
        className={clsx(
          className,
          "absolute inset-0 z-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
        )}
      >
        {subViewsTitles[e]}
      </span>
      {/* white background */}
      <div
        className={clsx(
          "absolute inset-0 z-10 rounded-full border-2 border-transparent bg-white bg-clip-content",
        )}
      ></div>
      {/* gradient border */}
      <div
        className={clsx(
          "absolute inset-0 rounded-full",
          subView === e && "bg-gradient-to-r from-blue-500 to-cyan-500",
          subView !== e && "bg-transparent",
        )}
      ></div>
    </button>
  );
}

export function RevalidateMomentsButton({
  revalidateMomentsAction,
  isRevalidateMomentsPending,
  allButtonsDisabled,
}: {
  revalidateMomentsAction: (
    event: MouseEvent<HTMLButtonElement>,
  ) => Promise<void>;
  isRevalidateMomentsPending: boolean;
  allButtonsDisabled: boolean;
}) {
  return (
    <button
      form={SEARCH_FORM_ID}
      onClick={revalidateMomentsAction}
      disabled={allButtonsDisabled || isRevalidateMomentsPending}
      className={clsx(
        "flex h-9 items-center justify-center px-4 py-2",
        "relative rounded-full text-sm font-semibold uppercase tracking-widest text-transparent outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-cyan-500",
      )}
    >
      {/* real occupied space */}
      <span className="invisible static">
        <AllGlobalIcons.ArrowPathSolidIcon />
      </span>
      {/* gradient text */}
      <span
        className={clsx(
          "flex h-9 items-center justify-center px-4 py-2",
          "absolute inset-0 z-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text",
        )}
      >
        <AllGlobalIcons.ArrowPathSolidIcon className="size-6 text-blue-950" />
      </span>
      {/* white background */}
      <div
        className={clsx(
          "absolute inset-0 z-10 rounded-full border-2 border-transparent bg-white bg-clip-content",
        )}
      ></div>
      {/* gradient border */}
      <div className={clsx("absolute inset-0 rounded-full", "bg-white")}></div>
    </button>
  );
}

export function UpdateMomentViewButton({
  e3,
  realMoments,
}: {
  e3: MomentAdapted;
  realMoments: MomentAdapted[];
}) {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  function handleUpdateMomentView() {
    const moment = realMoments.find((e0) => e0.key === e3.key);

    scrollToTopOfDesiredView(
      views.UPDATE_MOMENT,
      searchParams,
      push,
      pathname,
      moment?.key,
    );
  }

  return (
    <AllGlobalClientComponents.Button
      type="button"
      variant="destroy-step"
      onClick={handleUpdateMomentView}
    >
      <AllGlobalIcons.PencilSquareSolidIcon className="size-5" />
    </AllGlobalClientComponents.Button>
  );
}

export function PaginationButton({
  handlePagination,
  direction,
  subView,
  disabled,
  icon,
  iconClassName,
  allButtonsDisabled,
}: {
  handlePagination: (direction: "left" | "right", subView: SubView) => void;
  direction: "left" | "right";
  subView: SubView;
  disabled: boolean;
  icon: AllGlobalIcons.AllGlobalIconName;
  iconClassName?: string;
  allButtonsDisabled: boolean;
}) {
  const Icon = AllGlobalIcons[icon];

  return (
    <button
      onClick={() => handlePagination(direction, subView)}
      disabled={allButtonsDisabled || disabled}
      className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500 disabled:text-neutral-200"
    >
      <div className="rounded-lg bg-white p-2 shadow">
        <Icon className={iconClassName} />
      </div>
    </button>
  );
}

export function SetViewButton({ view }: { view: View }) {
  const desiredView = defineDesiredView(view);

  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  return (
    <AllGlobalClientComponents.Button
      type="button"
      variant="destroy-step"
      onClick={() =>
        scrollToTopOfDesiredView(desiredView, searchParams, push, pathname)
      }
    >
      {(() => {
        switch (desiredView) {
          // no case views.UPDATE_MOMENT, since moment-specific
          case views.READ_MOMENTS:
            return <>Vos moments</>;
          case views.CREATE_MOMENT:
            return <>Créez un moment</>;
          default:
            return null;
        }
      })()}
    </AllGlobalClientComponents.Button>
  );
}

const buttonsClientComponents = {
  SetSelectButton,
  ConfirmMomentButton,
  ResetOrEraseMomentButton,
  UpdateStepButton,
  EraseStepButton,
  SetSubViewButton,
  RevalidateMomentsButton,
  UpdateMomentViewButton,
  PaginationButton,
  SetViewButton,
} as const;

export type ButtonsClientComponentsName = keyof typeof buttonsClientComponents;
