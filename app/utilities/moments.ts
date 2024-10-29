import { add, format, roundToNearestMinutes } from "date-fns";
import { ToWords } from "to-words";

import {
  CreateOrUpdateMomentState,
  StepFromCRUD,
  View,
} from "@/app/types/moments";
import { SetState } from "@/app/types/globals";

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

// rotates states by setting any state array enum to the right or to the left
export const rotateStates = <T>(
  // https://stackoverflow.com/questions/32308370/what-is-the-syntax-for-typescript-arrow-functions-with-generics
  direction: "left" | "right",
  setState: SetState<T>,
  statesArray: readonly T[],
  state: T,
) => {
  if (direction === "right") {
    setState(
      statesArray.at(
        statesArray.indexOf(state) + 1 > statesArray.length - 1
          ? 0
          : statesArray.indexOf(state) + 1,
      )!,
    );
  } else setState(statesArray.at(statesArray.indexOf(state) - 1)!);
};

// scroll back to top when changing a view
export const setScrollToTop = <DesiredView extends DesiredViews, DesiredViews>(
  // https://www.bajorunas.tech/blog/typescript-generics-inheritance
  desiredView: DesiredView,
  setDesiredView: SetState<DesiredViews>,
) => {
  // setDesiredView will need to be replace by something replacing the URL.
  // But since the arguments are going to different it's also going to be different function altogether.
  setDesiredView(desiredView);
  scrollTo({ top: 0 });
};

export const scrollToTopOfDesiredView = () => {};

// scrolls back to the desired section (usually yourMoment or itsSteps in the Moment forms)
export const scrollToSection = (sectionId: string) => {
  const section = document.getElementById(sectionId);
  section?.scrollIntoView({ behavior: "smooth" });
};

// makes an array of all the adding times of a step up to that step (step 0 has the coumpound duration of step 0, step 1 has the compound duration of steps 0 and 1, etc.)
export const makeStepsCompoundDurationsArray = (steps: StepFromCRUD[]) => {
  const stepsCompoundDurationsArray: number[] = [];
  let compoundDuration = 0;
  for (let i = 0; i < steps.length; i++) {
    compoundDuration += +steps[i].duree;
    stepsCompoundDurationsArray.push(compoundDuration);
  }

  return stepsCompoundDurationsArray;
};

// cleans createOrUpdateMomentState from its steps-related properties only, leaving moment-related properties untouched
export const removeStepsMessagesAndErrorsCallback = (
  s: CreateOrUpdateMomentState,
) => {
  return { ...s, stepsMessages: {}, stepsErrors: {} };
};

// same as above but for the moment part of the form
export const removeMomentMessagesAndErrorsCallback = (
  s: CreateOrUpdateMomentState,
) => {
  return { ...s, momentMessages: {}, momentErrors: {} };
};

// defines the desired view to shift to from a view depending on that original view
export const defineDesiredView = (view: View) => {
  switch (view) {
    case "update-moment":
      return "read-moments";
    case "read-moments":
      return "create-moment";
    case "create-moment":
      return "read-moments";
    default:
      return view;
  }
};

// defines the current view from the view searchParam whether it is specified (as a string) or not (as undefined)
export const defineView = (rawView: string | undefined) => {
  switch (rawView) {
    case "update-moment":
      return "update-moment";
    case "read-moments":
      return "read-moments";
    case "create-moment":
      return "create-moment";

    default:
      return "create-moment";
  }
};
