const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  signalId: { type: String, required: true, unique: true },
  componentId: { type: String, required: true, index: true },
  componentType: {
    type: String,
    enum: ['API', 'MCP_HOST', 'CACHE', 'QUEUE', 'RDBMS', 'NOSQL'],
    required: true,
  },
  errorType: { type: String, required: true },
  severity: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], required: true },
  message: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  workItemId: { type: String, default: null, index: true },
  receivedAt: { type: Date, default: Date.now, index: true },
});

signalSchema.index({ componentId: 1, receivedAt: -1 });
signalSchema.index({ workItemId: 1 });

module.exports = mongoose.model('Signal', signalSchema);