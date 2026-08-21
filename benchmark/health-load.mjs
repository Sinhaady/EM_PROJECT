import { performance } from "node:perf_hooks";

const target = process.argv[2] || "http://localhost:3000/api/health";
const totalRequests = Number.parseInt(process.argv[3] || "500", 10);
const concurrency = Number.parseInt(process.argv[4] || "20", 10);

if (!Number.isInteger(totalRequests) || totalRequests < 1) {
  throw new Error("totalRequests must be a positive integer");
}

if (!Number.isInteger(concurrency) || concurrency < 1) {
  throw new Error("concurrency must be a positive integer");
}

const request = async () => {
  const startedAt = performance.now();
  const response = await fetch(target, { cache: "no-store" });
  await response.arrayBuffer();
  return { status: response.status, latencyMs: performance.now() - startedAt };
};

// Warm the local connection and application path outside the measured sample.
await Promise.all(Array.from({ length: concurrency }, request));

const results = new Array(totalRequests);
let nextRequest = 0;
const benchmarkStartedAt = performance.now();

await Promise.all(
  Array.from({ length: Math.min(concurrency, totalRequests) }, async () => {
    while (true) {
      const index = nextRequest;
      nextRequest += 1;
      if (index >= totalRequests) return;

      try {
        results[index] = await request();
      } catch (error) {
        results[index] = { status: 0, latencyMs: 0, error: error.message };
      }
    }
  }),
);

const elapsedMs = performance.now() - benchmarkStartedAt;
const successful = results.filter(({ status }) => status >= 200 && status < 300);
const failed = results.length - successful.length;
const latencies = successful.map(({ latencyMs }) => latencyMs).sort((a, b) => a - b);
const average = latencies.reduce((sum, value) => sum + value, 0) / (latencies.length || 1);
const percentile = (value) => latencies[Math.max(0, Math.ceil((value / 100) * latencies.length) - 1)] || 0;

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  target,
  totalRequests,
  concurrency,
  successfulRequests: successful.length,
  failedRequests: failed,
  elapsedMs: Number(elapsedMs.toFixed(2)),
  requestsPerSecond: Number(((totalRequests / elapsedMs) * 1000).toFixed(2)),
  averageLatencyMs: Number(average.toFixed(2)),
  p50LatencyMs: Number(percentile(50).toFixed(2)),
  p95LatencyMs: Number(percentile(95).toFixed(2)),
  p99LatencyMs: Number(percentile(99).toFixed(2)),
  node: process.version,
}, null, 2));

if (failed > 0) process.exitCode = 1;
