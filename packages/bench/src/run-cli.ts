import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBench } from "./runBench.js";
import type { HistoryData } from "./schemas/bench.schemas.js";
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
  let packageNames: string[] = [];

  const packagesIndex = args.indexOf("--packages");
  if (packagesIndex !== -1) {
    packageNames = args.slice(packagesIndex + 1);
  }

  if (packageNames.length === 0) {
    // Deduplicate and get all npm package names from the validators list
    packageNames = Array.from(new Set(validators.map((v) => v.npmPackageName)));
  }

  const tasksToRun: string[] = [];
  const packageVersions: Record<string, { pkgName: string; version: string }> = {};

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

    for (const validatorInfo of matchingValidators) {
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

  const historyPath = path.resolve(__dirname, "../../../../apps/web/src/data/history.json");
  let historyData: HistoryData = {};

  try {
    const historyContent = await fs.readFile(historyPath, "utf-8");
    historyData = JSON.parse(historyContent);
  } catch (_err) {
    console.log("Creating new history.json file");
  }

  const timestamp = new Date().toISOString();

  for (const result of results) {
    const taskName = result["Task name"];
    const versionInfo = packageVersions[taskName];
    if (!versionInfo) continue;

    const { pkgName, version } = versionInfo;

    if (!historyData[pkgName]) {
      historyData[pkgName] = {};
    }

    if (!historyData[pkgName][version]) {
      historyData[pkgName][version] = [];
    }

    historyData[pkgName][version].push({
      date: timestamp,
      metrics: result,
    });
  }

  await fs.mkdir(path.dirname(historyPath), { recursive: true });
  await fs.writeFile(historyPath, JSON.stringify(historyData, null, 2));

  console.log("Benchmark results saved to history.json");
}

main().catch((err) => {
  console.error("Fatal error running CLI:", err);
  process.exit(1);
});
