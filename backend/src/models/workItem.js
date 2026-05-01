const { pgPool } = require('../config/db');

const WorkItem = {
  async create({ id, componentId, componentType, severity, title, firstSignalAt }) {
    const query = `
      INSERT INTO work_items 
        (id, component_id, component_type, severity, title, status, first_signal_at, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,'OPEN',$6,NOW(),NOW())
      RETURNING *`;
    const result = await pgPool.query(query, [id, componentId, componentType, severity, title, firstSignalAt]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pgPool.query('SELECT * FROM work_items WHERE id=$1', [id]);
    return result.rows[0];
  },

  async findAll({ status, severity, limit = 50 } = {}) {
    let query = 'SELECT * FROM work_items WHERE 1=1';
    const params = [];
    if (status) { params.push(status); query += ` AND status=$${params.length}`; }
    if (severity) { params.push(severity); query += ` AND severity=$${params.length}`; }
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    const result = await pgPool.query(query, params);
    return result.rows;
  },

  async updateStatus(id, status, client = pgPool) {
    const result = await client.query(
      'UPDATE work_items SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async findByComponentId(componentId) {
    const result = await pgPool.query(
      "SELECT * FROM work_items WHERE component_id=$1 AND status NOT IN ('CLOSED') ORDER BY created_at DESC LIMIT 1",
      [componentId]
    );
    return result.rows[0];
  },
};

module.exports = WorkItem;