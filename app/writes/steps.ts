import prisma from "@/prisma/db";

export async function createStepFromSteps(
  orderId: number,
  name: string,
  description: string,
  startDateAndTime: string,
  duration: string,
  endDateAndTime: string,
  momentId: string,
) {
  // const data = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.step.create({
    data: {
      orderId, // i
      name, // step.intitule
      description, // step.details
      startDateAndTime,
      duration, // step.duree
      endDateAndTime,
      momentId,
    },
  });
}

export async function deleteMomentStepsByMomentId(momentId: string) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.step.deleteMany({
    where: {
      momentId,
    },
  });
}
