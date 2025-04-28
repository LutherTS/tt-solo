// "use agnostic strategies"
// "use client";
// "use client logics"

// @ts-ignore
export { /* @clientLogics */ findDestinationsByUserId } from "./test-3.ts";

export /* @serverLogics */ const x = 1;

/* 'use server functions' */ // Either is fine.

// !! work on export defaults not done yet
// export default /* @clientLogics */ { bravely: "default" };
export const bravely = { bravely: "default" };
const second = { bravely: "default" };
export default /* @clientLogics */ second;
