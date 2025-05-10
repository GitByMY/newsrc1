// Ensure the customers collection exists and has data
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

// Define the customer schema
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

async function ensureCustomersCollection() {
  try {
    console.log(`Connecting to MongoDB at ${connectionURI}...`);
    
    await mongoose.connect(connectionURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    
    // Create the model with explicit collection name
    const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
    
    // Check if the collection exists and has data
    const count = await Customer.countDocuments();
    console.log(`Found ${count} documents in customers collection`);
    
    if (count === 0) {
      console.log('Customers collection is empty, creating sample data...');
      
      // Generate sample customers
      const sampleCustomers = [];
      
      // Generate 10 sample customers
      for (let i = 0; i < 10; i++) {
        const customer = {
          name: `Customer ${i+1}`,
          email: `customer${i+1}@example.com`,
          phone: `555-${1000+i}`,
          company: `Company ${i+1}`,
          status: ['active', 'inactive', 'lead'][i % 3],
          tags: [
            ['retail', 'wholesale', 'online'][i % 3],
            ['premium', 'standard', 'basic'][i % 3]
          ],
          createdAt: new Date(),
          lastOrderDate: i % 2 === 0 ? new Date() : null
        };
        
        sampleCustomers.push(customer);
      }
      
      // Insert into database
      await Customer.insertMany(sampleCustomers);
      console.log(`${sampleCustomers.length} sample customers created successfully`);
    } else {
      console.log(`Customers collection already has ${count} documents`);
    }
    
    // Verify the data
    const customers = await Customer.find().limit(5);
    console.log('\nSample customers in database:');
    customers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email})`);
    });
    
    console.log('\nCustomers collection is ready!');
  } catch (error) {
    console.error('Error ensuring customers collection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

// Run the function
ensureCustomersCollection();