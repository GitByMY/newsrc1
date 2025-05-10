# MongoDB Setup and Troubleshooting

This document provides instructions for setting up and troubleshooting the MongoDB connection for the CRM application.

## Connection Information

- **Database Name**: `crm`
- **Collection Name**: `customers`
- **Connection URI**: `mongodb+srv://as5138:Jq7h3DahtbX4XIps@cluster0.bw2rbvf.mongodb.net/crm?retryWrites=true&w=majority`

## Setup Instructions

1. **Test the MongoDB Connection**

   Run the test connection script to verify that you can connect to the MongoDB Atlas cluster:

   ```bash
   cd server
   node scripts/testConnection.js
   ```

   This script will attempt to connect to the MongoDB database and list the collections.

2. **Ensure the Customers Collection Exists**

   Run the script to ensure the customers collection exists and has data:

   ```bash
   cd server
   node scripts/ensureCustomersCollection.js
   ```

   This script will create the customers collection if it doesn't exist and populate it with sample data.

3. **Start the Server**

   Start the server to handle API requests:

   ```bash
   cd server
   npm start
   ```

4. **Test the API**

   Navigate to the test page in your application to verify that the API is working correctly:

   ```
   http://localhost:5173/test
   ```

## Troubleshooting

If you're having issues connecting to the MongoDB database, try the following:

1. **Check MongoDB Atlas Status**

   Verify that your MongoDB Atlas cluster is running and accessible.

2. **Verify Connection String**

   Make sure the connection string is correct and includes the database name `crm`.

3. **Check Network Connectivity**

   Ensure that your network allows connections to MongoDB Atlas.

4. **Check for Errors in the Console**

   Look for error messages in the server console that might indicate what's wrong.

5. **Run the Fix Database Script**

   If the database structure seems corrupted, run the fix database script:

   ```bash
   cd server
   node fixDb.js
   ```

## MongoDB Schema

The customers collection uses the following schema:

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  company: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'lead'], default: 'active' },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  lastOrderDate: { type: Date }
}
```

## API Endpoints

- **GET /api/customers** - Get all customers
- **GET /api/customers/:id** - Get a single customer by ID
- **POST /api/customers** - Create a new customer
- **PUT /api/customers/:id** - Update a customer
- **DELETE /api/customers/:id** - Delete a customer
- **POST /api/customers/delete-many** - Delete multiple customers