// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// Internal imports

import prisma from "@/prisma/db";
import { dataCreateStep } from "./subwrites/steps";
import { whereByMomentId } from "@/app/reads/server/subreads/steps";

/* LOGIC */

// Creates

export async function createStepFromSteps(
  orderId: number,
  name: string,
  description: string,
  startDateAndTime: string,
  duration: string,
  endDateAndTime: string,
  momentId: string,
) {
  const data = dataCreateStep(
    orderId,
    name,
    description,
    startDateAndTime,
    duration,
    endDateAndTime,
    momentId,
  );

  return await prisma.step.create({ data });
}

// Deletes

export async function deleteMomentStepsByMomentId(momentId: string) {
  const where = whereByMomentId(momentId);

  return await prisma.step.deleteMany({
    where,
  });
}
