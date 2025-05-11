const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const customerRoutes = require('./routes/customers');
const campaignRoutes = require('./routes/campaigns');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug route to check server is running
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
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

// Debug the available directories
console.log('Current directory:', __dirname);
try {
  const files = fs.readdirSync(__dirname);
  console.log('Files in current directory:', files);
  
  if (fs.existsSync(path.join(__dirname, 'client'))) {
    console.log('Client directory exists');
    const clientFiles = fs.readdirSync(path.join(__dirname, 'client'));
    console.log('Files in client directory:', clientFiles);
    
    if (fs.existsSync(path.join(__dirname, 'client/dist'))) {
      console.log('Client/dist directory exists');
      const distFiles = fs.readdirSync(path.join(__dirname, 'client/dist'));
      console.log('Files in client/dist directory:', distFiles);
    }
  }
} catch (err) {
  console.error('Error reading directory:', err);
}

// Find the frontend build
const potentialBuildPaths = [
  path.join(__dirname, 'client/dist'),     // Server/client/dist (if vite.config.ts is set up properly)
  path.join(__dirname, '../dist'),         // In case it's one level up
  path.join(__dirname, '../server/client/dist'), // Another common location
  path.join(__dirname, 'dist'),            // Directly in the server directory
];

// Find the first valid build path
let staticPath = null;

for (const buildPath of potentialBuildPaths) {
  try {
    if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
      staticPath = buildPath;
      console.log(`Found valid build path: ${staticPath}`);
      break;
    } else {
      console.log(`Build path not valid: ${buildPath}`);
    }
  } catch (err) {
    console.log(`Error checking build path ${buildPath}:`, err.message);
  }
}

if (staticPath) {
  // Serve static files
  console.log(`Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  
  // Explicitly set content types for common file extensions
  app.use((req, res, next) => {
    const url = req.url;
    if (url.endsWith('.js')) res.type('application/javascript');
    else if (url.endsWith('.css')) res.type('text/css');
    else if (url.endsWith('.svg')) res.type('image/svg+xml');
    next();
  });
  
  // Special handler for assets to debug any 404s
  app.get('/assets/*', (req, res, next) => {
    console.log(`Asset request for: ${req.url}`);
    const assetPath = path.join(staticPath, req.url);
    console.log(`Checking if asset exists at: ${assetPath}`);
    
    if (fs.existsSync(assetPath)) {
      console.log('Asset found, sending file');
      return res.sendFile(assetPath);
    } else {
      console.log('Asset not found');
      next();
    }
  });
  
  // For all other routes, serve the index.html (handle SPA routing)
  app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    console.log(`Serving index.html for path: ${req.url} from ${indexPath}`);
    res.sendFile(indexPath);
  });
} else {
  console.error('⚠️ No valid frontend build directory found!');
  
  // Create a fallback index.html to avoid white screen
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>CRM Application</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { background: #ffebee; border: 1px solid #ffcdd2; border-radius: 4px; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>CRM Application</h1>
          <div class="error">
            <p>The frontend application could not be found. Please check your build configuration.</p>
            <p>API endpoints are still available.</p>
          </div>
          <p>Server timestamp: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send('Something broke on the server!');
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
