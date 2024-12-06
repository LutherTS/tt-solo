// "use server";
// Proposes "use server" to enforce a Server Module.

/* IMPORTS */

// External imports

import Hashids from "hashids";

/* LOGIC */

// core Hashids instance

export const hashids = new Hashids(process.env.HASHIDS_SALT, 10);
