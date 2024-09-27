import prisma from "@/prisma/db";

// Let's start by doing a 1:1 of all database calls, and then they'll be subdivided in subreads (subwrites).

export async function countUserMomentsTotalWithContains(
  userId: string,
  contains: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.count({
    where: {
      destination: {
        userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
    },
  });
}

export async function countPastUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.count({
    where: {
      destination: {
        userId: userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      endDateAndTime: {
        lt: nowString,
      },
    },
  });
}

export async function countCurrentUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.count({
    where: {
      destination: {
        userId: userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      AND: [
        { startDateAndTime: { lte: nowString } },
        { endDateAndTime: { gte: nowString } },
      ],
    },
  });
}

export async function countFutureUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.count({
    where: {
      destination: {
        userId: userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      startDateAndTime: {
        gt: nowString,
      },
    },
  });
}

export async function findUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  userMomentsPage: number,
  TAKE: number,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.findMany({
    where: {
      destination: {
        userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
    orderBy: {
      startDateAndTime: "desc",
    },
    take: TAKE,
    skip: (userMomentsPage - 1) * TAKE,
  });
}

export async function findPastUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
  pastUserMomentsPage: number,
  TAKE: number,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.findMany({
    where: {
      destination: {
        userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      endDateAndTime: {
        lt: nowString,
      },
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
    orderBy: {
      startDateAndTime: "desc",
    },
    take: TAKE,
    skip: (pastUserMomentsPage - 1) * TAKE,
  });
}

export async function findCurrentUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
  currentUserMomentsPage: number,
  TAKE: number,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.findMany({
    where: {
      destination: {
        userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      AND: [
        { startDateAndTime: { lte: nowString } },
        { endDateAndTime: { gte: nowString } },
      ],
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
    orderBy: {
      startDateAndTime: "asc",
    },
    take: TAKE,
    skip: (currentUserMomentsPage - 1) * TAKE,
  });
}

export async function findFutureUserMomentsTotalWithContains(
  userId: string,
  contains: string,
  nowString: string,
  futureUserMomentsPage: number,
  TAKE: number,
) {
  // const where = whereUserPinnedForSelfAnswersByUserId(id);

  return await prisma.moment.findMany({
    where: {
      destination: {
        userId,
      },
      name: {
        contains: contains !== "" ? contains : undefined,
      },
      startDateAndTime: {
        gt: nowString,
      },
    },
    include: {
      destination: true,
      steps: {
        orderBy: {
          orderId: "asc",
        },
      },
    },
    orderBy: {
      startDateAndTime: "asc",
    },
    take: TAKE,
    skip: (futureUserMomentsPage - 1) * TAKE,
  });
}
