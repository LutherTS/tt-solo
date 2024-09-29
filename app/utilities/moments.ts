import { add, format, roundToNearestMinutes } from "date-fns";
import { ToWords } from "to-words";

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
