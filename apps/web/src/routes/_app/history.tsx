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
    <div className="stack">
      <header className="stack">
        <h2 className="no-margin">Historical Performance</h2>
        <p className="text-muted no-margin">Track benchmark performance across library versions.</p>
      </header>

      {/* Control Bar */}
      <div
        className="border box"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
        }}
      >
        <div className="stack" style={{ flex: "1 1 auto" }}>
          {allPackages.length > 0 && (
            <div className="stack">
              <div className="split center">
                <span className="fs-xs font-bold uppercase text-muted">
                  Filter by Packages ({selectedPackages.length} selected)
                </span>
                <div className="cluster">
                  <button type="button" onClick={() => setSelectedPackages([])} className="minimal fs-xs">
                    Reset
                  </button>
                  <span className="text-muted fs-xs">|</span>
                  <button type="button" onClick={() => setSelectedPackages(allPackages)} className="minimal fs-xs">
                    Select All
                  </button>
                </div>
              </div>
              <div className="cluster">
                {allPackages.map((pkg) => {
                  const isSelected = selectedPackages.includes(pkg);
                  return (
                    <button
                      key={pkg}
                      type="button"
                      onClick={() => togglePackage(pkg)}
                      className={`chip ${isSelected ? "selected" : ""}`}
                    >
                      {pkg}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="stack" style={{ minWidth: "220px", flex: "0 0 auto" }}>
          <label htmlFor="sort" className="fs-xs font-bold uppercase text-muted">
            Sort Runs &amp; Cards By
          </label>
          {/* biome-ignore lint/correctness/useUniqueElementIds: Ignoring... */}
          <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="version-desc">Version: Newest First</option>
            <option value="version-asc">Version: Oldest First</option>
            <option value="latency-asc">Latency (Med): Fastest First</option>
            <option value="throughput-desc">Throughput (Med): Highest First</option>
          </select>
        </div>
      </div>

      <div>
        {sortedAndFilteredPackages.length === 0 ? (
          <aside className="callout info">
            <p>No matching benchmark results found.</p>
          </aside>
        ) : (
          <div className="layout-card">
            {sortedAndFilteredPackages.map(({ pkgName, runs }) => (
              <article key={pkgName} className="card">
                <header>
                  <h3 className="no-margin">{pkgName}</h3>
                </header>
                <div className="table zebra scrollable" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Version</th>
                        <th scope="col">Date</th>
                        <th scope="col">Med Latency (ns)</th>
                        <th scope="col">Med Throughput (ops/s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run, idx) => (
                        <tr key={`${run.version}-${idx}`}>
                          <td className="font-bold">{run.version}</td>
                          <td className="text-muted">{new Date(run.date).toLocaleString()}</td>
                          <td style={{ color: "var(--green)" }}>{run.metrics["Latency med (ns)"]}</td>
                          <td style={{ color: "var(--purple)" }}>{run.metrics["Throughput med (ops/s)"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
