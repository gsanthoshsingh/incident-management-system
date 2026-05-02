# incident-management-system
---

## 🛡️ Non-Functional Features

### Security
- **Helmet.js** — HTTP security headers (XSS, clickjacking, MIME protection)
- **CORS** — Only accepts requests from configured `FRONTEND_URL`
- **Rate Limiting** — 1,000 req/min per IP, returns 429 if exceeded
- **Environment Variables** — All secrets in `.env`, never hardcoded

### Performance
- **BullMQ Queue** — Async processing, handles 10,000 signals/sec bursts
- **Worker Concurrency** — 50 jobs processed simultaneously
- **Redis Cache** — Dashboard hot-path with 30s TTL, avoids DB hits
- **Batch Ingestion** — `POST /api/signals/batch` for high-volume senders

### Reliability
- **Retry + Backoff** — 3 retries with 1s, 2s, 4s delays on DB failures
- **Transactions** — PostgreSQL BEGIN/COMMIT wraps status + RCA insert
- **Distributed Lock** — Redis SET NX prevents duplicate Work Items
- **Docker Health Checks** — Backend waits for all 3 DBs to be healthy

### Observability
- **Health Endpoint** — `GET /health` returns status of all services
- **Throughput Metrics** — Signals/sec printed to console every 5 seconds

### Testing
- **Unit Tests** — Jest tests for RCA validation and MTTR in `backend/tests/rca.test.js`
