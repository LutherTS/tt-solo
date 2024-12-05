// "use server";
// Proposes "use server" to enforce a Server Module.

import Hashids from "hashids";

// core Hashids instance

export const hashids = new Hashids(process.env.HASHIDS_SALT, 10);
