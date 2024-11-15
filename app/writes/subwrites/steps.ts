import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

import { defaultSaltRounds } from "@/app/data/globals";

// Datas

// Creates

export async function dataCreateStep(
  orderId: number,
  name: string,
  description: string,
  startDateAndTime: string,
  duration: string,
  endDateAndTime: string,
  momentId: string,
): Promise<Prisma.StepUncheckedCreateInput> {
  const id = uuidv4();
  const key = await bcrypt.hash(id, defaultSaltRounds);

  return {
    id,
    key,
    orderId, // i
    name, // step.intitule
    description, // step.details
    startDateAndTime,
    duration, // step.duree
    endDateAndTime,
    momentId,
  };
}
