const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Added for path checking
const customerRoutes = require('./routes/customers');
const campaignRoutes = require('./routes/campaigns');

// Load environment variables
dotenv.config();

// Debug info for directory structure
console.log('Current directory:', __dirname);
console.log('Directory contents:', fs.readdirSync(__dirname));

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';
console.log(`Connecting to MongoDB with URI: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
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

mongoose.connection.on('error', err => console.error('MongoDB error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB disconnected'));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);

// Try different potential build output directories
const potentialBuildPaths = [
  path.join(__dirname, 'client/dist'),           // /server/client/dist
  path.join(__dirname, '../dist'),               // /dist
  path.join(__dirname, '../server/client/dist'), // /server/client/dist (from root)
  path.resolve(__dirname, '../dist')             // Absolute path to /dist
];

let staticPath = null;
let indexPath = null;

// Find the first valid build path
for (const buildPath of potentialBuildPaths) {
  try {
    // Check if the directory exists
    if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
      staticPath = buildPath;
      indexPath = path.join(buildPath, 'index.html');
      console.log(`Found valid build path: ${staticPath}`);
      break;
    }
  } catch (err) {
    console.log(`Path ${buildPath} not valid:`, err.message);
  }
}

if (staticPath) {
  // Serve static files from the valid path
  app.use(express.static(staticPath));
  
  // Serve index.html for all other routes (SPA support)
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
  
  console.log(`Serving static files from: ${staticPath}`);
  console.log(`Serving index.html from: ${indexPath}`);
} else {
  console.error('No valid frontend build directory found! Server will only serve API routes.');
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error in request:', err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
