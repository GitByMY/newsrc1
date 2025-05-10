const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: String, required: true },
  logicGate: { type: String }
});

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  audienceQuery: [ruleSchema],
  createdAt: { type: Date, default: Date.now },
  summary: { type: String },
  audienceSize: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  deliveryRatio: { type: Number, default: 0 },
  status: { type: String, enum: ['completed', 'in-progress', 'scheduled'], default: 'in-progress' }
}, {
  collection: 'campaigns' // Explicitly specify the collection name
});

module.exports = mongoose.model('Campaign', campaignSchema); 