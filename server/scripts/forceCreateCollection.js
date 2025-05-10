// Force create collection script
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Customer = require('../models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Generate sample customers
async function forceCreateCollection() {
  try {
    console.log('Dropping existing customers collection if it exists...');
    
    // Drop the collection if it exists using the native driver
    try {
      await mongoose.connection.collection('customers').drop();
      console.log('Existing customers collection dropped');
    } catch (err) {
      console.log('No existing customers collection to drop or error dropping:', err.message);
    }
    
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

    // Verify the collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
  } catch (error) {
    console.error('Error creating collection:', error);
  }
}

// Run the function and disconnect when done
forceCreateCollection()
  .then(() => {
    console.log('Database setup complete');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error setting up database:', err);
    mongoose.disconnect();
  }); 