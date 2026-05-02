const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function buildSignals(componentId, componentType, errorType, severity, message, count) {
  return Array.from({ length: count }, () => ({
    componentId,
    componentType,
    errorType,
    severity,
    message,
  }));
}

async function simulate() {
  console.log('Starting failure simulation...\n');

  console.log('Step 1: Simulating RDBMS outage (POSTGRES_PRIMARY_01)...');
  const r1 = await post('/api/signals/batch', buildSignals('POSTGRES_PRIMARY_01', 'RDBMS', 'CONNECTION_REFUSED', 'P0', 'Primary database node is unreachable', 10));
  console.log('  Sent 10 RDBMS signals ->', JSON.stringify(r1), '\n');

  await new Promise((r) => setTimeout(r, 2000));

  console.log('Step 2: Simulating MCP Host failure (MCP_HOST_02)...');
  const r2 = await post('/api/signals/batch', buildSignals('MCP_HOST_02', 'MCP_HOST', 'TIMEOUT', 'P1', 'MCP host not responding to health checks', 10));
  console.log('  Sent 10 MCP signals ->', JSON.stringify(r2), '\n');

  await new Promise((r) => setTimeout(r, 2000));

  console.log('Step 3: Simulating Cache failure (CACHE_CLUSTER_01)...');
  const r3 = await post('/api/signals/batch', buildSignals('CACHE_CLUSTER_01', 'CACHE', 'EVICTION_STORM', 'P2', 'Cache cluster experiencing mass evictions', 10));
  console.log('  Sent 10 Cache signals ->', JSON.stringify(r3), '\n');

  console.log('Simulation complete!');
  console.log('Open http://localhost:5173 to see incidents on the dashboard.');
}

simulate().catch((err) => {
  console.error('Simulation failed:', err.message);
  console.error('Make sure backend is running: docker compose up');
});