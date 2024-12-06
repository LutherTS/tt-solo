// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// External imports

import { add, format, roundToNearestMinutes } from "date-fns";
import { ToWords } from "to-words";

// Internal imports

import {
  subViews,
  SUBVIEWS,
  VIEWS,
  views,
} from "@/app/constants/agnostic/moments";

// Types imports

import {
  FalseCreateOrUpdateMomentState,
  StepFromClient,
  View,
  MomentToCRUD,
  SubView,
  UserMomentsToCRUD,
  CreateOrUpdateMomentState,
} from "@/app/types/agnostic/moments";

/* LOGIC */

// changes a Date object into a input datetime-local string
export const dateToInputDatetime = (date: Date) =>
  format(date, "yyyy-MM-dd'T'HH:mm");

// finds the end time from start time and duration
export const endDateAndTime = (dateAndTime: string, duration: string) =>
  dateToInputDatetime(add(new Date(dateAndTime), { minutes: +duration }));

// translates numbers to French
const toWords = new ToWords({ localeCode: "fr-FR" });
export const toWordsing = (number: number) => {
  let words = toWords.convert(number);
  // it could have just been words = words + "e"
  if (words.endsWith("Un")) words = words.slice(0, -2).concat("Une");
  words = words.toLocaleLowerCase();
  return words;
};

// transforms number strings from InputNumber into French hours and minutes
export const numStringToTimeString = (string: string) => {
  const num = +string;
  let timeString = "";

  let numInFlooredHours = Math.floor(num / 60);
  let numInRemainingMinutes = num % 60;

  if (num <= 60) {
    if (num === 1) timeString = `1 minute`;
    if (num === 60) timeString = `1 heure`;
    else timeString = `${num} minutes`;
  } else {
    // heures
    if (numInFlooredHours === 1) timeString = `${numInFlooredHours} heure`;
    else timeString = `${numInFlooredHours} heures`;
    // minutes
    if (numInRemainingMinutes === 1)
      timeString += ` et ${numInRemainingMinutes} minute`;
    if (numInRemainingMinutes > 1)
      timeString += ` et ${numInRemainingMinutes} minutes`;
  }

  return timeString;
}; // sometimes actual numbers have to be turned into strings for this

// adapts and secures the current page searchParam on both the client and the server with the same code
export const defineCurrentPage = (
  initialPage: number,
  rawPage: number,
  maxPage: number,
) => {
  let currentPage = initialPage;
  if (rawPage > initialPage) currentPage = Math.floor(rawPage);
  if (rawPage > maxPage) currentPage = maxPage;
  return currentPage;
};

// rounds the current time to the next minimum 10 or maximum 20 round minutes
// (e.g. if it's 11:00, 11:10 will be shown)
// roundToNearestMinutes are nested to create a clamp method, meaning:
// - the time shown will always be a minimum of 10 minutes later
// (e.g. if it's 10:59, 11:10 will be shown)
// - the time shown will always be a maximum of 20 minutes later
// (e.g. if it's 11:01, 11:20 will be shown)
// This is to account for the time it will take to fill the form, especially to fill all the steps of the moment at hand.
export const roundTimeUpTenMinutes = (time: string) =>
  format(
    roundToNearestMinutes(
      add(
        roundToNearestMinutes(time, {
          roundingMethod: "ceil",
          nearestTo: 10,
        }),
        { seconds: 1 },
      ),
      {
        roundingMethod: "ceil",
        nearestTo: 10,
      },
    ),
    "yyyy-MM-dd'T'HH:mm",
  );

// makes an array of all the adding times of a step up to that step (step 0 has the compound duration of step 0, step 1 has the compound duration of steps 0 and 1, etc.)
export const makeStepsCompoundDurationsArray = (steps: StepFromClient[]) => {
  const stepsCompoundDurationsArray: number[] = [];
  let compoundDuration = 0;
  for (let i = 0; i < steps.length; i++) {
    compoundDuration += +steps[i].duree;
    stepsCompoundDurationsArray.push(compoundDuration);
  }

  return stepsCompoundDurationsArray;
};

