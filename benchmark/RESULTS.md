# Local Docker health benchmark

Measured on 2026-08-08 (Asia/Calcutta) against the complete local request path:

`client -> localhost:3000 -> Nginx -> backend:5000 -> Express /api/health`

## Reproduction

Start the application and run:

```powershell
docker compose up -d
node benchmark\health-load.mjs http://localhost:3000/api/health 500 20
```

The script performs 20 unmeasured warm-up requests, then uses 20 workers to issue
exactly 500 measured requests. It consumes every response body, counts only HTTP
2xx responses as successful, records end-to-end latency with Node's monotonic
performance clock, and calculates nearest-rank percentiles.

## Recorded trials

| Trial | Successful | Failed | Average | p50 | p95 | p99 | Throughput |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 500 | 0 | 31.58 ms | 31.62 ms | 40.00 ms | 41.53 ms | 622.84 req/s |
| 2 | 500 | 0 | 31.23 ms | 30.40 ms | 37.94 ms | 57.28 ms | 626.20 req/s |
| 3 | 500 | 0 | 33.54 ms | 32.14 ms | 46.46 ms | 74.59 ms | 585.01 req/s |

The resume cites trial 2: **500/500 successful responses, 31.2 ms average, and
37.9 ms p95 at concurrency 20**. All three trials together completed 1,500/1,500
requests successfully.

## Docker evidence

- The backend image declares `USER node`; the running Node process uses UID 1000.
- Nginx uses its standard root master process and non-root worker processes. The
  accurate claim is therefore **non-root Node runtime**, not two fully non-root
  containers.
- The backend health check calls its own `/api/health` endpoint and now returns
  HTTP 503 when MongoDB is disconnected.
- The frontend health check calls `/api/health` through Nginx. Compose waits for
  the backend to become healthy before starting the frontend.

## Scope

This is a local health-endpoint benchmark. It validates Docker routing,
concurrency handling, response success, and lightweight API latency without WAN
delay. It is not evidence of database-query, OAuth, payment, or production-host
performance.
