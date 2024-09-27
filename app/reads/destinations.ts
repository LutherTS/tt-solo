import prisma from "@/prisma/db";

export async function findDestinationsByUserId(userId: string) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.destination.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function findDestinationByNameAndUserId(
  name: string,
  userId: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.destination.findUnique({
    where: {
      name_userId: {
        name,
        userId,
      },
    },
  });
}
