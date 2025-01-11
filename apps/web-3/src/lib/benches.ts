import { manyBenchmarks } from '@locals/bench/schemas';
import { TableResultSchema } from './table.schema';
import { Bench, type Hook } from 'tinybench';

// export const load: PageLoad = async ({ url }) => {
// 	const time = url.searchParams.get('time');
// 	const iterations = url.searchParams.get('iterations');
// 	const numberTime = Number(time) ?? 10;
// 	const numberIterations = Number(iterations) ?? 2;

// 	const results = await updateBench(numberTime, numberIterations);

// 	return {
// 		results
// 	};
// };

// export const actions: Actions = {
// 	default: async ({ request }) => {
// 		const formData = await request.formData();
// 		const data = Object.fromEntries(formData);
// 		console.log(data);
// 	}
// };

//custom sorting logic for one of our enum columns
// const throughputAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
// 	const aThroughput = a.original['Throughput average (ops/s)'].split('\xb1')[0] ?? '';
// 	const bThroughput = b.original['Throughput average (ops/s)'].split('\xb1')[0] ?? '';

// 	return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
// };
// const latencyAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
// 	const aThroughput = a.original['Latency average (ns)'].split('\xb1')[0] ?? '';
// 	const bThroughput = b.original['Latency average (ns)'].split('\xb1')[0] ?? '';

// 	return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
// };

function populateBench(bench: Bench) {
	for (const [key, benchFn] of Object.entries(manyBenchmarks)) {
		bench.add(key, benchFn);
	}
}

export const updateBench = async (time: number, iterations: number, teardown?: Hook) => {
	console.log('starting bench');

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
		teardown,
		// teardown: (task, mode) => {
		// 	// console.log('teardown', task, mode);
		// 	if (mode !== 'warmup') {
		// 		// setProgress(task.name);
		// 	}
		// },
		throws: true
		// signal: abortSignal,
	});

	console.log('bench', bench);

	populateBench(bench);

	console.log('bench', bench);

	bench.runSync();

	// try {
	// console.log(bench)
	// await bench.run();
	// } catch (err) {
	// 	console.error(err);
	// 	// setStatus('error');
	// 	// setAbortSignal(new AbortSignal());
	// 	throw err;
	// }

	const table = bench.table();

	console.log('table', table);

	const parsedTable = TableResultSchema.array().parse(table);
	const sortedTable = parsedTable.sort((a, b) => {
		const aThroughput = a['Throughput average (ops/s)'].split('\xb1')[0] ?? '';
		const bThroughput = b['Throughput average (ops/s)'].split('\xb1')[0] ?? '';

		return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
	});

	// setData(sortedTable);
	// setProgress('');
	// setStatus('success');

	return sortedTable;
};
