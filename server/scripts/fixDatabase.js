// Fix MongoDB database collections
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';

async function fixDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    
    // Define the schema directly in this script to ensure it's properly registered
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
    
    // Create the model with explicit collection name
    const Customer = mongoose.model('Customer', customerSchema);
    
    // Check if the collection exists by trying to get its stats
    try {
      await mongoose.connection.db.command({ collStats: 'customers' });
      console.log('Customers collection already exists');
    } catch (error) {
      // Collection doesn't exist, create it by saving a document
      console.log('Customers collection does not exist, creating it now...');
      
      // Create a dummy document to force collection creation
      const dummyCustomer = new Customer({
        name: 'Initial Customer',
        email: 'initial@example.com',
        phone: '555-1234',
        company: 'Initial Company',
        status: 'active',
        tags: ['initial'],
        createdAt: new Date(),
        lastOrderDate: new Date()
      });
      
      await dummyCustomer.save();
      console.log('Created customers collection with initial document');
    }
    
    // Generate sample data if the collection is empty
    const count = await Customer.countDocuments();
    if (count <= 1) { // If only our dummy document exists
      console.log('Generating sample customers...');
      
      const sampleCustomers = [];
      
      // Generate 20 sample customers
      for (let i = 0; i < 20; i++) {
        const customer = {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          company: faker.company.name(),
          status: faker.helpers.arrayElement(['active', 'inactive', 'lead']),
          tags: [
            faker.helpers.arrayElement(['retail', 'wholesale', 'online']),
            faker.helpers.arrayElement(['premium', 'standard', 'basic'])
          ],
          createdAt: faker.date.past(),
          lastOrderDate: faker.helpers.arrayElement([faker.date.recent(), null])
        };
        
        sampleCustomers.push(customer);
      }
      
      // Insert into database
      await Customer.insertMany(sampleCustomers);
      console.log(`${sampleCustomers.length} sample customers created successfully`);
    } else {
      console.log(`Collection already has ${count} documents`);
    }
    
    // Verify the collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Count documents in customers collection
    const finalCount = await Customer.countDocuments();
    console.log(`\nTotal documents in customers collection: ${finalCount}`);
    
    console.log('\nDatabase fix completed successfully!');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixDatabase();