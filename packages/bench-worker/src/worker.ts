import { Effect, Fiber } from "effect";
import { type WorkerResult, WorkerSchema } from "./bench.schemas.js";
import { benchEffect } from "./benches.js";

function postMessageTyped(params: WorkerResult) {
  postMessage(params);
}

const program = (time: number, iterations: number) =>
  Effect.gen(function* (_) {
    console.log("Running program");
    postMessageTyped({ status: "pending" });

    const fiber = yield* Effect.fork(
      benchEffect(time, iterations, (task, mode) => {
        if (mode !== "warmup") {
          postMessageTyped({ status: "pending", progress: task.name });
        }
      }),
    );

    const results = yield* fiber;

    postMessageTyped({
      status: "success",
      results,
    });
  });

let final: null | Fiber.RuntimeFiber<void, Error> = null;

onmessage = (e) => {
  const { time, iterations, interrupt } = WorkerSchema.parse(e.data);

  if (interrupt) {
    postMessageTyped({ status: "error" });

    const prog = Effect.gen(function* (_) {
      if (final) yield* Fiber.interruptFork(final);
    });
    Effect.runSync(prog);
  } else {
    final = Effect.runFork(program(time, iterations));
  }
};
