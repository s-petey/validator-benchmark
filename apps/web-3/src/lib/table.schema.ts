import { z } from 'zod';

export const TableResultSchema = z.object({
	'Task name': z.string(),
	'Latency average (ns)': z.string(),
	'Latency median (ns)': z.string(),
	'Throughput average (ops/s)': z.string(),
	'Throughput median (ops/s)': z.string(),
	Samples: z.number()
});

export type TableResult = z.infer<typeof TableResultSchema>;

export type Column = {
	key: keyof TableResult;
	sort?: 'asc' | 'desc';
	sortingFn: (tableData: TableResult[], direction: 'asc' | 'desc') => TableResult[];
};

export type ResultStatus = 'pending' | 'success' | 'error';
