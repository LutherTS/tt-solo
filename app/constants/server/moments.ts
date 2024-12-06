// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import {
  countUserCurrentMomentsWithContains,
  countUserFutureMomentsWithContains,
  countUserPastMomentsWithContains,
  findUserCurrentMomentsWithContains,
  findUserFutureMomentsWithContains,
  findUserPastMomentsWithContains,
  countUserAllMomentsWithContains,
  findUserAllMomentsWithContains,
} from "@/app/readings/server/reads/moments";
import { subViews } from "../agnostic/moments";

/* LOGIC */

// subViews

export const subViewsCountUserMomentsWithContains = {
  [subViews.ALL_MOMENTS]: countUserAllMomentsWithContains,
  [subViews.PAST_MOMENTS]: countUserPastMomentsWithContains,
  [subViews.CURRENT_MOMENTS]: countUserCurrentMomentsWithContains,
  [subViews.FUTURE_MOMENTS]: countUserFutureMomentsWithContains,
} as const;

export const subViewsFindUserMomentsWithContains = {
  [subViews.ALL_MOMENTS]: findUserAllMomentsWithContains,
  [subViews.PAST_MOMENTS]: findUserPastMomentsWithContains,
  [subViews.CURRENT_MOMENTS]: findUserCurrentMomentsWithContains,
  [subViews.FUTURE_MOMENTS]: findUserFutureMomentsWithContains,
} as const;
