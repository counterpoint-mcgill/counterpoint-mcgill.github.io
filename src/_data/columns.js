// The special columns (Interviews, and any others) live in columnList.json so
// the admin page can edit them. This hands the templates the plain list.
import { readFileSync } from "node:fs";

export default function () {
  const file = new URL("./columnList.json", import.meta.url);
  return JSON.parse(readFileSync(file, "utf8")).items || [];
}
