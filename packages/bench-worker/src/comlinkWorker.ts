import { validators } from "@locals/bench/benchmarks";
import { expose } from "comlink";
import { Bench } from "tinybench";
import { TableResultSchema } from "./bench.schemas.js";

function populateBench(bench: Bench) {
  for (const { name, singleAction } of validators) {
    bench.add(name, singleAction);
  }
}

async function benchWorker(time: number, iterations: number, setProgress: (v: string) => void) {
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

  populateBench(bench);

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

const exports = {
  benchWorker,
};

export type ComlinkWorker = typeof exports;

expose(exports);
