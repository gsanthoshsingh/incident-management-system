const express = require('express');
const { ingestSignal, ingestBatch } = require('../controllers/signalController');
const { listWorkItems, getWorkItem, updateStatus } = require('../controllers/workItemController');
const { signalRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Signal ingestion
router.post('/signals', signalRateLimiter, ingestSignal);
router.post('/signals/batch', signalRateLimiter, ingestBatch);

// Work items
router.get('/work-items', listWorkItems);
router.get('/work-items/:id', getWorkItem);
router.patch('/work-items/:id/status', updateStatus);

module.exports = router;