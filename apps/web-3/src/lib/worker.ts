import { updateBench } from './benches';
import type { Column, ResultStatus, TableResult } from './table.schema';

let promise: Promise<void> | null = null;

onmessage = async (e) => {
	console.log('Worker: Message recieved from main script', e.data);

	const time = e.data[0];
	const iterations = e.data[1];

	async function runner({
		time: t = 10,
		iterations: its = 2
	}: {
		time: number;
		iterations: number;
	}) {
		let status: ResultStatus = 'pending';

		postMessage({ status });

		const result = await updateBench(
			t,
			its,
			(task, mode) => {
				// console.log('teardown', task, mode);
				if (mode !== 'warmup') {
					postMessage({ progress: task.name });
					// setProgress(task.name);
					// progress = task.name;
					// TODO: Why does this progress not get updated?
				}
			} //.bind(progress)
		);

		if (result) {
			status = 'success';
			postMessage({ results: result, status });
		} else {
			status = 'error';
			postMessage({ status });
		}
	}

	// Kill the current promise and start a new one
	if (promise) {
		promise = null;
	}

	promise = runner({ time, iterations });
};
