import { z } from 'zod';

export const WorkerSchema = z.object({
  time: z.number(),
  iterations: z.number(),
  interrupt: z.boolean().optional(),
});

export type WorkerArgs = z.infer<typeof WorkerSchema>;

export const TableResultSchema = z.object({
  'Task name': z.string(),
  'Latency avg (ns)': z.string(),
  'Latency med (ns)': z.string(),
  'Throughput avg (ops/s)': z.string(),
  'Throughput med (ops/s)': z.string(),
  Samples: z.number(),
});
export type TableResult = z.infer<typeof TableResultSchema>;

export type Column = {
  key: keyof TableResult;
  sort?: 'asc' | 'desc';
  sortingFn: (
    tableData: TableResult[],
    direction: 'asc' | 'desc'
  ) => TableResult[];
};

export type ResultStatus = 'pending' | 'success' | 'error';

export type WorkerResult = {
  status: ResultStatus;
  results?: TableResult[];
  progress?: string;
};
