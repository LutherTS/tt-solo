// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import MomentsPage from "@/app/(pages)/(dashboard)/users/[username]/moments-agnostic/page";
import {
  selectMomentDefault,
  selectMomentIdNameAndDates,
} from "@/app/reads/server/subreads/moments";

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

// params types

export type MomentsPageParamsRaw = Parameters<typeof MomentsPage>[0]["params"];

// searchParams types

export type MomentsPageSearchParamsRaw = Parameters<
  typeof MomentsPage
>[0]["searchParams"];

// select types

export type SelectMomentDefault = Prisma.MomentGetPayload<{
  select: typeof selectMomentDefault;
}>;

export type SelectMomentIdNameAndDates = Prisma.MomentGetPayload<{
  select: typeof selectMomentIdNameAndDates;
}>;
