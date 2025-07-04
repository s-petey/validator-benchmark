import fs from "node:fs";
import path from "node:path";

export function writeReport(fileSuffix: string, content: string) {
  // Get day, month, year, hour, minute
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const fileName = `${day}-${month}-${year}-${hour}-${minute}_${fileSuffix}.json`;
  const resultsPath = path.resolve(path.dirname(""), "../../results");

  fs.writeFileSync(`${resultsPath}/${fileName}`, content);
}
