// "use server";
// Proposes "use server" to enforce a Server Module.

import { Prisma } from "@prisma/client";

// Datas

// Creates

export function dataCreateStep(
  orderId: number,
  name: string,
  description: string,
  startDateAndTime: string,
  duration: string,
  endDateAndTime: string,
  momentId: string,
): Prisma.StepUncheckedCreateInput {
  return {
    orderId, // i
    name, // step.intitule
    description, // step.details
    startDateAndTime,
    duration, // step.duree
    endDateAndTime,
    momentId,
  };
}
