import prisma from "@/prisma/db";

import {
  destinationsOrderByDefault,
  selectDestinationId,
  whereByNameAndUserId,
  whereByUserId,
} from "./subreads/destinations";

// FindManys

export async function findDestinationsByUserId(userId: string) {
  const where = whereByUserId(userId);
  const orderBy = destinationsOrderByDefault;

  return await prisma.destination.findMany({ where, orderBy });
}

// FindUniques

export async function findDestinationIdByNameAndUserId(
  name: string,
  userId: string,
) {
  const select = selectDestinationId;
  const where = whereByNameAndUserId(name, userId);

  return await prisma.destination.findUnique({ select, where });
}
