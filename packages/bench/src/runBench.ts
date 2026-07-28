import { Bench } from "tinybench";
import { TableResultSchema } from "./schemas/bench.schemas.js";
import { validators } from "./schemas/benchmarks.js";

function populateBench(bench: Bench, workerNames: string[]) {
  for (const { name, singleAction } of validators) {
    const found = workerNames.find((workerName) => workerName.toLowerCase() === name.toLowerCase());
    if (found) {
      bench.add(name, singleAction);
    }
  }
}

export async function runBench(
  time: number,
  iterations: number,
  setProgress: (v: string) => void,
  workerNames: string[],
) {
  const bench = new Bench({
    time,
    iterations,
    name: "Validator Benchmarks",
    setup: (_task, mode) => {
      // Run the garbage collector before warmup at each cycle
      if (mode === "warmup" && typeof globalThis.gc === "function") {
        globalThis.gc();
      }
    },
    teardown: (task, mode) => {
      if (mode !== "warmup" && task !== undefined) {
        setProgress(task.name);
      }
    },
    throws: true,
  });

  populateBench(bench, workerNames);

  try {
    await bench.run();
  } catch (err) {
    console.error(err);
    throw err;
  }

  const table = bench.table();
  const parsedTable = TableResultSchema.array().parse(table);

  setProgress("");
  return parsedTable;
}
