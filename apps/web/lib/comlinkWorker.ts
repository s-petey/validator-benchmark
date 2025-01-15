import { manyBenchmarks } from '@locals/bench/schemas';
import type { Dispatch } from 'react';
import { Bench } from 'tinybench';
import { z } from 'zod';
import { expose } from 'comlink';

function populateBench(bench: Bench) {
  for (const [key, benchFn] of Object.entries(manyBenchmarks)) {
    bench.add(key, benchFn);
  }
}

const TableResultSchema = z.object({
  'Task name': z.string(),
  'Latency average (ns)': z.string(),
  'Latency median (ns)': z.string(),
  'Throughput average (ops/s)': z.string(),
  'Throughput median (ops/s)': z.string(),
  Samples: z.number(),
});

async function benchWorker(
  time: number,
  iterations: number,
  setProgress: Dispatch<string>
) {
  const bench = new Bench({
    time: time,
    iterations,
    name: 'Validator Benchmarks',
    setup: (_task, mode) => {
      // Run the garbage collector before warmup at each cycle
      if (mode === 'warmup' && typeof globalThis.gc === 'function') {
        globalThis.gc();
      }
    },
    teardown: (task, mode) => {
      if (mode !== 'warmup') {
        console.log('teardown', task, mode);
        // setProgress(task.name);
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

  return parsedTable;
}

const exports = {
  benchWorker,
};

export type ComlinkWorker = typeof exports;

expose(exports);
