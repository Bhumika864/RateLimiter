const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  keyPrefix: { type: String, required: true },
  endpoint: { type: String, required: true },
  ip: { type: String, required: true },
  status: { type: String, enum: ['allowed', 'blocked'], required: true },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now }
});
logSchema.index({ keyPrefix: 1, timestamp: -1 });
logSchema.index({ ip: 1 });

module.exports = mongoose.model('Log', logSchema);