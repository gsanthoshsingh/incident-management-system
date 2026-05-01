const WorkItem = require('../models/workItem');
const Signal = require('../models/signal');
const { redisClient } = require('../config/redis');
const { transition } = require('../services/stateService');

const CACHE_TTL = 30; // seconds

const listWorkItems = async (req, res, next) => {
  try {
    const cacheKey = 'dashboard:workitems';
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const items = await WorkItem.findAll({ status: req.query.status, severity: req.query.severity });
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(items));
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getWorkItem = async (req, res, next) => {
  try {
    const item = await WorkItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Work item not found' });

    const signals = await Signal.find({ workItemId: item.id }).sort({ receivedAt: -1 }).limit(100);
    res.json({ ...item, signals });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status, rca } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });

    const updated = await transition(req.params.id, status, rca);
    await redisClient.del('dashboard:workitems'); // Invalidate cache
    res.json(updated);
  } catch (err) {
    err.status = err.message.includes('Invalid transition') || err.message.includes('RCA') ? 400 : 500;
    next(err);
  }
};

module.exports = { listWorkItems, getWorkItem, updateStatus };