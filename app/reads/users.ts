import prisma from "@/prisma/db";

import { selectUserId, whereByUsername } from "./subreads/users";

export async function findUserIdByUsername(username: string) {
  const select = selectUserId;
  const where = whereByUsername(username);

  return await prisma.user.findUnique({
    select,
    where,
  });
}
