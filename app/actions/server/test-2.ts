// "use agnostic strategies"
// "use client";
// "use client logics"

// @ts-ignore
export { findDestinationsByUserId } from "./test-3.ts";

export /* @serverLogics */ const x = 1;

/* 'use server functions' */ // Either is fine.

// !! work on export defaults not done yet
// export default /* @clientLogics */ { bravely: "default" };
export const bravely = { bravely: "default" };
// const bravely = { bravely: "default" };
// export default bravely;
