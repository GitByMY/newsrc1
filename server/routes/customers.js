const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Customer = require('../models/Customer');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all customers
router.get('/', asyncHandler(async (req, res) => {
  console.log('GET /api/customers - Fetching all customers');
  try {
    const customers = await Customer.find();
    console.log(`Found ${customers.length} customers`);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
}));

// Get a single customer
router.get('/:id', asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customer);
}));

// Create a new customer
router.post('/', asyncHandler(async (req, res) => {
  // Validate required fields
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Please provide name and email' });
  }

  const customer = new Customer({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || '',
    company: req.body.company || '',
    status: req.body.status || 'active',
    tags: req.body.tags || [],
    lastOrderDate: req.body.lastOrderDate || null
  });

  const newCustomer = await customer.save();
  res.status(201).json(newCustomer);
}));

// Update a customer
router.put('/:id', asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  if (req.body.name) customer.name = req.body.name;
  if (req.body.email) customer.email = req.body.email;
  if (req.body.phone) customer.phone = req.body.phone;
  if (req.body.company) customer.company = req.body.company;
  if (req.body.status) customer.status = req.body.status;
  if (req.body.tags) customer.tags = req.body.tags;
  if (req.body.lastOrderDate) customer.lastOrderDate = req.body.lastOrderDate;

  const updatedCustomer = await customer.save();
  res.json(updatedCustomer);
}));

// Delete a customer
router.delete('/:id', asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  await customer.deleteOne();  // Using deleteOne() instead of remove() which is deprecated
  res.json({ message: 'Customer deleted' });
}));

// Delete multiple customers
router.post('/delete-many', asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Invalid customer IDs' });
  }

  try {
    // Convert string IDs to ObjectIDs
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    
    const result = await Customer.deleteMany({ _id: { $in: objectIds } });
    res.json({ message: `${result.deletedCount} customers deleted` });
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: 'One or more invalid customer IDs' });
    }
    throw err;
  }
}));

module.exports = router;