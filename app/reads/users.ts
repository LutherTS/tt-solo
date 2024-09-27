import prisma from "@/prisma/db";

// this should not be exported because this really should not be used
// it can be kept here for safekeeping though
export async function findUserByUsername(username: string) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserIdByUsername(username: string) {
  // const select = selectUserPinnedForSelfAnswers;
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.user.findUnique({
    select: { id: true },
    where: { username },
  });
}
