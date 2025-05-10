import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const { client, db } = await connectToDatabase();
    
    // Check if collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    console.log('Collections in database:', collectionNames);
    
    // Initialize customers collection if it doesn't exist
    if (!collectionNames.includes('customers')) {
      console.log('Customers collection not found. Creating it with sample data...');
      
      const customersCollection = db.collection('customers');
      
      // Create sample customers
      const sampleCustomers = [
        {
          name: 'Sample Customer',
          email: 'sample@example.com',
          phone: '555-1234',
          company: 'Sample Company',
          status: 'active',
          tags: ['sample'],
          createdAt: new Date(),
          lastOrderDate: new Date()
        },
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-5678',
          company: 'ABC Corp',
          status: 'active',
          tags: ['vip', 'retail'],
          createdAt: new Date(),
          lastOrderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-9012',
          company: 'XYZ Inc',
          status: 'inactive',
          tags: ['wholesale'],
          createdAt: new Date(),
          lastOrderDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        }
      ];
      
      await customersCollection.insertMany(sampleCustomers);
      console.log('Created customers collection with sample data');
    }
    
    // Initialize campaigns collection if it doesn't exist
    if (!collectionNames.includes('campaigns')) {
      console.log('Campaigns collection not found. Creating it with sample data...');
      
      const campaignsCollection = db.collection('campaigns');
      
      // Create sample campaign
      const sampleCampaign = {
        name: 'Sample Campaign',
        audienceQuery: [
          { 
            field: 'totalSpend', 
            operator: '>', 
            value: '5000', 
            logicGate: 'AND' 
          },
          { 
            field: 'lastOrderDate', 
            operator: '>', 
            value: '2024-01-01' 
          }
        ],
        summary: 'This is a sample campaign targeting high-value customers',
        audienceSize: 100,
        sentCount: 95,
        failedCount: 5,
        deliveryRatio: 0.95,
        status: 'completed',
        createdAt: new Date()
      };
      
      await campaignsCollection.insertOne(sampleCampaign);
      console.log('Created campaigns collection with a sample document');
    }
    
    return res.status(200).json({
      message: 'Database initialization complete',
      collections: collectionNames
    });
  } catch (err) {
    console.error('Database initialization error:', err);
    return res.status(500).json({ error: 'Database initialization failed', details: err.message });
  }
} 