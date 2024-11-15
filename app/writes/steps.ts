import prisma from "@/prisma/db";

import { dataCreateStep } from "./subwrites/steps";
import { whereByMomentId } from "../reads/subreads/steps";

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
  const data = await dataCreateStep(
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
