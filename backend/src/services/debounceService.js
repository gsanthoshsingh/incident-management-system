const { redisClient } = require('../config/redis');
const WorkItem = require('../models/workItem');
const { getSeverityForComponent, fireAlert } = require('./alertService');
const { v4: uuidv4 } = require('uuid');

const DEBOUNCE_WINDOW_MS = 10000; // 10 seconds
const DEBOUNCE_THRESHOLD = 10;

const getDebounceKey = (componentId) => `debounce:${componentId}`;
const getLockKey = (componentId) => `lock:${componentId}`;

const processSignalDebounce = async (signal) => {
  const debounceKey = getDebounceKey(signal.componentId);
  const lockKey = getLockKey(signal.componentId);

  // Atomic increment with expiry
  const count = await redisClient.incr(debounceKey);
  if (count === 1) await redisClient.expire(debounceKey, Math.ceil(DEBOUNCE_WINDOW_MS / 1000));

  // Check for existing open work item
  let workItem = await WorkItem.findByComponentId(signal.componentId);
  if (workItem) return workItem.id;

  // Only create work item if threshold crossed, using distributed lock
  if (count >= DEBOUNCE_THRESHOLD) {
    const lock = await redisClient.set(lockKey, '1', { NX: true, EX: 30 });
    if (!lock) return null; // Another process is creating it

    try {
      workItem = await WorkItem.findByComponentId(signal.componentId);
      if (workItem) return workItem.id;

      const severity = getSeverityForComponent(signal.componentType);
      const newItem = await WorkItem.create({
        id: uuidv4(),
        componentId: signal.componentId,
        componentType: signal.componentType,
        severity,
        title: `${signal.componentType} failure on ${signal.componentId}`,
        firstSignalAt: signal.receivedAt || new Date(),
      });

      fireAlert(newItem);
      await redisClient.del(debounceKey);
      return newItem.id;
    } finally {
      await redisClient.del(lockKey);
    }
  }

  return null;
};

module.exports = { processSignalDebounce };