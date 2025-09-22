import { validators } from "@locals/bench/benchmarks";
import type { TableResultSchema } from "@locals/bench-worker/bench.schemas";
import ComWorker from "@locals/bench-worker/comlinkWorker?worker";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { proxy, wrap } from "comlink";
import { useState } from "react";
import type { z } from "zod";

type TableResult = z.infer<typeof TableResultSchema>;

export const Route = createFileRoute("/presentation")({
  component: PresentationComponent,
});

const worker = new ComWorker({
  name: "comlink-bench-worker",
});
const workerApi = wrap<import("@locals/bench-worker/comlinkWorker").ComlinkWorker>(worker);

function useBenchmarkData(formState: { time: number; iterations: number; selectedValidators: string[] }) {
  const [progress, setProgress] = useState("");

  return {
    progress,
    ...useQuery({
      queryKey: ["bench", formState.time, formState.iterations, formState.selectedValidators],
      queryFn: () =>
        workerApi
          .benchWorker(formState.time, formState.iterations, proxy(setProgress), formState.selectedValidators)
          .then((v) => {
            return v.filter((result) => formState.selectedValidators.includes(result["Task name"]));
          }),
      staleTime: Infinity,
      placeholderData: (a) => a,
    }),
  };
}

function IntroSlide() {
  return (
    <div className="text-center space-y-6">
      <h2 className="text-3xl font-semibold">Performance Matters</h2>
      <div className="text-xl space-y-4">
        <p>Runtime validation is critical for:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>API input validation</li>
          <li>Form data processing</li>
          <li>Real-time data streams</li>
          <li>Type safety at runtime</li>
        </ul>
      </div>
    </div>
  );
}

