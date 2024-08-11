import { add, format } from "date-fns";
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
  if (words.endsWith("Un")) words = words.slice(0, -2).concat("Une");
  words = words.toLocaleLowerCase();
  return words;
}; // if could have just been words = words + "e"

// transform number strings from InputNumber into French hours and minutes
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
