import Chart from 'react-google-charts';
import logoDark from './logo-dark.svg';
import logoLight from './logo-light.svg';
import { Bench, type BenchOptions } from 'tinybench';
import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnOrderState,
  type SortingFn,
  type SortingState,
} from '@tanstack/react-table';
import { z } from 'zod';
import { manyBenchmarks } from '@locals/bench/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  const aThroughput = a.original['Throughput average (ops/s)'].split('\xb1');
  const bThroughput = b.original['Throughput average (ops/s)'].split('\xb1');

  return (
    Number.parseInt(bThroughput[0], 10) - Number.parseInt(aThroughput[0], 10)
  );
};
const latencyAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
  const aThroughput = a.original['Latency average (ns)'].split('\xb1');
  const bThroughput = b.original['Latency average (ns)'].split('\xb1');

  return (
    Number.parseInt(bThroughput[0], 10) - Number.parseInt(aThroughput[0], 10)
  );
};

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

// TODO: I have this working, however I think
// I'd prefer to change to tanstack start properly
// then actually implement it without tanstack query
// and use the URL state to update time / iterations
// to then render the page and redirect with loading state.

function useBench() {
  // Access the client
  const queryClient = useQueryClient();

  const [time, setTime] = useState(10);
  const [iterations, setIterations] = useState(2);

  const {
    data: table,
    isPending,
    isLoading,
  } = useQuery({
    // queryKey: ['bench', iterations, time],
    queryKey: ['bench'],
    queryFn: async () => {
      console.log('running query');
      // const [status, setStatus] = useState<
      //   'loading' | 'success' | 'error' | null
      // >(null);
      // const [progress, setProgress] = useState('');
      // const [data, setData] = useState<TableResult[]>([]);
      // const [abortSignal, setAbortSignal] = useState<AbortSignal>();

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
        const aThroughput = a['Throughput average (ops/s)'].split('\xb1');
        const bThroughput = b['Throughput average (ops/s)'].split('\xb1');

        return (
          Number.parseInt(bThroughput[0], 10) -
          Number.parseInt(aThroughput[0], 10)
        );
      });

      // setData(sortedTable);
      // setProgress('');
      // setStatus('success');

      return sortedTable;
    },

    // onSuccess: () => {
    //   // Invalidate and refetch
    //   queryClient.invalidateQueries({ queryKey: ['todos'] });
    // },
  });

  const { mutate: updateBench, isPending: isBenchPending } = useMutation({
    mutationFn: async ({
      time: newTime,
      iterations: newIterations,
    }: Required<Pick<BenchOptions, 'time' | 'iterations'>>) => {
      setIterations(newIterations);
      setTime(newTime);
      queryClient.invalidateQueries({ queryKey: ['bench'] });
    },
  });

  // const { data: fruits = [] } = useQuery({
  //   queryKey: ["fruits-query"],
  //   queryFn: async () => {
  //     const fruits = await localforage.getItem<Array<Fruit>>("fruits");
  //     return fruits || [];
  //   },
  // });

  // const { mutateAsync: addFruit, isPending: isAddFruitPending } = useMutation({
  //   mutationFn: async (fruit: string) => {
  //     await localforage.setItem("fruits", [
  //       ...fruits,
  //       {
  //         fruitid: Math.random(),
  //         name: fruit,
  //       },
  //     ]);
  //   },
  //   onSuccess() {
  //     queryClient.invalidateQueries({
  //       queryKey: ["fruits-query"],
  //     });
  //   },
  // });

  // const { mutateAsync: deleteFruit, isPending: isDeleteFruitPending } =
  //   useMutation({
  //     mutationFn: async (fruitid: string) => {
  //       await localforage.setItem(
  //         "fruits",
  //         fruits.filter(fruit => fruit.fruitid !== fruitid)
  //       );
  //     },
  //     onSuccess() {
  //       queryClient.invalidateQueries({
  //         queryKey: ["fruits-query"],
  //       });
  //     },
  //   });

  // return {
  //   fruits,
  //   addFruit,
  //   isAddFruitPending,
  //   deleteFruit,
  //   isDeleteFruitPending,
  // };

  console.log({ isPending, isLoading, isBenchPending });

  return {
    table,
    updateBench,
    isBenchPending,
    time,
    iterations,
  };
}

// bench
//   .add('faster task', () => {
//     console.log('I am faster');
//   })
//   .add('slower task', async () => {
//     await new Promise((resolve) => setTimeout(resolve, 1)); // we wait 1ms :)
//     console.log('I am slower');
//   });

function populateBench(bench: Bench) {
  for (const [key, benchFn] of Object.entries(manyBenchmarks)) {
    bench.add(key, benchFn);
  }
}

export function Welcome() {
  // { files }:
  // { files: string[] }
  // console.log(files);

  // const [formState, setFormState] = useState({
  //   iterations: 2,
  //   time: 10,
  // });
  // const [iterations, setIterations] = useState(2);
  // const [time, setTime] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: 'Throughput median (ops/s)' satisfies keyof TableResult,
      desc: true,
    },
  ]);
  const {
    table: tableData,
    isBenchPending,
    updateBench,
    time,
    iterations,
  } = useBench();

  const table = useReactTable({
    data: tableData || [],
    columns,
    state: {
      sorting,
    },
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
  });

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
          {/* {`status: ${status}`}
          <br /> */}
          isBenchPending -- {isBenchPending.toString()}
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
          action={(form) => {
            const iterations = Number(form.get('iterations'));
            const time = Number(form.get('time'));
            updateBench({ iterations, time });
          }}
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
              defaultValue={iterations}
              // value={iterations}
              className='border rounded-md p-1'
              // onChange={(e) => setIterations(Number(e.target.value))}
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
              defaultValue={time}
              // value={time}
              className='border rounded-md p-1'
              // onChange={(e) => setTime(Number(e.target.value))}
            />
          </div>
          <button
            // disabled={status === 'pending'}
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-md'
            // onClick={() => {
            //   setFormState({ iterations, time });
            //   queryClient.invalidateQueries({ queryKey: ['bench'] });
            // }}
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
  );
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

const resources = [
  {
    href: 'https://reactrouter.com/docs',
    text: 'React Router Docs',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='20'
        viewBox='0 0 20 20'
        fill='none'
        className='stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300'
      >
        <path
          d='M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
  {
    href: 'https://rmx.as/discord',
    text: 'Join Discord',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='20'
        viewBox='0 0 24 20'
        fill='none'
        className='stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300'
      >
        <path
          d='M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z'
          strokeWidth='1.5'
        />
      </svg>
    ),
  },
];
