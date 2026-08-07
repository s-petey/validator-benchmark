import { runBench } from "@locals/bench/runBench";
import { expose } from "comlink";

async function benchWorker(time: number, iterations: number, setProgress: (v: string) => void, workerNames: string[]) {
  return await runBench(time, iterations, setProgress, workerNames);
}

const exports = {
  benchWorker,
};

export type ComlinkWorker = typeof exports;

expose(exports);
