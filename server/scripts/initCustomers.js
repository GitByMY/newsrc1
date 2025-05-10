const mongoose = require('mongoose');

// Sample customer data
const sampleCustomers = [
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Smith', email: 'jane.smith@example.com' },
  { name: 'Alice Johnson', email: 'alice.johnson@example.com' }
];

// Connect to MongoDB
dbConnect();

async function dbConnect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/data1', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');

    const db = mongoose.connection.db;

    // Check if customers collection exists
    const collections = await db.listCollections().toArray();
    const customersCollection = collections.find(c => c.name === 'customers');

    if (!customersCollection) {
      console.log('Creating customers collection with sample data...');
      await db.collection('customers').insertMany(sampleCustomers);
      console.log('Customers collection created and populated with sample data');
    } else {
      console.log('Customers collection already exists');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    mongoose.disconnect();
  }
} 