import { manyBenchmarks } from '@locals/bench/schemas';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingFn,
  type SortingState
} from '@tanstack/react-table';
import * as React from 'react';
import { Bench } from 'tinybench';
import { z } from 'zod';

const TableResultSchema = z.object({
  'Task name': z.string(),
  'Latency average (ns)': z.string(),
  'Latency median (ns)': z.string(),
  'Throughput average (ops/s)': z.string(),
  'Throughput median (ops/s)': z.string(),
  Samples: z.number(),
});

type TableResult = z.infer<typeof TableResultSchema>;

const columnHelper = createColumnHelper<TableResult>();

//custom sorting logic for one of our enum columns
const throughputAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
  const aThroughput = a.original['Throughput average (ops/s)'].split('\xb1')[0] ?? '';
  const bThroughput = b.original['Throughput average (ops/s)'].split('\xb1')[0] ?? '';

  return (
    Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10)
  );
};
const latencyAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
  const aThroughput = a.original['Latency average (ns)'].split('\xb1')[0] ?? '';
  const bThroughput = b.original['Latency average (ns)'].split('\xb1')[0] ?? '';

  return (
    Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10)
  );
};

function populateBench(bench: Bench) {
  for (const [key, benchFn] of Object.entries(manyBenchmarks)) {
    bench.add(key, benchFn);
  }
}


const updateBench = async (time: number, iterations: number) => {

  console.log('starting bench')
  
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
      // console.log('teardown', task, mode);
      if (mode !== 'warmup') {
        // setProgress(task.name);
      }
    },
    throws: true,
    // signal: abortSignal,
  });

  populateBench(bench);

  try {
    await bench.run();
  } catch (err) {
    console.error(err);
    // setStatus('error');
    // setAbortSignal(new AbortSignal());
    throw err;
  }

  const table = bench.table();
  const parsedTable = TableResultSchema.array().parse(table);
  const sortedTable = parsedTable.sort((a, b) => {
    const aThroughput = a['Throughput average (ops/s)'].split('\xb1')[0] ?? '';
    const bThroughput = b['Throughput average (ops/s)'].split('\xb1')[0] ?? '';

    return (
      Number.parseInt(bThroughput, 10) -
      Number.parseInt(aThroughput, 10)
    );
  });

  // setData(sortedTable);
  // setProgress('');
  // setStatus('success');

  return sortedTable
}


export const Route = createFileRoute('/')({
  component: HomeComponent,
  loader: async () => await updateBench(10, 2),
  // staleTime: Infinity,
  // shouldReload: false,

})

const columns = [
  columnHelper.accessor('Task name', {
    // cell: (info) => info.getValue(),
    // footer: (info) => info.column.id,
  }),
  columnHelper.accessor('Latency average (ns)', {
    // header: () => 'Age',
    // cell: (info) => info.renderValue(),
    // footer: (info) => info.column.id,
    sortingFn: latencyAvgSort,
  }),
  columnHelper.accessor('Latency median (ns)', {
    // header: () => <span>Visits</span>,
    // footer: (info) => info.column.id,
  }),
  columnHelper.accessor('Throughput average (ops/s)', {
    // header: 'Status',
    // footer: (info) => info.column.id,
    sortingFn: throughputAvgSort,
  }),
  columnHelper.accessor('Throughput median (ops/s)', {
    // header: 'Profile Progress',
    // footer: (info) => info.column.id,
  }),
  columnHelper.accessor('Samples', {
    // header: 'Sample',
    // footer: (info) => info.column.id,
  }),
];

