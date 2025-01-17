import { validators } from '@locals/bench/schemas';
import { Bench } from 'tinybench';
import { z } from 'zod';
import { expose } from 'comlink';

function populateBench(bench: Bench) {
  for (const { name, singleAction } of validators) {
    bench.add(name, singleAction);
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
  setProgress: (v: string) => void
) {
  const bench = new Bench({
    time,
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

  setProgress('');
  return parsedTable;
}

const exports = {
  benchWorker,
};

export type ComlinkWorker = typeof exports;

expose(exports);
