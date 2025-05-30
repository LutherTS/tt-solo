// no directive
// Proposes no directive to enforce a Server Module.

/* IMPORTS */

// External imports

import { notFound } from "next/navigation";

// Internal imports

import { findUserIdByUsername } from "@/app/reads/server/users";

// Types imports

import type { MomentsPageParamsRaw } from "@/app/types/server/moments";

/* LOGIC */

export const fetchUserDataFlow = async (params: MomentsPageParamsRaw) => {
  params = await params;

  const username = params.username;

  const user = await findUserIdByUsername(username);

  if (!user) return notFound();

  return { user };
};
