import { validators } from "@locals/bench/schemas";
import { TableResultSchema } from "@locals/bench-worker/bench.schemas";
import ComWorker from "@locals/bench-worker/comlinkWorker?worker";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingFn,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { proxy, wrap } from "comlink";
import { useState } from "react";
import type { z } from "zod";

type TableResult = z.infer<typeof TableResultSchema>;

const columnHelper = createColumnHelper<TableResult>();

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

type TableKeysWithStringValues = Exclude<keyof TableResult, "Samples">;

function isStringTableResult(key: string): key is TableKeysWithStringValues {
  return key in TableResultSchema.shape;
}
//custom sorting logic for one of our enum columns
const throughputAvgSort: SortingFn<TableResult> = (a, b, _columnId) => {
  if (!isStringTableResult(_columnId)) {
    return 0;
  }
  const aThroughput = a.original[_columnId].split("\xb1")?.[0] ?? "0";
  const bThroughput = b.original[_columnId].split("\xb1")?.[0] ?? "0";

  return Number.parseInt(bThroughput, 10) - Number.parseInt(aThroughput, 10);
};

const columns = [
  columnHelper.accessor("Task name", {}),
  columnHelper.accessor("Latency avg (ns)", {
    sortingFn: throughputAvgSort,
  }),
  columnHelper.accessor("Latency med (ns)", {
    sortingFn: throughputAvgSort,
  }),
  columnHelper.accessor("Throughput avg (ops/s)", {
    sortingFn: throughputAvgSort,
  }),
  columnHelper.accessor("Throughput med (ops/s)", {
    sortingFn: throughputAvgSort,
  }),
  columnHelper.accessor("Samples", {}),
];

const worker = new ComWorker({
  name: "comlink-bench-worker",
});
const workerApi = wrap<import("@locals/bench-worker/comlinkWorker").ComlinkWorker>(worker);

function HomeComponent() {
  const [time, setTime] = useState(10);
  const [iterations, setIterations] = useState(2);
  const [selectedValidators, setSelectedValidators] = useState(() => validators.map((v) => v.name));
  const [formState, setFormState] = useState({
    time,
    iterations, 
    selectedValidators,
  });
  const [progress, setProgress] = useState("");

  const { data, status, isPlaceholderData } = useQuery({
    queryKey: ["bench", formState.time, formState.iterations, formState.selectedValidators],
    queryFn: () =>
      workerApi.benchWorker(formState.time, formState.iterations, proxy(setProgress)).then((v) => {
        // Filter results based on selected validators
        return v.filter((result) => formState.selectedValidators.includes(result["Task name"]));
      }),
    staleTime: Infinity,
    placeholderData: (a) => a,
  });

  return (
    <main className="flex flex-col justify-center gap-4">
      <header className="flex flex-col p-4">
        <h1 className="text-4xl font-bold">Node validator benchmarks</h1>
      </header>

      <div className="flex-1 flex flex-col items-center gap-4 min-h-0">
        <div className="w-full px-4">
          {/* List currently included validators */}
          <section className='flex flex-col items-center gap-2'>
            <h2 className="text-2xl font-bold">Select validators to run</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full justify-items-center">
              {validators.map(({ href, name }) => (
                <div key={`validator-${name}-${href}`} className="p-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedValidators.includes(name)}
                    onChange={() => {
                      setSelectedValidators((prev) =>
                        prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
                      );
                    }}
                    id={`checkbox-${name}`}
                  />
                  <label htmlFor={`checkbox-${name}`} className="cursor-pointer">
                    <a
                      className="text-blue-700 hover:underline dark:text-blue-500"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {name}
                    </a>
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="py-4">
          <div
            className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 ${
              status === "pending" ? "animate-pulse" : "hidden"
            }`}
          ></div>
          <div className="text-center">
            {isPlaceholderData || (status !== "success" && status !== "error") ? (
              <span className="animate-pulse">Benchmark is loading...</span>
            ) : status === "success" ? (
              <span className="text-green-500">Success!</span>
            ) : status === "error" ? (
              <span className="text-red-500">Error</span>
            ) : null}
          </div>
          {(isPlaceholderData || status === "pending") && (
            <div className="text-center">
              {progress && (
                <span className="text-gray-700 dark:text-gray-300">
                  Currently running:
                  <span className="inline-block ml-2 rounded-full px-2 py-1 text-xs font-semibold leading-5 text-white transform translate-x-1/2 bg-green-500">
                    {progress}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <form
          className="space-y-4 flex items-center flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            setFormState({
              time,
              iterations,
              selectedValidators,
            });
          }}
        >
          <div className="flex gap-4">
            <label htmlFor="iterations" className="font-medium">
              Iterations:
            </label>
            <input
              disabled={isPlaceholderData || status === "pending"}
              type="number"
              id="iterations"
              name="iterations"
              min="1"
              value={iterations}
              className="border rounded-md p-1 disabled:opacity-50"
              onChange={(e) => setIterations(Number(e.target.value))}
            />

            <Tooltip text="Number of times that a task should run if even the time option is finished" />
          </div>
          <div className="flex gap-4 items-center">
            <label htmlFor="time" className="font-medium">
              Time (ms):
            </label>
            <input
              disabled={isPlaceholderData || status === "pending"}
              type="number"
              id="time"
              name="time"
              min="1"
              value={time}
              className="border rounded-md p-1 disabled:opacity-50"
              onChange={(e) => setTime(Number(e.target.value))}
            />

            <Tooltip text="Time needed for running a benchmark task (milliseconds)" />
          </div>
          <button
            disabled={isPlaceholderData || status === "pending"}
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Start Benchmark
          </button>
        </form>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          The benchmark will only run the results one time per combination of time and iterations until the browser
          reloads.
        </div>

        <div className="relative overflow-x-auto w-2/3">
          <Table data={data ?? []} placeholder={isPlaceholderData} />

          <div className="h-4" />
          {/* <button onClick={() => rerender()} className='border p-2'>
            Rerender
          </button> */}
        </div>
      </div>
    </main>
  );
}

function Table({ data, placeholder }: { data: TableResult[]; placeholder: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "Throughput med (ops/s)" satisfies keyof TableResult,
      desc: false,
    },
  ]);

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
    },
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
  });

  return (
    <table
      className={
        "text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 md:table-fixed table-auto" +
        (placeholder ? " opacity-50" : "")
      }
    >
      <thead className="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-6 py-3">
                <button
                  type="button"
                  className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                  onClick={header.column.getToggleSortingHandler()}
                  title={
                    header.column.getCanSort()
                      ? header.column.getNextSortingOrder() === "asc"
                        ? "Sort ascending"
                        : header.column.getNextSortingOrder() === "desc"
                          ? "Sort descending"
                          : "Clear sort"
                      : undefined
                  }
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                    asc: " ⬆️",
                    desc: " ⬇️",
                  }[header.column.getIsSorted() as string] ?? null}
                </button>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-6 py-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const Tooltip = ({ text }: { text: string }) => {
  return (
    <div className="relative group">
      &#9432;
      <div className="absolute w-48 left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
        {text}
      </div>
    </div>
  );
};
