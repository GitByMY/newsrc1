import { MongoClient } from 'mongodb';

// Use the same MongoDB URI as the server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Make sure the URI contains the 'crm' database name
let connectionURI = MONGODB_URI;
if (!connectionURI.includes('/crm?')) {
  // Replace the database name with 'crm'
  connectionURI = connectionURI.replace(/\/([^/?]+)(\?|$)/, '/crm$2');
}

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  console.log('Connecting to MongoDB...');
  
  try {
    const client = await MongoClient.connect(connectionURI);
    const db = client.db('crm'); // Use the crm database

    cachedClient = client;
    cachedDb = db;

    console.log('MongoDB connected successfully');
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;