import { TableResultSchema } from "@locals/bench/bench.schemas";
import { validators } from "@locals/bench/benchmarks";
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

export const Route = createFileRoute("/_app/")({
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
      workerApi
        .benchWorker(formState.time, formState.iterations, proxy(setProgress), formState.selectedValidators)
        .then((v) => {
          // Filter results based on selected validators
          return v.filter((result) =>
            // @ts-expect-error We are comparing a string to a literal
            formState.selectedValidators.includes(result["Task name"]),
          );
        }),
    staleTime: Infinity,
    placeholderData: (a) => a,
  });

  return (
    <main className="stack">
      <div className="stack">
        <div>
          {/* List currently included validators */}
          <section className="stack">
            <h2 className="text-center no-margin">Select validators to run</h2>
            <div className="grid auto">
              {validators.map(({ href, name }) => (
                <div key={`validator-${name}-${href}`} className="form-option-row">
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
                  <label htmlFor={`checkbox-${name}`} className="cursor-pointer cluster">
                    <span>{name}</span>
                    <a href={href} className="icon-button" target="_blank" rel="noreferrer">
                      <svg
                        style={{ height: 24, width: 24 }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <title>Open in new tab</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </label>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div>
          <div className="text-center">
            {isPlaceholderData || (status !== "success" && status !== "error") ? (
              <span
                style={{
                  animation: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                Benchmark is loading...
              </span>
            ) : status === "success" ? (
              <span className="tag success">Success!</span>
            ) : status === "error" ? (
              <span className="tag error">Error</span>
            ) : null}
          </div>
          {(isPlaceholderData || status === "pending") && (
            <div className="text-center">
              {progress && (
                <span className="text-muted">
                  Currently running:
                  <span className="tag success" style={{ marginLeft: "0.5rem" }}>
                    {progress}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <form
          className="stack"
          style={{ maxWidth: "400px", margin: "0 auto" }}
          onSubmit={(e) => {
            e.preventDefault();
            setFormState({
              time,
              iterations,
              selectedValidators,
            });
          }}
        >
          <div className="row">
            <label htmlFor="iterations" className="font-medium cluster">
              <span className="tooltip">
                <span>Iterations:</span>
                <span className="tip"> Number of times that a task should run if even the time option is finished</span>
              </span>
            </label>
            {/* biome-ignore lint/correctness/useUniqueElementIds: Ignoring... */}
            <input
              disabled={isPlaceholderData || status === "pending"}
              type="number"
              id="iterations"
              name="iterations"
              min="1"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
            />
          </div>
          <div className="row">
            <label htmlFor="time" className="font-medium cluster">
              <span className="tooltip">
                <span>Time (ms):</span>
                <span className="tip">Time needed for running a benchmark task (milliseconds)</span>
              </span>
            </label>
            {/* biome-ignore lint/correctness/useUniqueElementIds: Ignoring... */}
            <input
              disabled={isPlaceholderData || status === "pending"}
              type="number"
              id="time"
              name="time"
              min="1"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
            />
          </div>
          <button disabled={isPlaceholderData || status === "pending"} type="submit" className="primary full">
            Start Benchmark
          </button>
        </form>

        <div className="text-muted text-center fs-xs">
          The benchmark will only run the results one time per combination of time and iterations until the browser
          reloads.
        </div>

        <div className="stack" style={{ alignItems: "center" }}>
          <Table data={data ?? []} placeholder={isPlaceholderData} />
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
    <div
      style={{
        opacity: placeholder ? "0.5" : undefined,
        width: "100%",
      }}
      className="table zebra"
    >
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  <button
                    type="button"
                    className="reset font-bold"
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
