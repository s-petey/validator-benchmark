import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBench } from "./runBench.js";
import type { HistoryData, TableResult } from "./schemas/bench.schemas.js";
import { validators } from "./schemas/benchmarks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getPackageVersion(packageName: string): Promise<string | null> {
  try {
    const pkgPath = path.resolve(__dirname, "../../node_modules", packageName, "package.json");
    const pkgContent = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgContent);
    return pkg.version;
  } catch (_err) {
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const hasOverride = args.includes("--override") || args.includes("--force") || args.includes("-f");

  // Filter out the flags so they aren't treated as package names
  const cleanArgs = args.filter((arg) => arg !== "--override" && arg !== "--force" && arg !== "-f");

  let packageNames: string[] = [];

  const packagesIndex = cleanArgs.indexOf("--packages");
  if (packagesIndex !== -1) {
    packageNames = cleanArgs.slice(packagesIndex + 1);
  }

  if (packageNames.length === 0) {
    // Deduplicate and get all npm package names from the validators list
    packageNames = Array.from(new Set(validators.map((v) => v.npmPackageName)));
  }

  const historyDir = path.resolve(__dirname, "../../../../apps/web/src/data/history");
  const todayStr = new Date().toISOString().split("T")[0];

  const tasksToRun: string[] = [];
  const packageVersions: Record<string, { pkgName: string; version: string }> = {};
  const historyCache: Record<string, HistoryData> = {};

  for (const pkgName of packageNames) {
    const matchingValidators = validators.filter((v) => v.npmPackageName === pkgName);
    if (matchingValidators.length === 0) {
      console.warn(`Unknown package ${pkgName}. Skipping...`);
      continue;
    }

    const version = await getPackageVersion(pkgName);
    if (!version) {
      console.warn(`Could not find version for ${pkgName}. Skipping...`);
      continue;
    }

    const safeFilename = pkgName.replace(/[^a-zA-Z0-9-]/g, "_") + ".json";
    const packageHistoryPath = path.join(historyDir, safeFilename);
    let singleHistoryData: HistoryData = {};

    try {
      const historyContent = await fs.readFile(packageHistoryPath, "utf-8");
      singleHistoryData = JSON.parse(historyContent) as HistoryData;
    } catch (_err) {
      // It's fine if the file does not exist yet
    }

    historyCache[pkgName] = singleHistoryData;

    for (const validatorInfo of matchingValidators) {
      if (!hasOverride) {
        // Check if there is already a record for this validator today
        const hasTodayRecord = singleHistoryData[pkgName]?.[version]?.some(
          (record) => record.metrics["Task name"] === validatorInfo.name && record.date.split("T")[0] === todayStr,
        );

        if (hasTodayRecord) {
          console.log(
            `Skipping parser ${validatorInfo.name} (${version}) - already run today. Use --override or --force to run anyway.`,
          );
          continue;
        }
      }

      tasksToRun.push(validatorInfo.name);
      packageVersions[validatorInfo.name] = { pkgName, version };
    }
  }

  if (tasksToRun.length === 0) {
    console.log("No valid packages to run.");
    process.exit(0);
  }

  console.log("Running benchmarks for:", tasksToRun.join(", "));

  // Default values for time and iterations
  const time = 500;
  const iterations = 10;

  const results = await runBench(time, iterations, (v) => console.log(`Progress: ${v}`), tasksToRun);

  const timestamp = new Date().toISOString();

  // Group results by package so we write to individual history files
  const resultsByPackage: Record<string, { version: string; result: TableResult }[]> = {};

  for (const result of results) {
    const taskName = result["Task name"];
    const versionInfo = packageVersions[taskName];
    if (!versionInfo) continue;

    const { pkgName, version } = versionInfo;

    let packageGroup = resultsByPackage[pkgName];
    if (!packageGroup) {
      packageGroup = [];
      resultsByPackage[pkgName] = packageGroup;
    }
    packageGroup.push({ version, result });
  }

  await fs.mkdir(historyDir, { recursive: true });

  for (const [pkgName, items] of Object.entries(resultsByPackage)) {
    const singleHistoryData = historyCache[pkgName] ?? {};

    let pkgData = singleHistoryData[pkgName];
    if (!pkgData) {
      pkgData = {};
      singleHistoryData[pkgName] = pkgData;
    }

    for (const { version, result } of items) {
      let versionRuns = pkgData[version];
      if (!versionRuns) {
        versionRuns = [];
        pkgData[version] = versionRuns;
      }

      versionRuns.push({
        date: timestamp,
        metrics: result,
      });
    }

    const safeFilename = pkgName.replace(/[^a-zA-Z0-9-]/g, "_") + ".json";
    const packageHistoryPath = path.join(historyDir, safeFilename);

    await fs.writeFile(packageHistoryPath, JSON.stringify(singleHistoryData, null, 2));
  }

  console.log("Benchmark results saved to separate history files.");
}

main().catch((err) => {
  console.error("Fatal error running CLI:", err);
  process.exit(1);
});
