const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'active' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  lastOrderDate: { type: Date }
}, {
  collection: 'customers' // Explicitly specify the collection name
});

module.exports = mongoose.model('Customer', customerSchema); 