function HomeComponent() {
  const router = useRouter()
  const state = Route.useLoaderData()
  // const queryClient = useQueryClient();
  
  // const query = useQuery({
  //   queryKey: ['bench'],
  //   queryFn: () => updateBench(time, iterations),
  // })

  // const mutation = useMutation({
  //   mutationFn: async () => {
  //     await queryClient.invalidateQueries({ queryKey: ['bench'] });
  //   }
  // })

  const [myStatus, setMyStatus] = React.useState<string|null>('idle');
  const [benchResults, setBenchResults] = React.useState(state);
  const [time, setTime] = React.useState(10);
  const [iterations, setIterations] = React.useState(2);

  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: 'Throughput median (ops/s)' satisfies keyof TableResult,
      desc: true,
    },
  ]);

  const table = useReactTable({
    // data: query.data || [],
    data: benchResults || [],
    columns,
    state: {
      sorting,
    },
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
  });


  
  // if (query.isPending) {
  if (router.state.isLoading) {
    return <span>Loading...</span>
  }
  
  // if (query.isFetching) {
  //   return <span>Fetching...</span>
  // }

  // if (query.isError) {
  //   return <span>Error: {query.error.message}</span>
  // }

  return (
    <main className='flex items-center justify-center pt-16 pb-4'>
    <div className='flex-1 flex flex-col items-center gap-16 min-h-0'>
      <header className='flex flex-col items-center gap-9'>
        <h1 className='text-4xl font-bold'>
          Simple Node validator benchmarks
        </h1>
      </header>
      <div className='max-w-[300px] w-full space-y-6 px-4'>
        {/* List currently included validators */}
        <section>
          <h2 className='text-2xl font-bold'>Currently included</h2>
          <ul className='grid grid-cols-2 space-y-2'>
            {validators.map(({ href, name }) => (
              <li key={href}>
                <a
                  className='group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500'
                  href={href}
                  target='_blank'
                  rel='noreferrer'
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className='py-4'>
        {`myStatus: ${myStatus}`}
        <br />
        {`status: ${router.state.status}`}
        {/* {`status: ${query.status}`} */}
        <pre>{JSON.stringify({
          isLoading: router.state.isLoading,
          isTransitioning: router.state.isTransitioning,
        }, null, 2)}</pre>
        {/* <pre>{JSON.stringify(query, null, 2)}</pre> */}
        <br />
        {/* isBenchPending -- {isBenchPending.toString()} */}
        <br />
        {/* loading -- {isLoading.toString()}
        <br /> */}
        <div
        // className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 ${
        //   status === 'pending' ? 'animate-pulse' : 'hidden'
        // }`}
        ></div>
        <div className='text-center'>
          {/* {status !== 'success' && status !== 'error' ? (
            <span className='animate-pulse'>
              {status === 'pending' ? 'First ' : 'Next '}
              Benchmark is loading...
            </span>
          ) : status === 'success' ? (
            <span className='text-green-500'>Success!</span>
          ) : status === 'error' ? (
            <span className='text-red-500'>Error</span>
          ) : null} */}
        </div>
        {/* {status === 'pending' && (
          <div className='text-center'> */}
        {/* {progress && (
              <span className='text-gray-700 dark:text-gray-300'>
                Currently running:
                <span className='inline-block ml-2 rounded-full px-2 py-1 text-xs font-semibold leading-5 text-white transform translate-x-1/2 bg-green-500'>
                  {progress}
                </span>
              </span>
            )} */}
        {/* </div>
        )} */}
      </div>

      <form
        className='space-y-4'
        // action={(form) => {
        //   const iterations = Number(form.get('iterations'));
        //   const time = Number(form.get('time'));
        //   updateBench({ iterations, time });
        // }}
      >
        <div className='flex gap-4'>
          <label htmlFor='iterations' className='font-medium'>
            Iterations:
          </label>
          <input
            // disabled={status === 'pending'}
            type='number'
            id='iterations'
            name='iterations'
            min='1'
            value={iterations}
            className='border rounded-md p-1'
            onChange={(e) => setIterations(Number(e.target.value))}
          />
        </div>
        <div className='flex gap-4'>
          <label htmlFor='time' className='font-medium'>
            Time (seconds):
          </label>
          <input
            // disabled={status === 'pending'}
            type='number'
            id='time'
            name='time'
            min='1'
            value={time}
            className='border rounded-md p-1'
            onChange={(e) => setTime(Number(e.target.value))}
          />
        </div>
        <button
          // disabled={status === 'pending'}
          type='button'
          className='bg-blue-500 text-white px-4 py-2 rounded-md'
          onClick={() => {
            console.log('setPending')
            setMyStatus('pending');
            // mutation.mutate()
            void updateBench(time, iterations).then((d) => {
              setBenchResults(d);
              console.log('setIdle')
              setMyStatus('idle');
            })
          }}
        >
          Start Benchmark
        </button>
      </form>

      <div className='relative overflow-x-auto w-2/3'>
        <table
          // {...{
          //   style: {
          //     width: table.getCenterTotalSize(),
          //   },
          // }}
          className='text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 md:table-fixed table-auto'
        >
          <thead className='text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400'>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    // className={`w-[${header.column.getSize()}px]`}
                    className='px-6 py-3'
                  >
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                            ? 'Sort descending'
                            : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' ⬆️',
                        desc: ' ⬇️',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className='odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className='px-6 py-4'>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot> */}
        </table>
        <div className='h-4' />
        {/* <button onClick={() => rerender()} className='border p-2'>
            Rerender
          </button> */}
      </div>
    </div>
  </main>
  )
}



type ValidatorResource = {
  href: string;
  name: string;
};

const validators: ValidatorResource[] = [
  {
    href: 'https://www.npmjs.com/package/ajv',
    name: 'ajv',
  },
  {
    href: 'https://www.npmjs.com/package/joi',
    name: 'joi',
  },
  {
    href: 'https://www.npmjs.com/package/yup',
    name: 'yup',
  },
  {
    href: 'https://www.npmjs.com/package/zod',
    name: 'zod',
  },
  {
    href: 'https://www.npmjs.com/package/myzod',
    name: 'myzod',
  },
  {
    href: 'https://valibot.dev/',
    name: 'valibot',
  },
  {
    href: 'https://effect.website/docs/schema/introduction/',
    name: '@effect/schema',
  },
];