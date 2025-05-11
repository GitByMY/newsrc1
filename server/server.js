const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const customerRoutes = require('./routes/customers');
const campaignRoutes = require('./routes/campaigns');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';

console.log(`Connecting to MongoDB with URI: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  const dbName = MONGODB_URI.split('/').pop().split('?')[0];
  console.log(`MongoDB connected successfully to database: ${dbName}`);
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  console.log('Collections in database:', collectionNames);
  
  if (!collectionNames.includes('customers')) {
    console.log('Customers collection not found. Creating it with a sample document...');
    const Customer = require('./models/Customer');
    const sampleCustomer = new Customer({
      name: 'Sample Customer',
      email: 'sample@example.com',
      phone: '555-1234',
      company: 'Sample Company',
      status: 'active',
      tags: ['sample'],
      createdAt: new Date(),
      lastOrderDate: new Date()
    });
    await sampleCustomer.save();
    console.log('Created customers collection with a sample document');
  }

  if (!collectionNames.includes('campaigns')) {
    console.log('Campaigns collection not found. Creating it with a sample document...');
    const Campaign = require('./models/Campaign');
    const sampleCampaign = new Campaign({
      name: 'Sample Campaign',
      audienceQuery: [
        { field: 'totalSpend', operator: '>', value: '5000', logicGate: 'AND' },
        { field: 'lastOrderDate', operator: '>', value: '2024-01-01' }
      ],
      summary: 'This is a sample campaign targeting high-value customers',
      audienceSize: 100,
      sentCount: 95,
      failedCount: 5,
      deliveryRatio: 0.95,
      status: 'completed',
      createdAt: new Date()
    });
    await sampleCampaign.save();
    console.log('Created campaigns collection with a sample document');
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);

// Serve frontend
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
