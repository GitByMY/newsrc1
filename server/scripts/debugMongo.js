// Debug MongoDB connection
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/data1', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully');
  
  // Get the database
  const db = mongoose.connection.db;
  
  // List all collections
  db.listCollections().toArray()
    .then(collections => {
      console.log('Collections in database:');
      if (collections.length === 0) {
        console.log('No collections found');
      } else {
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
      }
      
      // Check if customers collection exists
      const customersCollection = collections.find(c => c.name === 'customers');
      if (customersCollection) {
        console.log('\nCustomers collection exists');
        
        // Count documents in customers collection
        return db.collection('customers').countDocuments();
      } else {
        console.log('\nCustomers collection does not exist');
        return 0;
      }
    })
    .then(count => {
      if (count > 0) {
        console.log(`There are ${count} documents in the customers collection`);
        
        // Get a sample of documents
        return db.collection('customers').find().limit(1).toArray();
      } else {
        console.log('No documents in the customers collection');
        return [];
      }
    })
    .then(docs => {
      if (docs.length > 0) {
        console.log('\nSample document:');
        console.log(JSON.stringify(docs[0], null, 2));
      }
      
      // Disconnect
      mongoose.disconnect();
    })
    .catch(err => {
      console.error('Error checking collections:', err);
      mongoose.disconnect();
    });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
}); 