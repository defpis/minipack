import { b } from "./module2.js";

export function a(path) {
  console.log(`function a called at ${path}`);
}

b("module1.js");
