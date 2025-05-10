// Script to update existing customers to match the new schema
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

async function updateCustomers() {
  try {
    const customers = await Customer.find();
    console.log(`Found ${customers.length} customers to update`);

    for (const customer of customers) {
      // Add missing fields from new schema
      if (!customer.status) customer.status = 'active';
      if (!customer.company) customer.company = customer.company || '';
      if (!customer.tags) customer.tags = [];

      // Save the updated customer
      await customer.save();
      console.log(`Updated customer: ${customer.name}`);
    }

    console.log('All customers updated successfully');
  } catch (error) {
    console.error('Error updating customers:', error);
  } finally {
    mongoose.disconnect();
  }
}

updateCustomers(); 