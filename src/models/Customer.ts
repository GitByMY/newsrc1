import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  totalSpend: {
    type: Number,
    default: 0,
  },
  visitCount: {
    type: Number,
    default: 0,
  },
  lastOrderDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema); 