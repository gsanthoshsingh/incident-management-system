const { v4: uuidv4 } = require('uuid');
const { signalQueue } = require('../config/redis');

const ingestSignal = async (req, res, next) => {
  try {
    const { componentId, componentType, errorType, severity, message, metadata } = req.body;
    if (!componentId || !componentType || !errorType || !severity || !message) {
      return res.status(400).json({ error: 'Missing required fields: componentId, componentType, errorType, severity, message' });
    }

    const signal = {
      signalId: uuidv4(),
      componentId,
      componentType,
      errorType,
      severity,
      message,
      metadata: metadata || {},
      receivedAt: new Date().toISOString(),
    };

    // Push to BullMQ (non-blocking — handles burst backpressure)
    await signalQueue.add('process-signal', signal, { priority: severity === 'P0' ? 1 : 5 });

    res.status(202).json({ accepted: true, signalId: signal.signalId });
  } catch (err) {
    next(err);
  }
};

const ingestBatch = async (req, res, next) => {
  try {
    const signals = req.body;
    if (!Array.isArray(signals) || signals.length === 0) {
      return res.status(400).json({ error: 'Body must be a non-empty array of signals' });
    }

    const jobs = signals.map((s) => ({
      name: 'process-signal',
      data: { ...s, signalId: uuidv4(), receivedAt: new Date().toISOString() },
      opts: { priority: s.severity === 'P0' ? 1 : 5 },
    }));

    await signalQueue.addBulk(jobs);
    res.status(202).json({ accepted: true, count: jobs.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { ingestSignal, ingestBatch };