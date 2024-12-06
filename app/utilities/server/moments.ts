// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import { TAKE } from "@/app/constants/agnostic/moments";

// Types imports

import type { SelectMomentIdNameAndDates } from "@/app/types/server/moments";

/* LOGIC */

export const makeConditionalSuccessStateProperties = async (
  userId: string,
  currentNow: string,
  moment: SelectMomentIdNameAndDates,
  countFunction: (
    userId: string,
    nowString: string,
    moment: SelectMomentIdNameAndDates,
  ) => Promise<number>,
  // callback: Promise<number> // I could use this instead of all the arguments, but I'd rather keep passing the function and its arguments instead for better comprehension
): Promise<{ countPage: number }> => {
  const count = await countFunction(userId, currentNow, moment);
  const countPage = Math.ceil((count + 1) / TAKE);

  // This is what the callback could have been
  // const callback = countFunction(
  //   userId,
  //   currentNow,
  //   moment,
  // );

  return { countPage };
};

/* Notes
I personally hate when a backend modifies the URL I've personally entered in the browser. So my idea is, the user is free to enter and keep whatever URL they want, while I am free to interpret that URL however it is that I want.
*/