// cleanse createOrUpdateMomentState from its steps-related properties only, leaving moment-related properties untouched
export const falseRemoveStepsMessagesAndErrorsCallback = (
  s: FalseCreateOrUpdateMomentState,
): FalseCreateOrUpdateMomentState => {
  return { ...s, stepsMessages: {}, stepsErrors: {} };
};

// I NEED TO BE VERY CAREFUL HOW I IMPORT THIS (circular dependency)
export const removeStepsMessagesAndErrorsCallback = (
  s: CreateOrUpdateMomentState,
): CreateOrUpdateMomentState => {
  if (s?.error)
    return { ...s, error: { ...s?.error, stepsMessages: {}, stepsErrors: {} } };
  else return s;
};

// same as above but for the moment part of the form
export const falseRemoveMomentMessagesAndErrorsCallback = (
  s: FalseCreateOrUpdateMomentState,
) => {
  return { ...s, momentMessages: {}, momentErrors: {} };
};

// I NEED TO BE VERY CAREFUL HOW I IMPORT THIS (circular dependency)
export const removeMomentMessagesAndErrorsCallback = (
  s: CreateOrUpdateMomentState,
) => {
  if (s?.error)
    return {
      ...s,
      error: { ...s?.error, momentMessages: {}, momentErrors: {} },
    };
  else return s;
};

// defines the desired view to shift to from a view depending on that original view
export const defineDesiredView = (view: View) => {
  switch (view) {
    case views.UPDATE_MOMENT:
      return views.READ_MOMENTS;
    case views.READ_MOMENTS:
      return views.CREATE_MOMENT;
    case views.CREATE_MOMENT:
      return views.READ_MOMENTS;
    default:
      return view;
  }
};

// type predicate for the subView searchParam
export const isView = (value: any): value is View => {
  return VIEWS.includes(value);
};

// defines the current view from the view searchParam whether it is specified (as a string) or not (as undefined)
export const defineView = (rawView: string | undefined): View => {
  if (isView(rawView)) return rawView;
  else return views.CREATE_MOMENT;
};

// defines the current moment from the momentId searchParam whether it is specified (as a string) or not (as undefined), based on the moments currently shown on the page // didn't need to be async too
export const defineMoment = async (
  rawMomentId: string | undefined,
  uniqueShownMoments: MomentToCRUD[],
): Promise<MomentToCRUD | undefined> => {
  if (!rawMomentId) return undefined;
  else return uniqueShownMoments.find((e) => e.id === rawMomentId);
};

// defines both the view and moment depending on one another, so that the views.UPDATE_MOMENT cannot be shown if there is no moment
export const defineWithViewAndMoment = (
  view: View,
  moment: MomentToCRUD | undefined,
): { view: View; moment: MomentToCRUD | undefined } => {
  switch (view) {
    case views.UPDATE_MOMENT:
      if (moment) return { view, moment };
      else return { view: views.READ_MOMENTS, moment };
    case views.READ_MOMENTS:
      return { view, moment: undefined };
    case views.CREATE_MOMENT:
      return { view, moment: undefined };

    default:
      return { view, moment };
  }
};

// type predicate for the subView searchParam
export const isSubView = (value: any): value is SubView => {
  return SUBVIEWS.includes(value);
};

// defines the current read-moments view subView from the subView searchParam whether it is specified (as a string) or not (as undefined)
export const defineSubView = (
  rawSubView: string | undefined,
  allUserMomentsToCRUD: UserMomentsToCRUD[],
): SubView => {
  if (isSubView(rawSubView)) return rawSubView;
  else {
    const [
      _realUserMoments,
      realPastMoments,
      realCurrentMoments,
      realFutureMoments,
    ] = allUserMomentsToCRUD;

    let initialSubView: SubView =
      realCurrentMoments.dates.length > 0
        ? subViews.CURRENT_MOMENTS
        : realFutureMoments.dates.length > 0
          ? subViews.FUTURE_MOMENTS
          : realPastMoments.dates.length > 0
            ? subViews.PAST_MOMENTS
            : subViews.ALL_MOMENTS;

    return initialSubView;
  }
};

/* Notes
I personally hate when a backend modifies the URL I've personally entered in the browser. So my idea is, the user is free to enter and keep whatever URL they want, while I am free to interpret that URL however it is that I want.
*/
