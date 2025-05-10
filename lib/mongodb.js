// File: lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;