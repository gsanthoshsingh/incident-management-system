const { Worker } = require('bullmq');
const Signal = require('../models/signal');
const { processSignalDebounce } = require('../services/debounceService');

let processedCount = 0;
let lastMetricTime = Date.now();

const createWorker = () => {
  const worker = new Worker(
    'signal-processing',
    async (job) => {
      const signal = job.data;

      // Save raw signal to MongoDB (data lake)
      const savedSignal = await Signal.create({
        signalId: signal.signalId,
        componentId: signal.componentId,
        componentType: signal.componentType,
        errorType: signal.errorType,
        severity: signal.severity,
        message: signal.message,
        metadata: signal.metadata || {},
        receivedAt: new Date(signal.receivedAt),
      });

      // Debounce logic → maybe create Work Item
      const workItemId = await processSignalDebounce(signal);

      if (workItemId) {
        await Signal.updateMany(
          { componentId: signal.componentId, workItemId: null },
          { $set: { workItemId } }
        );
      }

      processedCount++;
      return { signalId: signal.signalId, workItemId };
    },
    {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      concurrency: 50,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

  // Print throughput every 5 seconds
  setInterval(() => {
    const now = Date.now();
    const elapsed = (now - lastMetricTime) / 1000;
    const rate = Math.round(processedCount / elapsed);
    console.log(`📊 Throughput: ${rate} signals/sec | Total processed: ${processedCount}`);
    processedCount = 0;
    lastMetricTime = now;
  }, 5000);

  console.log('Signal worker started with concurrency: 50');
  return worker;
};

module.exports = { createWorker };