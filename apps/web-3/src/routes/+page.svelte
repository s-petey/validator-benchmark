<script lang="ts">
	import type { Hook } from 'tinybench';
	import { browser } from '$app/environment';

	import BenchWorker from '$lib/worker?worker';
	// const columnHelper = createColumnHelper<TableResult>();
	import { updateBench } from '$lib/benches';
	import type { Column, ResultStatus, TableResult } from '$lib/table.schema';

	type ValidatorResource = {
		href: string;
		name: string;
	};

	let status = $state<ResultStatus>('pending');
	// TODO: Future enhancement...
	let progress = $state('');

	let results = $state<TableResult[]>([]);
	let formState = $state({
		time: 10,
		iterations: 2
	});

	const validators: ValidatorResource[] = [
		{
			href: 'https://www.npmjs.com/package/ajv',
			name: 'ajv'
		},
		{
			href: 'https://www.npmjs.com/package/joi',
			name: 'joi'
		},
		{
			href: 'https://www.npmjs.com/package/yup',
			name: 'yup'
		},
		{
			href: 'https://www.npmjs.com/package/zod',
			name: 'zod'
		},
		{
			href: 'https://www.npmjs.com/package/myzod',
			name: 'myzod'
		},
		{
			href: 'https://valibot.dev/',
			name: 'valibot'
		},
		{
			href: 'https://effect.website/docs/schema/introduction/',
			name: '@effect/schema'
		}
	];

	const taskNameSorter = (tableData: TableResult[], direction: 'asc' | 'desc') => {
		if (direction === 'desc') {
			return tableData.sort((a, b) => {
				return b['Task name'].localeCompare(a['Task name']);
			});
		}

		return tableData.sort((a, b) => {
			return a['Task name'].localeCompare(b['Task name']);
		});
	};

	// TODO: Fix this sorting...
	const latencyAvgSort = (
		key: Exclude<keyof TableResult, 'Samples'>,
		tableData: TableResult[],
		direction: 'asc' | 'desc'
	) => {
		if (direction === 'desc') {
			return tableData.sort((a, b) => {
				const aThroughput = a[key].split('\xb1')[0] ?? '';
				const bThroughput = b[key].split('\xb1')[0] ?? '';
				return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
			});
		}

		return tableData.sort((a, b) => {
			const aThroughput = a[key].split('\xb1')[0] ?? '';
			const bThroughput = b[key].split('\xb1')[0] ?? '';
			return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
		});
	};

	const sampleSort = (tableData: TableResult[], direction: 'asc' | 'desc') => {
		if (direction === 'desc') {
			return tableData.sort((a, b) => {
				return b['Samples'] - a['Samples'];
			});
		}

		return tableData.sort((a, b) => {
			return a['Samples'] - b['Samples'];
		});
	};

	let columns = $state<Column[]>([
		{
			key: 'Task name',
			// cell: (info) => info.getValue(),
			// footer: (info) => info.column.id,
			sortingFn: taskNameSorter
		},
		{
			key: 'Latency average (ns)',
			sortingFn: (tableData: TableResult[], direction: 'asc' | 'desc') =>
				latencyAvgSort('Latency average (ns)', tableData, direction)
		},
		{
			key: 'Latency median (ns)',
			sortingFn: (tableData: TableResult[], direction: 'asc' | 'desc') =>
				latencyAvgSort('Latency median (ns)', tableData, direction)
		},
		{
			key: 'Throughput average (ops/s)',
			sortingFn: (tableData: TableResult[], direction: 'asc' | 'desc') =>
				latencyAvgSort('Throughput average (ops/s)', tableData, direction)
		},
		{
			key: 'Throughput median (ops/s)',
			sortingFn: (tableData: TableResult[], direction: 'asc' | 'desc') =>
				latencyAvgSort('Throughput median (ops/s)', tableData, direction)
		},
		{
			key: 'Samples',
			sortingFn: sampleSort
		}
	]);

	const worker = new BenchWorker();
	// {
	// 	// columns: $state.snapshot(() => columns),
	// 	...$state.snapshot(() => formState)
	// }
	worker.postMessage([10, 2]);
	worker.onmessage = (e) => {
		if (e.data.status) {
			status = e.data.status;
		}

		if (e.data.progress) {
			progress = e.data.progress;
		}

		if (e.data.results) {
			// Current sort
			const sorter = columns.find((c) => c.sort);

			if (sorter?.sort) {
				results = sorter.sortingFn(e.data.results, sorter.sort);
			} else {
				results = e.data.results;
			}
		}
	};
</script>

<header class="flex flex-col items-center gap-9">
	<h1 class="text-3xl font-bold">Simple Node validator benchmarks</h1>
