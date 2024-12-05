// "use server";
// Proposes "use server" to enforce a Server Module.

import { Prisma } from "@prisma/client";

import {
  selectMomentDefault,
  selectMomentIdNameAndDates,
} from "@/app/readings/server/subreads/moments";
import MomentsPage from "@/app/(pages)/(dashboard)/users/[username]/moments/page";

// searchParams types

export type MomentsPageSearchParamsRaw = Parameters<
  typeof MomentsPage
>[0]["searchParams"]; //

// select types

export type SelectMomentDefault = Prisma.MomentGetPayload<{
  select: typeof selectMomentDefault;
}>;

export type SelectMomentIdNameAndDates = Prisma.MomentGetPayload<{
  select: typeof selectMomentIdNameAndDates;
}>;
