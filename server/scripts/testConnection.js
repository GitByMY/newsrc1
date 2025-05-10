// Test MongoDB connection
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';

// Make sure the URI contains the 'crm' database name
let connectionURI = MONGODB_URI;
if (!connectionURI.includes('/crm?')) {
  // Replace the database name with 'crm'
  connectionURI = connectionURI.replace(/\/([^/?]+)(\?|$)/, '/crm$2');
}

async function testConnection() {
  console.log(`Attempting to connect to MongoDB with URI: ${connectionURI}`);
  
  try {
    await mongoose.connect(connectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully!');
    
    // Check if collections exist
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Collections in database:');
    collectionNames.forEach(name => console.log(`- ${name}`));
    
    // Check if customers collection exists
    if (collectionNames.includes('customers')) {
      // Count documents in customers collection
      const customerCount = await mongoose.connection.db.collection('customers').countDocuments();
      console.log(`Found ${customerCount} documents in customers collection`);
      
      // Get a sample of customers
      const sampleCustomers = await mongoose.connection.db.collection('customers')
        .find({})
        .limit(3)
        .toArray();
      
      console.log('Sample customers:');
      sampleCustomers.forEach(customer => {
        console.log(`- ${customer.name} (${customer.email})`);
      });
    } else {
      console.log('Customers collection not found in database');
    }
    
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testConnection();