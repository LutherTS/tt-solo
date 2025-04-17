// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Types imports

import type { Prisma } from "@prisma/client";

/* LOGIC */

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
