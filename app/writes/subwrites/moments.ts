import { endDateAndTime } from "@/app/utilities/moments";
import { Prisma } from "@prisma/client";

// Datas

export function dataCreateMomentWithoutDestination(
  activity: string,
  name: string,
  isIndispensable: boolean,
  description: string,
  startDateAndTime: string,
  duration: string,
): Prisma.MomentCreateWithoutDestinationInput {
  return {
    activity, // activite
    name, // objectif
    isIndispensable, // indispensable
    description, // contexte
    startDateAndTime, // momentDate
    duration,
    endDateAndTime: endDateAndTime(startDateAndTime, duration),
  };
}
