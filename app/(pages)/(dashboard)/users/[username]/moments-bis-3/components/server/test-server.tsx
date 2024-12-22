import * as fs from "node:fs"; // to prove this is a Server Module

export function ServerComponentInServerModule() {
  fs.readdirSync("/"); // this makes it Server Module

  return <></>;
}

export function NotServerComponentStillInServerModule() {
  return <></>;
}