</header>

<main class="flex items-center justify-center pb-4 pt-16">
	<div class="flex min-h-0 flex-1 flex-col items-center gap-16">
		<div class="w-full max-w-[300px] space-y-6 px-4">
			<!-- {/* List currently included validators */} -->
			<section>
				<h2 class="text-2xl font-bold">Currently included</h2>
				<ul class="grid grid-cols-2 space-y-2">
					{#each validators as { href, name }}
						<li>
							<a
								class="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
								{href}
								target="_blank"
								rel="noreferrer"
							>
								{name}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<div class="py-4">
			<div class="text-center">
				{#if status !== 'success' && status !== 'error'}
					<span class="animate-pulse">
						{#if status === 'pending' && !results.length}
							First
						{/if}
						Benchmark is loading...
					</span>
				{:else if status === 'success'}
					<span class="text-green-500">Success!</span>
				{:else if status === 'error'}
					<span class="text-red-500">Error</span>
				{/if}
			</div>
			{#if status === 'pending'}
				<div class="text-center">
					{#if progress}
						<span class="text-gray-700 dark:text-gray-300">
							Currently running:
							<span
								class="ml-2 inline-block translate-x-1/2 transform rounded-full bg-green-500 px-2 py-1 text-xs font-semibold leading-5 text-white"
							>
								{progress}
							</span>
						</span>
					{/if}
				</div>
			{/if}
		</div>

		<form
			class="space-y-4"
			onsubmit={(e) => {
				e.preventDefault();
				if (status === 'pending') return false;

				const form = new FormData(e.currentTarget);
				const its = Number(form.get('iterations'));
				const t = Number(form.get('time'));

				const newFormState = {
					time: t,
					iterations: its
				};

				formState = newFormState;

				worker.postMessage(newFormState);
				worker.postMessage([newFormState.time, newFormState.iterations]);
			}}
		>
			<!-- // action={(form) => {
      //   const iterations = Number(form.get('iterations'));
      //   const time = Number(form.get('time'));
      //   updateBench({ iterations, time });
      // }} -->
			<div class="flex gap-4">
				<label for="iterations" class="font-medium"> Iterations: </label>
				<!-- // disabled={status === 'pending'} -->
				<input
					type="number"
					id="iterations"
					name="iterations"
					min="1"
					value={formState.iterations}
					class="rounded-md border p-1 text-slate-800 disabled:text-slate-200"
					disabled={status === 'pending'}
					class:disabled={status === 'pending'}
				/>
			</div>
			<div class="flex gap-4">
				<label for="time" class="font-medium"> Time (seconds): </label>
				<input
					value={formState.time}
					type="number"
					id="time"
					name="time"
					min="1"
					class="rounded-md border p-1 text-slate-800 disabled:text-slate-200"
					disabled={status === 'pending'}
					class:disabled={status === 'pending'}
				/>
			</div>
			<button
				type="submit"
				class="rounded-md bg-blue-500 px-4 py-2 text-white disabled:bg-blue-300"
				disabled={status === 'pending'}
			>
				Start Benchmark
			</button>
		</form>

		<div class="relative w-2/3 overflow-x-auto">
			<table
				class="table-auto text-left text-sm text-gray-500 md:table-fixed rtl:text-right dark:text-gray-400"
			>
				<thead class="bg-gray-50 uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
					<tr>
						{#each columns as { key, sort, sortingFn }, idx}
							<th class="px-6 py-3">
								<!-- onclick={header.column.getToggleSortingHandler()} -->
								<!-- title={header.column.getCanSort()
											? header.column.getNextSortingOrder() === 'asc'
												? 'Sort ascending'
												: header.column.getNextSortingOrder() === 'desc'
													? 'Sort descending'
													: 'Clear sort'
											: undefined} -->
								<button
									class={'cursor-pointer select-none'}
									onclick={() => {
										if (sort === 'asc') {
											columns[idx].sort = 'desc';
										} else if (sort === 'desc') {
											columns[idx].sort = undefined;
										} else {
											columns[idx].sort = 'asc';
										}

										// Clear all other columns
										for (let i = 0; i < columns.length; i++) {
											if (i !== idx) {
												columns[i].sort = undefined;
											}
										}

										if (columns[idx].sort) {
											sortingFn(results, columns[idx].sort);
										}
									}}
								>
									{key}

									{#if sort === 'asc'}
										⬆️
									{:else if sort === 'desc'}
										⬇️
									{/if}
								</button>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each results as row}
						<tr
							class="border-b odd:bg-white even:bg-gray-50 hover:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800 dark:hover:bg-gray-600"
						>
							{#each columns as { key }}
								<td class="px-6 py-4">
									{row[key]}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>
