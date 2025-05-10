// MongoDB setup script
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define Customer schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'active' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  lastOrderDate: { type: Date }
});

// Create model
const Customer = mongoose.model('Customer', customerSchema);

// Generate sample customers
async function generateSampleCustomers() {
  try {
    // Check if collection already has documents
    const count = await Customer.countDocuments();
    if (count > 0) {
      console.log(`Customers collection already has ${count} documents. Skipping sample data creation.`);
      return;
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
  } catch (error) {
    console.error('Error generating sample data:', error);
  }
}

// Run the function and disconnect when done
generateSampleCustomers()
  .then(() => {
    console.log('Database setup complete');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error setting up database:', err);
    mongoose.disconnect();
  }); 