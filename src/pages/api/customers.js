// File: pages/api/customers.js
import connectToDatabase from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const { client, db } = await connectToDatabase();
    const customersCollection = db.collection('customers');
    
    // GET - Fetch all customers or a single customer
    if (req.method === 'GET') {
      try {
        const { id } = req.query;
        
        if (id) {
          // Get a single customer
          const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
          
          if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
          }
          
          return res.status(200).json(customer);
        } else {
          // Get all customers
          console.log('Fetching customers from database...');
          const customers = await customersCollection.find({}).toArray();
          console.log(`Found ${customers.length} customers`);
          return res.status(200).json(customers);
        }
      } catch (err) {
        console.error('Error fetching customers:', err);
        return res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
      }
    }
    
    // POST - Create a new customer or delete multiple customers
    else if (req.method === 'POST') {
      // Check if this is a delete-many operation
      if (req.query.action === 'delete-many') {
        try {
          const { ids } = req.body;
          
          if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Invalid customer IDs' });
          }
          
          // Convert string IDs to ObjectIDs
          const objectIds = ids.map(id => new ObjectId(id));
          
          const result = await customersCollection.deleteMany({ _id: { $in: objectIds } });
          return res.status(200).json({ message: `${result.deletedCount} customers deleted` });
        } catch (err) {
          console.error('Error deleting multiple customers:', err);
          return res.status(500).json({ error: 'Failed to delete customers', details: err.message });
        }
      } 
      // Regular create operation
      else {
        try {
          const { name, email } = req.body;
          
          if (!name || !email) {
            return res.status(400).json({ message: 'Please provide name and email' });
          }
          
          const customer = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone || '',
            company: req.body.company || '',
            status: req.body.status || 'active',
            tags: req.body.tags || [],
            createdAt: new Date(),
            lastOrderDate: req.body.lastOrderDate ? new Date(req.body.lastOrderDate) : null
          };
          
          const result = await customersCollection.insertOne(customer);
          const insertedCustomer = await customersCollection.findOne({ _id: result.insertedId });
          
          return res.status(201).json(insertedCustomer);
        } catch (err) {
          console.error('Error creating customer:', err);
          return res.status(500).json({ error: 'Failed to save customer', details: err.message });
        }
      }
    }
    
    // PUT - Update a customer
    else if (req.method === 'PUT') {
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: 'Customer ID is required' });
        }
        
        const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
        
        if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.email) updateData.email = req.body.email;
        if (req.body.phone !== undefined) updateData.phone = req.body.phone;
        if (req.body.company !== undefined) updateData.company = req.body.company;
        if (req.body.status) updateData.status = req.body.status;
        if (req.body.tags) updateData.tags = req.body.tags;
        if (req.body.lastOrderDate !== undefined) {
          updateData.lastOrderDate = req.body.lastOrderDate ? new Date(req.body.lastOrderDate) : null;
        }
        
        await customersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        const updatedCustomer = await customersCollection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json(updatedCustomer);
      } catch (err) {
        console.error('Error updating customer:', err);
        return res.status(500).json({ error: 'Failed to update customer', details: err.message });
      }
    }
    
    // DELETE - Delete a customer
    else if (req.method === 'DELETE') {
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: 'Customer ID is required' });
        }
        
        const customer = await customersCollection.findOne({ _id: new ObjectId(id) });
        
        if (!customer) {
          return res.status(404).json({ message: 'Customer not found' });
        }
        
        await customersCollection.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: 'Customer deleted' });
      } catch (err) {
        console.error('Error deleting customer:', err);
        return res.status(500).json({ error: 'Failed to delete customer', details: err.message });
      }
    }
    
    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
}