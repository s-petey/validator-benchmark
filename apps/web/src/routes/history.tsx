import { type HistoryData, HistoryDataSchema } from "@locals/bench/bench.schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/history")({
  component: HistoryComponent,
});

function HistoryComponent() {
  const data = useMemo(() => {
    const rawHistoryModules = import.meta.glob<{ default: HistoryData }>("../data/history/*.json", { eager: true });
    const rawHistoryData: HistoryData = Object.assign(
      {},
      ...Object.values(rawHistoryModules).map((module) => module.default),
    );
    return HistoryDataSchema.parse(rawHistoryData);
  }, []);

  return (
    <div className="flex flex-col justify-center">
      <header className="flex flex-col p-4">
        <h1 className="text-4xl font-bold">Historical Performance</h1>
        <p className="mt-2 text-gray-400">Track benchmark performance across library versions.</p>
        <div className="flex gap-4 mt-2">
          <Link to="/" className="text-blue-500 hover:text-blue-700">
            Go home
          </Link>
        </div>
      </header>

      <div className="mx-4 mt-4 grid grid-cols-1 xl:grid-cols-2 gap-8">
        {Object.entries(data).map(([pkgName, versions]) => (
          <div key={pkgName} className="bg-gray-800 rounded-lg p-6 shadow">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2">{pkgName}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b-2 border-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      Version
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Avg Latency (ns)
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Avg Throughput (ops/s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(versions)
                    .flatMap(([version, runs]) => runs.map((run) => ({ version, ...run })))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((run, idx) => (
                      <tr
                        key={`${run.version}-${idx}`}
                        className="border-b border-gray-700 hover:bg-gray-700 transition"
                      >
                        <td className="px-6 py-4 font-bold">{run.version}</td>
                        <td className="px-6 py-4">{new Date(run.date).toLocaleString()}</td>
                        <td className="px-6 py-4">{run.metrics["Latency avg (ns)"]}</td>
                        <td className="px-6 py-4">{run.metrics["Throughput avg (ops/s)"]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
