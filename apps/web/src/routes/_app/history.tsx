import { type HistoryData, HistoryDataSchema, type TableResult } from "@locals/bench/bench.schemas";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_app/history")({
  component: HistoryComponent,
});

type SortOption = "date-desc" | "date-asc" | "version-desc" | "version-asc" | "latency-asc" | "throughput-desc";

interface RenderRun {
  version: string;
  date: string;
  metrics: TableResult;
}

interface RenderPackage {
  pkgName: string;
  runs: RenderRun[];
}

function parseNumber(val: string): number {
  const match = val.match(/^[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function HistoryComponent() {
  const [sortBy, setSortBy] = useState<SortOption>("throughput-desc");
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);

  const data = useMemo(() => {
    const rawHistoryModules = import.meta.glob<{ default: HistoryData }>("../../data/history/*.json", { eager: true });
    const rawHistoryData: HistoryData = Object.assign(
      {},
      ...Object.values(rawHistoryModules).map((module) => module.default),
    );
    return HistoryDataSchema.parse(rawHistoryData);
  }, []);

  const allPackages = useMemo(() => {
    return Object.keys(data).sort();
  }, [data]);

  const togglePackage = (pkg: string) => {
    setSelectedPackages((prev) => (prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]));
  };

  const sortedAndFilteredPackages = useMemo<RenderPackage[]>(() => {
    const packagesList: RenderPackage[] = [];

    for (const [pkgName, versions] of Object.entries(data)) {
      // 1. Filter packages by selection
      if (selectedPackages.length > 0 && !selectedPackages.includes(pkgName)) {
        continue;
      }

      // 2. Flatten all versions and runs
      const runs: RenderRun[] = Object.entries(versions).flatMap(([version, versionRuns]) =>
        versionRuns.map((run) => ({
          version,
          ...run,
        })),
      );

      // 3. Sort runs internally inside this card
      runs.sort((a, b) => {
        if (sortBy === "date-desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === "date-asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === "version-desc") {
          return b.version.localeCompare(a.version, undefined, { numeric: true });
        }
        if (sortBy === "version-asc") {
          return a.version.localeCompare(b.version, undefined, { numeric: true });
        }
        if (sortBy === "latency-asc") {
          const aLat = parseNumber(a.metrics["Latency med (ns)"]);
          const bLat = parseNumber(b.metrics["Latency med (ns)"]);
          return aLat - bLat;
        }
        if (sortBy === "throughput-desc") {
          const aThru = parseNumber(a.metrics["Throughput med (ops/s)"]);
          const bThru = parseNumber(b.metrics["Throughput med (ops/s)"]);
          return bThru - aThru;
        }
        return 0;
      });

      packagesList.push({
        pkgName,
        runs,
      });
    }

    // 4. Cascade the sort to Card Level using the leading/best run (`runs[0]`) of each card
    return packagesList.sort((a, b) => {
      const aBest = a.runs[0];
      const bBest = b.runs[0];

      // Safe fallbacks for empty runs (if any)
      if (!aBest) return 1;
      if (!bBest) return -1;

      if (sortBy === "date-desc") {
        return new Date(bBest.date).getTime() - new Date(aBest.date).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(aBest.date).getTime() - new Date(bBest.date).getTime();
      }
      if (sortBy === "version-desc") {
        return bBest.version.localeCompare(aBest.version, undefined, { numeric: true });
      }
      if (sortBy === "version-asc") {
        return aBest.version.localeCompare(bBest.version, undefined, { numeric: true });
      }
      if (sortBy === "latency-asc") {
        const aLat = parseNumber(aBest.metrics["Latency med (ns)"]);
        const bLat = parseNumber(bBest.metrics["Latency med (ns)"]);
        if (aLat !== bLat) return aLat - bLat;
        return a.pkgName.localeCompare(b.pkgName); // Tie-breaker
      }
      if (sortBy === "throughput-desc") {
        const aThru = parseNumber(aBest.metrics["Throughput med (ops/s)"]);
        const bThru = parseNumber(bBest.metrics["Throughput med (ops/s)"]);
        if (aThru !== bThru) return bThru - aThru;
        return a.pkgName.localeCompare(b.pkgName); // Tie-breaker
      }
      return a.pkgName.localeCompare(b.pkgName); // Default alphabetical sort if fallback
    });
  }, [data, selectedPackages, sortBy]);

  return (
    <div className="flex flex-col justify-start min-h-screen bg-gray-900 text-white">
      <header className="flex flex-col p-6 border-b border-gray-800 bg-gray-950">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Historical Performance</h2>
            <p className="mt-2 text-gray-400">Track benchmark performance across library versions.</p>
          </div>
        </div>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-950 border-b border-gray-800">
        <div className="flex-1 flex flex-col gap-1.5">
          {/* Package Selection Tags */}
          {allPackages.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Filter by Packages ({selectedPackages.length} selected)
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPackages([])}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                  >
                    Reset
                  </button>
                  <span className="text-gray-700 text-xs">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPackages(allPackages)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition"
                  >
                    Select All
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {allPackages.map((pkg) => {
                  const isSelected = selectedPackages.includes(pkg);
                  return (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => togglePackage(pkg)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                        isSelected
                          ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30"
                          : "bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      }`}
                    >
                      {pkg}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-72 flex flex-col gap-1.5">
          <label htmlFor="sort" className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Sort Runs &amp; Cards By
          </label>
          {/* biome-ignore lint/correctness/useUniqueElementIds: Ignoring... */}
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="version-desc">Version: Newest First</option>
            <option value="version-asc">Version: Oldest First</option>
            <option value="latency-asc">Latency (Med): Fastest First</option>
            <option value="throughput-desc">Throughput (Med): Highest First</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {sortedAndFilteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">No matching benchmark results found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {sortedAndFilteredPackages.map(({ pkgName, runs }) => (
              <div key={pkgName} className="bg-gray-800 rounded-lg p-6 shadow-xl border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 border-b border-gray-700 pb-2 text-blue-400">{pkgName}</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm whitespace-nowrap">
                    <thead className="uppercase tracking-wider border-b border-gray-700 text-gray-400 font-semibold">
                      <tr>
                        <th scope="col" className="px-6 py-4">
                          Version
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Med Latency (ns)
                        </th>
                        <th scope="col" className="px-6 py-4">
                          Med Throughput (ops/s)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run, idx) => (
                        <tr
                          key={`${run.version}-${idx}`}
                          className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-150"
                        >
                          <td className="px-6 py-4 font-bold text-gray-100">{run.version}</td>
                          <td className="px-6 py-4 text-gray-300">{new Date(run.date).toLocaleString()}</td>
                          <td className="px-6 py-4 text-emerald-400 font-mono">{run.metrics["Latency med (ns)"]}</td>
                          <td className="px-6 py-4 text-purple-400 font-mono">
                            {run.metrics["Throughput med (ops/s)"]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
