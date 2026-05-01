// State Pattern for Work Item lifecycle
const { pgPool } = require('../config/db');
const WorkItem = require('../models/workItem');

const VALID_TRANSITIONS = {
  OPEN: ['INVESTIGATING'],
  INVESTIGATING: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

const transition = async (workItemId, newStatus, rcaData = null) => {
  const client = await pgPool.connect();
  try {
    await client.query('BEGIN');

    const item = await WorkItem.findById(workItemId);
    if (!item) throw new Error(`Work item ${workItemId} not found`);

    const allowed = VALID_TRANSITIONS[item.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition: ${item.status} → ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`);
    }

    if (newStatus === 'CLOSED') {
      if (!rcaData) throw new Error('RCA is required to close a work item');
      validateRCA(rcaData);

      const mttr = calculateMTTR(item.first_signal_at, rcaData.endTime);
      await client.query(
        `INSERT INTO rca_records (work_item_id, root_cause_category, fix_applied, prevention_steps, start_time, end_time, mttr_minutes, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
        [workItemId, rcaData.rootCauseCategory, rcaData.fixApplied, rcaData.preventionSteps, rcaData.startTime, rcaData.endTime, mttr]
      );
      await client.query('UPDATE work_items SET status=$1, updated_at=NOW(), closed_at=NOW() WHERE id=$2', [newStatus, workItemId]);
    } else {
      await client.query('UPDATE work_items SET status=$1, updated_at=NOW() WHERE id=$2', [newStatus, workItemId]);
    }

    await client.query('COMMIT');
    return await WorkItem.findById(workItemId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const validateRCA = (rca) => {
  const required = ['rootCauseCategory', 'fixApplied', 'preventionSteps', 'startTime', 'endTime'];
  const missing = required.filter((f) => !rca[f] || String(rca[f]).trim() === '');
  if (missing.length > 0) throw new Error(`RCA incomplete. Missing fields: ${missing.join(', ')}`);
};

const calculateMTTR = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / 60000);
};

module.exports = { transition, validateRCA, calculateMTTR };