function ThroughputSlide({
  data,
  onStartBenchmark,
  time,
  setTime,
  iterations,
  setIterations,
  selectedValidators,
  setSelectedValidators,
  progress,
  status,
  isPlaceholderData,
}: {
  data: TableResult[];
  onStartBenchmark: () => void;
  time: number;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  iterations: number;
  setIterations: React.Dispatch<React.SetStateAction<number>>;
  selectedValidators: string[];
  setSelectedValidators: React.Dispatch<React.SetStateAction<string[]>>;
  progress: string;
  status: string;
  isPlaceholderData: boolean;
}) {
  const throughputData = data
    .map((item) => ({
      name: item["Task name"],
      throughput: parseInt(item["Throughput avg (ops/s)"].split(" ±")[0]!.replace(/,/g, ""), 10),
      latency: parseFloat(item["Latency avg (ns)"].split(" ±")[0]!),
    }))
    .sort((a, b) => b.throughput - a.throughput);

  const maxThroughput = Math.max(...throughputData.map((d) => d.throughput));

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Benchmark Configuration</h3>

        {/* Progress section similar to index.tsx */}
        <div className="mb-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time (ms)</label>
            <input
              type="number"
              min="1"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isPlaceholderData || status === "pending"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Iterations</label>
            <input
              type="number"
              min="1"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full border rounded-md p-2 dark:bg-gray-700 dark:border-gray-600"
              disabled={isPlaceholderData || status === "pending"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Run Benchmark</label>
            <button
              onClick={onStartBenchmark}
              disabled={isPlaceholderData || status === "pending"}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
            >
              {isPlaceholderData || status === "pending" ? "Running..." : "Start Benchmark"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Selected Validators ({selectedValidators.length})</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {validators.map((v) => (
              <label key={v.name} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValidators.includes(v.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedValidators((prev) => [...prev, v.name]);
                    } else {
                      setSelectedValidators((prev) => prev.filter((name) => name !== v.name));
                    }
                  }}
                  disabled={isPlaceholderData || status === "pending"}
                />
                <span className="text-sm">{v.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isPlaceholderData || status === "pending" ? "Running benchmarks..." : `${data.length} validators tested`}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {throughputData.length > 0 && `${(throughputData[0]!.throughput / 1000000).toFixed(1)}M ops/s (best)`}
          </div>
        </div>

        {throughputData.length > 0 ? (
          <div className="grid gap-2">
            {throughputData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-4">
                <div className="w-20 text-right font-mono text-sm">{item.name}</div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative">
                  <div
                    className={`h-8 rounded-full flex items-center justify-end pr-2 text-white text-sm font-semibold ${
                      index === 0
                        ? "bg-green-500"
                        : index === 1
                          ? "bg-blue-500"
                          : index === 2
                            ? "bg-purple-500"
                            : "bg-gray-500"
                    }`}
                    style={{
                      width: `${(item.throughput / maxThroughput) * 100}%`,
                    }}
                  >
                    {(item.throughput / 1000000).toFixed(1)}M ops/s
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {isPlaceholderData || status === "pending"
              ? "Running benchmarks..."
              : "Click 'Start Benchmark' to see live results"}
          </div>
        )}

        {throughputData.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Higher is better. {throughputData[0]?.name} leads with{" "}
            {(throughputData[0]!.throughput / 1000000).toFixed(1)}M operations per second.
          </div>
        )}
      </div>
    </div>
  );
}

function InsightsSlide({
  data,
  formState,
}: {
  data: TableResult[];
  formState: {
    time: number;
    iterations: number;
    selectedValidators: string[];
  };
}) {
  const throughputData = data
    .map((item) => ({
      name: item["Task name"],
      throughput: parseInt(item["Throughput avg (ops/s)"].split(" ±")[0]!.replace(/,/g, ""), 10),
      latency: parseFloat(item["Latency avg (ns)"].split(" ±")[0]!),
    }))
    .sort((a, b) => b.throughput - a.throughput);

  const fastest = throughputData[0];
  const slowest = throughputData[throughputData.length - 1];
  const performanceSpread = fastest && slowest ? (fastest.throughput / slowest.throughput).toFixed(1) : "N/A";

  return (
    <div className="space-y-6">
      {/* Benchmark Configuration Summary */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">📋 Benchmark Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Duration:</span> {formState.time}ms
          </div>
          <div>
            <span className="font-medium">Iterations:</span> {formState.iterations}
          </div>
          <div>
            <span className="font-medium">Validators tested:</span> {formState.selectedValidators.length} of{" "}
            {validators.length}
          </div>
        </div>
        {formState.selectedValidators.length < validators.length && (
          <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            <span className="font-medium">Selected:</span> {formState.selectedValidators.join(", ")}
          </div>
        )}
      </div>

      {throughputData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">🏆 Top Performers</h3>
              <ul className="space-y-1 text-sm">
                {throughputData.slice(0, 3).map((item) => (
                  <li key={item.name}>
                    <strong>{item.name}:</strong> {(item.throughput / 1000000).toFixed(1)}M ops/s
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                ⚡ Low Latency Leaders
              </h3>
              <ul className="space-y-1 text-sm">
                {throughputData
                  .sort((a, b) => a.latency - b.latency)
                  .slice(0, 3)
                  .map((item) => (
                    <li key={item.name}>
                      <strong>{item.name}:</strong> {item.latency.toFixed(0)}ns avg
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">📊 Performance Spread</h3>
            <p className="text-sm">
              Performance varies by <strong>{performanceSpread}x</strong> between fastest ({fastest?.name}) and slowest
              ({slowest?.name}). Choose wisely based on your performance requirements.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">Run benchmarks to see performance insights</div>
      )}
    </div>
  );
}

function ServiceWorkersSlide() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Why Service Workers?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">❌ Main Thread Problems</h3>
          <ul className="space-y-2 text-sm">
            <li>• Blocking UI interactions</li>
            <li>• Janky animations</li>
            <li>• Poor user experience</li>
            <li>• Frame drops during validation</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">✅ Worker Thread Benefits</h3>
          <ul className="space-y-2 text-sm">
            <li>• Parallel processing</li>
            <li>• Smooth UI interactions</li>
            <li>• Better perceived performance</li>
            <li>• CPU-intensive tasks offloaded</li>
          </ul>
        </div>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Implementation</h3>
        <pre className="text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
          {`// Main thread
import Worker from './validator.worker?worker';
const worker = new Worker();
worker.postMessage({ data, schema });

// Worker thread  
self.onmessage = ({ data, schema }) => {
  const result = validator.parse(data);
  self.postMessage(result);
};`}
        </pre>
      </div>
    </div>
  );
}

function ChoosingValidatorSlide() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">🚀 High Performance</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>io-ts:</strong> Functional approach, excellent for FP codebases
            </div>
            <div>
              <strong>ArkType:</strong> TypeScript-first, compile-time optimizations
            </div>
            <div>
              <strong>ajv:</strong> JSON Schema standard, mature ecosystem
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">⚖️ Balanced Choice</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>zod:</strong> Great DX, TypeScript integration, good performance
            </div>
            <div>
              <strong>valibot:</strong> Modular, tree-shakeable, growing ecosystem
            </div>
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">🔧 Feature Rich</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>yup:</strong> Object schema validation, transforms, async validation
            </div>
            <div>
              <strong>joi:</strong> Rich validation rules, server-side focused
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-lg font-semibold">
            Consider: Performance requirements, bundle size, ecosystem, and developer experience
          </p>
        </div>
      </div>
    </div>
  );
}

function PresentationComponent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [time, setTime] = useState(10);
  const [iterations, setIterations] = useState(2);
  const [selectedValidators, setSelectedValidators] = useState<string[]>(() => validators.map((v) => v.name));
  const [formState, setFormState] = useState({
    time,
    iterations,
    selectedValidators,
  });

  const { data, status, isPlaceholderData, progress } = useBenchmarkData(formState);

  const handleStartBenchmark = () => {
    setFormState({
      time,
      iterations,
      selectedValidators,
    });
  };

  const slides = [
    {
      title: "JavaScript Validator Performance Comparison",
      content: <IntroSlide />,
    },
    {
      title: "Live Throughput Performance (Operations per Second)",
      content: (
        <ThroughputSlide
          data={data ?? []}
          onStartBenchmark={handleStartBenchmark}
          time={time}
          setTime={setTime}
          iterations={iterations}
          setIterations={setIterations}
          selectedValidators={selectedValidators}
          setSelectedValidators={setSelectedValidators}
          progress={progress}
          status={status}
          isPlaceholderData={isPlaceholderData}
        />
      ),
    },
    {
      title: "Key Performance Insights",
      content: <InsightsSlide data={data ?? []} formState={formState} />,
    },
    {
      title: "Service Workers: Non-Blocking Validation",
      content: <ServiceWorkersSlide />,
    },
    {
      title: "Choosing the Right Validator",
      content: <ChoosingValidatorSlide />,
    },
  ];

  const activeSlide = slides[currentSlide];

  if (!activeSlide) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <header className="p-6 bg-white dark:bg-gray-900 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{activeSlide.title}</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            ← Back to Benchmarks
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 min-h-[600px]">{activeSlide.content}</div>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            ← Previous
          </button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Next →
          </button>
        </div>

        <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Slide {currentSlide + 1} of {slides.length}
        </div>
      </main>
    </div>
  );
}
