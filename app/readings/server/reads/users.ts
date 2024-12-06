// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// Internal imports

import prisma from "@/prisma/db";
import { selectUserIdAndUsername, whereByUsername } from "../subreads/users";

/* LOGIC */

// FindUniques

export async function findUserIdByUsername(username: string) {
  const select = selectUserIdAndUsername;
  const where = whereByUsername(username);

  return await prisma.user.findUnique({
    select,
    where,
  });
}
